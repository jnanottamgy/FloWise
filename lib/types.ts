// Shared domain types for FloWise. Everything is scoped to a Business.

export type InvoiceStatus = "paid" | "paid_late" | "unpaid";

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paidDate: string | null; // YYYY-MM-DD or null
  status: InvoiceStatus;
}

export type Risk = "green" | "yellow" | "red";

export interface EnrichedInvoice extends Invoice {
  /** dueDate - TODAY, in whole days (negative = overdue). */
  daysToDue: number;
  /** Unpaid AND past its due date. */
  overdue: boolean;
  /** This client has at least one paid_late invoice in the dataset. */
  clientHasLateHistory: boolean;
  /** Code-computed risk band — never set by AI. */
  risk: Risk;
  /** One-line AI reason for flagged invoices (filled in E2); null otherwise. */
  aiReason: string | null;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  email: string;
  invoices: Invoice[];
}

/** Business without its invoices — safe to return from list/read endpoints. */
export type BusinessMeta = Pick<
  Business,
  "id" | "name" | "industry" | "email"
>;

export interface BusinessSummaryCard extends BusinessMeta {
  invoiceCount: number;
  outstanding: number;
  flaggedCount: number;
}

export interface MonthlyPoint {
  month: string; // YYYY-MM
  label: string; // e.g. "May"
  collected: number; // amount received in that month
  outstanding: number; // cumulative unpaid at that month's end
}

export interface ClientBreakdown {
  client: string;
  outstanding: number;
  invoiceCount: number;
  flaggedCount: number;
  hasLateHistory: boolean;
}

export interface Metrics {
  outstanding: number;
  overdue: number;
  flaggedCount: number;
  collected90d: number;
  collectionRatePct: number;
  totalInvoices: number;
  clientCount: number;
  monthly: MonthlyPoint[];
  clients: ClientBreakdown[];
}

export interface SummaryResponse {
  business: BusinessMeta;
  metrics: Metrics;
  aiSummary: string;
}

export interface InvoicesResponse {
  business: BusinessMeta;
  invoices: EnrichedInvoice[];
}

// ---------------------------------------------------------------------------
// Transactions — all money movement (UPI / bank / cash), business + personal.
// ---------------------------------------------------------------------------

export type TxnDirection = "in" | "out";
export type TxnMode = "upi" | "neft" | "imps" | "rtgs" | "card" | "cash" | "cheque";
export type TxnScope = "business" | "personal" | "unsure";
export type TxnSource = "bank" | "upi" | "cash" | "manual";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string; // raw narration
  counterparty: string;
  amount: number; // positive
  direction: TxnDirection;
  mode: TxnMode;
  scope: TxnScope;
  category: string; // materials, rent, utilities, salaries, tax, software, labour, sales, groceries, education, entertainment, fuel, dining, other
  source: TxnSource;
  recurring: boolean;
  tiedToStock: boolean;
}

export interface RecurringItem {
  counterparty: string;
  monthlyAmount: number;
  occurrences: number;
  category: string;
  scope: TxnScope;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface ModeTotal {
  mode: TxnMode;
  inAmount: number;
  outAmount: number;
}

export interface MoneyMetrics {
  bankBalance: number;
  moneyIn: number;
  moneyOut: number;
  net: number;
  businessIn: number;
  businessOut: number;
  personalOut: number;
  unsureCount: number;
  // Real-cash / runway
  lockedInStock: number;
  committedRecurring: number;
  realFreeCash: number;
  avgWeeklyOutflow: number;
  runwayWeeks: number;
  // Breakdowns
  byMode: ModeTotal[];
  byCategory: CategoryTotal[]; // business outflow by category (tax drawer)
  recurring: RecurringItem[];
  recurringMonthlyTotal: number;
}

export interface TransactionsResponse {
  business: BusinessMeta;
  transactions: Transaction[];
  metrics: MoneyMetrics;
}
