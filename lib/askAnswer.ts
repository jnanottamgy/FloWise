// A computed, plain-language answer for common owner questions — used as the
// fallback for Ask FloWise so the copilot NEVER dodges with "try asking X".
// Localised (en/hi/kn) so a Hindi/Kannada owner gets an answer in their language
// even when the model is slow, unavailable, or its extraction fails.
import { formatINR } from "./format";
import { categoryLabel } from "./labels";
import type { Lang } from "./i18n";

export interface AskContext {
  businessName: string;
  outstanding: number;
  overdue: number;
  collected90d: number;
  topDebtors: { client: string; amount: number; overdue: boolean; days: number }[];
  realFreeCash: number;
  committedRecurring: number;
  moneyIn: number;
  moneyOut: number;
  byCategory: { category: string; amount: number }[];
  recurring: { counterparty: string; monthlyAmount: number; category: string }[];
}

function pick(lang: Lang, en: string, hi: string, kn: string): string {
  return lang === "hi" ? hi : lang === "kn" ? kn : en;
}

export function deterministicAnswer(
  question: string,
  c: AskContext,
  lang: Lang = "en",
): string {
  const q = question.toLowerCase();
  const rs = (n: number) => formatINR(n);
  // realFreeCash already nets out money tied in stock AND this month's bills, so
  // it IS the safe-to-spend figure — don't subtract the bills a second time.
  const safeToSpend = c.realFreeCash;
  const cat = (k: string) => categoryLabel(k, lang);

  // Can I buy inventory / afford to spend
  if (/(inventory|stock|buy|purchase|afford|spend|invest|order|restock)/.test(q)) {
    return pick(
      lang,
      `After setting aside ${rs(c.committedRecurring)} for this month's bills and the money already tied up in stock, you have about ${rs(safeToSpend)} free — that's what you can comfortably put into new stock this week.`,
      `इस महीने के ${rs(c.committedRecurring)} बिल और स्टॉक में लगे पैसे को अलग रखने के बाद, आपके पास लगभग ${rs(safeToSpend)} बचते हैं — इतना आप इस हफ्ते नए स्टॉक में लगा सकते हैं।`,
      `ಈ ತಿಂಗಳ ${rs(c.committedRecurring)} ಬಿಲ್ ಮತ್ತು ಸ್ಟಾಕ್‌ನಲ್ಲಿ ತೊಡಗಿಸಿದ ಹಣವನ್ನು ಪಕ್ಕಕ್ಕಿಟ್ಟ ನಂತರ, ನಿಮ್ಮ ಬಳಿ ಸುಮಾರು ${rs(safeToSpend)} ಉಳಿಯುತ್ತದೆ — ಇಷ್ಟನ್ನು ಈ ವಾರ ಹೊಸ ಸ್ಟಾಕ್‌ಗೆ ಹಾಕಬಹುದು.`,
    );
  }

  // Enough for salaries / staff
  if (/(salary|salaries|staff|payroll|wages|workers|pay.*people)/.test(q)) {
    const sal = c.recurring.find((r) => /salar|payroll|wage|staff/i.test(r.category + r.counterparty));
    if (sal) {
      return c.realFreeCash >= sal.monthlyAmount
        ? pick(
            lang,
            `Yes — salaries are about ${rs(sal.monthlyAmount)} and you have ${rs(c.realFreeCash)} free, so you're covered.`,
            `हाँ — तनख्वाह लगभग ${rs(sal.monthlyAmount)} है और आपके पास ${rs(c.realFreeCash)} खाली हैं, तो काम हो जाएगा।`,
            `ಹೌದು — ಸಂಬಳ ಸುಮಾರು ${rs(sal.monthlyAmount)}, ನಿಮ್ಮ ಬಳಿ ${rs(c.realFreeCash)} ಇದೆ, ಹಾಗಾಗಿ ಸಾಕಾಗುತ್ತದೆ.`,
          )
        : pick(
            lang,
            `Salaries are about ${rs(sal.monthlyAmount)} but you have only ${rs(c.realFreeCash)} free right now — collect a payment first to be safe.`,
            `तनख्वाह लगभग ${rs(sal.monthlyAmount)} है पर अभी आपके पास सिर्फ ${rs(c.realFreeCash)} खाली हैं — सुरक्षित रहने के लिए पहले कोई वसूली कर लें।`,
            `ಸಂಬಳ ಸುಮಾರು ${rs(sal.monthlyAmount)}, ಆದರೆ ಈಗ ನಿಮ್ಮ ಬಳಿ ಕೇವಲ ${rs(c.realFreeCash)} ಇದೆ — ಸುರಕ್ಷಿತವಾಗಿರಲು ಮೊದಲು ಒಂದು ವಸೂಲಿ ಮಾಡಿ.`,
          );
    }
    return pick(
      lang,
      `You have ${rs(c.realFreeCash)} free right now to cover salaries and other bills.`,
      `तनख्वाह और बाकी बिल के लिए अभी आपके पास ${rs(c.realFreeCash)} खाली हैं।`,
      `ಸಂಬಳ ಮತ್ತು ಇತರ ಬಿಲ್‌ಗಳಿಗೆ ಈಗ ನಿಮ್ಮ ಬಳಿ ${rs(c.realFreeCash)} ಇದೆ.`,
    );
  }

  // Who owes me / collections
  if (/(owe|owes|owed|collect|receivab|pay me|to receive|pending|outstanding|customers.*money)/.test(q)) {
    if (!c.topDebtors.length)
      return pick(
        lang,
        `Good news — no one owes you money right now, everything is paid.`,
        `अच्छी खबर — अभी किसी को आपका पैसा नहीं देना है, सब चुका है।`,
        `ಒಳ್ಳೆಯ ಸುದ್ದಿ — ಈಗ ಯಾರೂ ನಿಮಗೆ ಹಣ ಕೊಡಬೇಕಿಲ್ಲ, ಎಲ್ಲಾ ಪಾವತಿಯಾಗಿದೆ.`,
      );
    const top = c.topDebtors[0];
    const d1 = c.topDebtors[1];
    const overdueBit = top.overdue
      ? pick(lang, `, ${top.days} days overdue`, `, ${top.days} दिन बकाया`, `, ${top.days} ದಿನ ಬಾಕಿ`)
      : "";
    const next = d1
      ? pick(
          lang,
          ` Next is ${d1.client} (${rs(d1.amount)}).`,
          ` उसके बाद ${d1.client} (${rs(d1.amount)})।`,
          ` ನಂತರ ${d1.client} (${rs(d1.amount)}).`,
        )
      : "";
    return pick(
      lang,
      `${rs(c.outstanding)} is owed to you in total. ${top.client} owes the most — ${rs(top.amount)}${overdueBit}.${next}`,
      `कुल ${rs(c.outstanding)} आपको मिलना बाकी है। सबसे ज्यादा ${top.client} को देना है — ${rs(top.amount)}${overdueBit}।${next}`,
      `ಒಟ್ಟು ${rs(c.outstanding)} ನಿಮಗೆ ಬರಬೇಕಿದೆ. ಅತಿ ಹೆಚ್ಚು ${top.client} ಕೊಡಬೇಕು — ${rs(top.amount)}${overdueBit}.${next}`,
    );
  }

  // Overdue / late
  if (/(overdue|late|not paid|delay|pending payment)/.test(q)) {
    const od = c.topDebtors.filter((d) => d.overdue);
    if (!od.length)
      return pick(
        lang,
        `Nothing is overdue right now — nicely done.`,
        `अभी कुछ भी बकाया नहीं है — बढ़िया।`,
        `ಈಗ ಏನೂ ಬಾಕಿ ಇಲ್ಲ — ಚೆನ್ನಾಗಿದೆ.`,
      );
    const total = rs(od.reduce((s, d) => s + d.amount, 0));
    const b = od[0];
    return pick(
      lang,
      `${od.length} payment${od.length > 1 ? "s are" : " is"} overdue, worth ${total}. Biggest: ${b.client} (${rs(b.amount)}, ${b.days} days late).`,
      `${od.length} भुगतान बकाया हैं, कुल ${total}। सबसे बड़ा: ${b.client} (${rs(b.amount)}, ${b.days} दिन देर)।`,
      `${od.length} ಪಾವತಿ ಬಾಕಿ ಇದೆ, ಒಟ್ಟು ${total}. ಅತಿ ದೊಡ್ಡದು: ${b.client} (${rs(b.amount)}, ${b.days} ದಿನ ತಡ).`,
    );
  }

  // Why is cash reducing
  if (/(reducing|going down|dropping|losing|drain|why.*cash|cash.*(low|less|short)|running out)/.test(q)) {
    const top = c.byCategory[0];
    const drain = top
      ? `${cat(top.category)} (${rs(top.amount)})`
      : pick(lang, "your regular bills", "आपके नियमित बिल", "ನಿಮ್ಮ ನಿಯಮಿತ ಬಿಲ್‌ಗಳು");
    return pick(
      lang,
      `Recently ${rs(c.moneyOut)} went out and ${rs(c.moneyIn)} came in. The biggest drains are ${drain} and about ${rs(c.committedRecurring)}/month in recurring bills. Collecting the ${rs(c.outstanding)} owed to you would help most.`,
      `हाल में ${rs(c.moneyOut)} बाहर गए और ${rs(c.moneyIn)} आए। सबसे ज्यादा खर्च ${drain} और हर महीने लगभग ${rs(c.committedRecurring)} के नियमित बिल में है। आपका बकाया ${rs(c.outstanding)} वसूलना सबसे ज्यादा मदद करेगा।`,
      `ಇತ್ತೀಚೆಗೆ ${rs(c.moneyOut)} ಹೊರಹೋಗಿದೆ, ${rs(c.moneyIn)} ಬಂದಿದೆ. ಅತಿ ಹೆಚ್ಚು ಖರ್ಚು ${drain} ಮತ್ತು ಪ್ರತಿ ತಿಂಗಳ ಸುಮಾರು ${rs(c.committedRecurring)} ನಿಯಮಿತ ಬಿಲ್‌ಗಳಲ್ಲಿ. ನಿಮಗೆ ಬರಬೇಕಾದ ${rs(c.outstanding)} ವಸೂಲಿ ಮಾಡಿದರೆ ಹೆಚ್ಚು ಸಹಾಯವಾಗುತ್ತದೆ.`,
    );
  }

  // Biggest expense
  if (/(biggest|most|largest|highest|main).*(expense|spend|cost|bill|going)|where.*money.*go/.test(q)) {
    const top = c.byCategory[0];
    if (!top)
      return pick(
        lang,
        `No major business expenses recorded yet.`,
        `अभी तक कोई बड़ा व्यापारिक खर्च दर्ज नहीं है।`,
        `ಇನ್ನೂ ಯಾವುದೇ ದೊಡ್ಡ ವ್ಯಾಪಾರ ಖರ್ಚು ದಾಖಲಾಗಿಲ್ಲ.`,
      );
    const d1 = c.byCategory[1];
    const next = d1
      ? pick(
          lang,
          ` Then ${cat(d1.category)} (${rs(d1.amount)}).`,
          ` फिर ${cat(d1.category)} (${rs(d1.amount)})।`,
          ` ನಂತರ ${cat(d1.category)} (${rs(d1.amount)}).`,
        )
      : "";
    return pick(
      lang,
      `Your biggest business expense is ${cat(top.category)} at ${rs(top.amount)}.${next}`,
      `आपका सबसे बड़ा व्यापारिक खर्च ${cat(top.category)} है — ${rs(top.amount)}।${next}`,
      `ನಿಮ್ಮ ಅತಿ ದೊಡ್ಡ ವ್ಯಾಪಾರ ಖರ್ಚು ${cat(top.category)} — ${rs(top.amount)}.${next}`,
    );
  }

  // Profit / net
  if (/(profit|net|making money|earning|surplus|loss)/.test(q)) {
    const net = c.moneyIn - c.moneyOut;
    return net >= 0
      ? pick(
          lang,
          `Money in was ${rs(c.moneyIn)} and out was ${rs(c.moneyOut)} — a surplus of ${rs(net)}.`,
          `${rs(c.moneyIn)} आए और ${rs(c.moneyOut)} गए — ${rs(net)} का फायदा।`,
          `${rs(c.moneyIn)} ಬಂದಿದೆ, ${rs(c.moneyOut)} ಹೋಗಿದೆ — ${rs(net)} ಉಳಿತಾಯ.`,
        )
      : pick(
          lang,
          `Recently ${rs(c.moneyOut)} went out and ${rs(c.moneyIn)} came in — ${rs(Math.abs(net))} more going out. Collecting the ${rs(c.outstanding)} owed to you would balance it.`,
          `हाल में ${rs(c.moneyOut)} गए और ${rs(c.moneyIn)} आए — ${rs(Math.abs(net))} ज्यादा बाहर गए। आपका बकाया ${rs(c.outstanding)} वसूलने से संतुलन बनेगा।`,
          `ಇತ್ತೀಚೆಗೆ ${rs(c.moneyOut)} ಹೋಗಿದೆ, ${rs(c.moneyIn)} ಬಂದಿದೆ — ${rs(Math.abs(net))} ಹೆಚ್ಚು ಹೊರಹೋಗಿದೆ. ನಿಮಗೆ ಬರಬೇಕಾದ ${rs(c.outstanding)} ವಸೂಲಿ ಮಾಡಿದರೆ ಸರಿಹೊಂದುತ್ತದೆ.`,
        );
  }

  // Spend on a specific category (labour, rent, transport…)
  const catMatch = c.byCategory.find(
    (x) => q.includes(x.category) || q.includes(categoryLabel(x.category).toLowerCase().split(" ")[0]),
  );
  if (catMatch) {
    return pick(
      lang,
      `You've spent ${rs(catMatch.amount)} on ${cat(catMatch.category)} recently.`,
      `हाल में आपने ${cat(catMatch.category)} पर ${rs(catMatch.amount)} खर्च किए हैं।`,
      `ಇತ್ತೀಚೆಗೆ ನೀವು ${cat(catMatch.category)} ಗೆ ${rs(catMatch.amount)} ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ.`,
    );
  }

  // What should I do today
  if (/(what should i do|today|priorit|next|focus|first)/.test(q)) {
    const top = c.topDebtors[0];
    if (!top)
      return pick(
        lang,
        `You're in good shape — ${rs(c.realFreeCash)} free and nothing overdue. Keep collecting on time.`,
        `आप अच्छी स्थिति में हैं — ${rs(c.realFreeCash)} खाली और कुछ बकाया नहीं। समय पर वसूली करते रहें।`,
        `ನೀವು ಒಳ್ಳೆಯ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದೀರಿ — ${rs(c.realFreeCash)} ಲಭ್ಯ, ಏನೂ ಬಾಕಿ ಇಲ್ಲ. ಸಮಯಕ್ಕೆ ವಸೂಲಿ ಮುಂದುವರಿಸಿ.`,
      );
    const overdueBit = top.overdue
      ? pick(lang, ` (${top.days} days overdue)`, ` (${top.days} दिन बकाया)`, ` (${top.days} ದಿನ ಬಾಕಿ)`)
      : "";
    return pick(
      lang,
      `Today: chase ${top.client} for ${rs(top.amount)}${overdueBit}, and keep ${rs(c.committedRecurring)} aside for this month's bills. You have ${rs(c.realFreeCash)} free.`,
      `आज: ${top.client} से ${rs(top.amount)}${overdueBit} वसूलें, और इस महीने के बिल के लिए ${rs(c.committedRecurring)} अलग रखें। आपके पास ${rs(c.realFreeCash)} खाली हैं।`,
      `ಇಂದು: ${top.client} ಅವರಿಂದ ${rs(top.amount)}${overdueBit} ವಸೂಲಿ ಮಾಡಿ, ಈ ತಿಂಗಳ ಬಿಲ್‌ಗಳಿಗೆ ${rs(c.committedRecurring)} ಪಕ್ಕಕ್ಕಿಡಿ. ನಿಮ್ಮ ಬಳಿ ${rs(c.realFreeCash)} ಇದೆ.`,
    );
  }

  // Default: a useful one-liner
  return pick(
    lang,
    `Here's the picture: ${rs(c.realFreeCash)} free to spend, ${rs(c.outstanding)} owed to you by customers, and about ${rs(c.committedRecurring)} in bills each month.`,
    `पूरी तस्वीर: ${rs(c.realFreeCash)} खर्च के लिए खाली, ग्राहकों से ${rs(c.outstanding)} मिलना बाकी, और हर महीने लगभग ${rs(c.committedRecurring)} के बिल।`,
    `ಒಟ್ಟಾರೆ ಚಿತ್ರ: ${rs(c.realFreeCash)} ಖರ್ಚಿಗೆ ಲಭ್ಯ, ಗ್ರಾಹಕರಿಂದ ${rs(c.outstanding)} ಬರಬೇಕಿದೆ, ಮತ್ತು ಪ್ರತಿ ತಿಂಗಳು ಸುಮಾರು ${rs(c.committedRecurring)} ಬಿಲ್‌ಗಳು.`,
  );
}
