// Client-safe parsers: a one-line natural-language entry, and a bank/UPI
// statement CSV. Deterministic → instant and reliable.
import type { Transaction, TxnMode, TxnScope } from "./types";
import { TODAY } from "./riskEngine";

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/rent|lease/i, "rent"],
  [/salary|salaries|payroll|wages|staff/i, "salaries"],
  [/labour|labor|loading|coolie|daily wage/i, "labour"],
  [/yarn|cloth|fabric|material|stock|raw|beans|milk|dairy/i, "materials"],
  [/electric|water|bescom|utility|bill/i, "utilities"],
  [/gst|tax|tds/i, "tax"],
  [/transport|freight|logistics|courier|delivery/i, "transport"],
  [/packag|carton|box/i, "packaging"],
  [/software|saas|subscription|tally|adobe|figma|hosting|zoho/i, "software"],
  [/netflix|spotify|prime|hotstar/i, "entertainment"],
  [/grocery|groceries|reliance fresh|bigbasket|dmart|supermarket/i, "groceries"],
  [/school|fees|tuition|college/i, "education"],
  [/fuel|petrol|diesel|iocl|hpcl|bharat petrol/i, "fuel"],
  [/restaurant|dining|swiggy|zomato|hotel|cafe/i, "dining"],
  [/sale|counter|customer|invoice|received|paid by/i, "sales"],
];

const PERSONAL = /grocer|school|fees|tuition|netflix|spotify|restaurant|dining|movie|personal|family/i;
const IN_WORDS = /received|got|sale|sold|collected|credit|deposit|income|paid by/i;

function guessCategory(text: string): string {
  for (const [re, cat] of CATEGORY_KEYWORDS) if (re.test(text)) return cat;
  return "other";
}
function guessScope(text: string): TxnScope {
  return PERSONAL.test(text) ? "personal" : "business";
}
function guessMode(text: string): TxnMode {
  if (/upi|@|gpay|phonepe|paytm|ybl|okhdfc|okicici|okaxis/i.test(text)) return "upi";
  if (/neft/i.test(text)) return "neft";
  if (/imps/i.test(text)) return "imps";
  if (/rtgs/i.test(text)) return "rtgs";
  if (/cheque|chq/i.test(text)) return "cheque";
  if (/card|pos|debit card|credit card/i.test(text)) return "card";
  return "cash";
}

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
}

/** Parse a single free-text entry OR a bank/UPI SMS.
 *  e.g. "paid 2000 to Surya Yarns for stock"
 *       "Rs.5000 credited to A/c XX1234 on 18-Jul from MERIDIAN RETAIL via UPI" */
export function parseQuickEntry(text: string): Transaction | null {
  const t = text.trim();
  if (!t) return null;

  // Amount: prefer the value after Rs / INR / ₹ so we don't grab an a/c number.
  const rsMatch = t.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const numMatch = t.match(/(\d[\d,]*(?:\.\d+)?)/);
  const amountStr = rsMatch ? rsMatch[1] : numMatch ? numMatch[1] : null;
  if (!amountStr) return null;
  const amount = Math.round(Number(amountStr.replace(/,/g, "")));
  if (!amount) return null;

  // Direction: bank-SMS verbs first, then general words.
  const direction: "in" | "out" = /\b(debited|debit|sent|withdrawn|paid|spent|purchase)\b/i.test(t)
    ? "out"
    : /\b(credited|credit|received|deposit|refund)\b/i.test(t) || IN_WORDS.test(t)
      ? "in"
      : "out";

  // Counterparty: name after to/from, trimmed at SMS noise.
  let counterparty = "";
  const toFrom = t.match(/\b(?:to|from)\s+([A-Za-z0-9&.\s]{2,40})/i);
  if (toFrom) {
    counterparty = toFrom[1]
      .split(/\b(?:on|ref|upi|dated|at|via|a\/c|acct|account|bank|avl)\b/i)[0]
      .replace(/\bfor\b.*$/i, "")
      .trim();
  }
  if (!counterparty) {
    counterparty = t
      .replace(amountStr, "")
      .replace(/\b(paid|spent|bought|gave|sent|received|got|sold|collected|credited|debited|rs|inr|₹|to|from|for|the|a|via|upi)\b/gi, "")
      .trim();
  }
  counterparty = (counterparty || "Cash entry").replace(/\s+/g, " ").slice(0, 40);
  counterparty = counterparty.charAt(0).toUpperCase() + counterparty.slice(1);

  return {
    id: newId("M"),
    date: TODAY,
    description: t,
    counterparty,
    amount,
    direction,
    mode: guessMode(t),
    // Leave manual entries for the owner to classify (business vs personal).
    scope: "unsure",
    category: direction === "in" ? "sales" : guessCategory(t),
    source: "manual",
    recurring: false,
    tiedToStock: /stock|yarn|material|inventory|goods/i.test(t),
  };
}

// ---- Bank / UPI statement CSV --------------------------------------------

function normalizeDate(s: string): string {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/); // DD/MM/YYYY
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return TODAY;
}

function findCol(headers: string[], patterns: RegExp[]): number {
  return headers.findIndex((h) => patterns.some((p) => p.test(h)));
}

function extractCounterparty(narration: string): string {
  // UPI-NAME-vpa / NEFT/NAME/ref → take the NAME chunk.
  const parts = narration.split(/[-/]/).map((s) => s.trim()).filter(Boolean);
  const skip = /^(upi|neft|imps|rtgs|bil|ach|dr|cr|ref|txn|to|from)$/i;
  const name = parts.find((p) => !skip.test(p) && /[a-z]/i.test(p) && p.length > 2);
  return (name || narration).slice(0, 40);
}

export interface StatementResult {
  transactions: Transaction[];
  errors: string[];
}

/** Parse a bank/UPI statement CSV (Date, Narration, Debit, Credit, [Balance]). */
export function parseStatementCSV(text: string): StatementResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { transactions: [], errors: ["Need a header row and at least one transaction."] };
  }
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateCol = findCol(headers, [/date/]);
  const narrCol = findCol(headers, [/narration|description|particular|details|remarks/]);
  const debitCol = findCol(headers, [/debit|withdraw/]);
  const creditCol = findCol(headers, [/credit|deposit/]);
  const amountCol = findCol(headers, [/^amount$/]);

  if (dateCol === -1 || narrCol === -1 || (debitCol === -1 && creditCol === -1 && amountCol === -1)) {
    return {
      transactions: [],
      errors: ["Couldn't find Date, Narration and Debit/Credit columns."],
    };
  }

  const errors: string[] = [];
  const transactions: Transaction[] = [];
  const num = (s: string) => Number((s || "").replace(/[₹,\s]/g, "")) || 0;

  lines.slice(1).forEach((line, i) => {
    const cells = line.split(",");
    const narration = (cells[narrCol] ?? "").trim();
    if (!narration) return;
    const debit = debitCol >= 0 ? num(cells[debitCol]) : 0;
    const credit = creditCol >= 0 ? num(cells[creditCol]) : 0;
    let amount = credit || debit;
    let direction: "in" | "out" = credit > 0 ? "in" : "out";
    if (amountCol >= 0 && !amount) {
      const a = num(cells[amountCol]);
      amount = Math.abs(a);
      direction = a >= 0 ? "in" : "out";
    }
    if (!amount) {
      errors.push(`Row ${i + 1}: no amount`);
      return;
    }
    transactions.push({
      id: newId("S"),
      date: normalizeDate(cells[dateCol] ?? ""),
      description: narration,
      counterparty: extractCounterparty(narration),
      amount: Math.round(amount),
      direction,
      mode: guessMode(narration),
      scope: guessScope(narration),
      category: direction === "in" ? "sales" : guessCategory(narration),
      source: "bank",
      recurring: false,
      tiedToStock: /stock|yarn|material|inventory/i.test(narration),
    });
  });

  if (!transactions.length && !errors.length) errors.push("No transactions found.");
  return { transactions, errors };
}

export const STATEMENT_TEMPLATE_CSV = `Date,Narration,Debit,Credit,Balance
2026-07-14,UPI-COUNTER SALE-various@ybl,,15400,215400
2026-07-15,NEFT/SRI BALAJI PROPERTIES/RENT,25000,,190400
2026-07-16,UPI-RELIANCE FRESH-groceries,4200,,186200`;
