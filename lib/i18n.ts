// Lightweight i18n for FloWise — English, Hindi, Kannada.
export type Lang = "en" | "hi" | "kn";

export const LANGS: { key: Lang; native: string }[] = [
  { key: "en", native: "English" },
  { key: "hi", native: "हिंदी" },
  { key: "kn", native: "ಕನ್ನಡ" },
];

type Entry = { en: string; hi: string; kn: string };

export const STRINGS: Record<string, Entry> = {
  // Nav
  "nav.home": { en: "Home", hi: "होम", kn: "ಮುಖಪುಟ" },
  "nav.todo": { en: "To-do", hi: "काम", kn: "ಕೆಲಸ" },
  "nav.customers": { en: "Customers", hi: "ग्राहक", kn: "ಗ್ರಾಹಕರು" },
  "nav.cash": { en: "Cash flow", hi: "कैश", kn: "ನಗದು" },
  "nav.cashShort": { en: "Cash", hi: "कैश", kn: "ನಗದು" },
  "nav.more": { en: "More", hi: "और", kn: "ಇನ್ನಷ್ಟು" },

  // Header
  "header.greeting": { en: "Good morning", hi: "सुप्रभात", kn: "ಶುಭೋದಯ" },
  "header.subtitle": {
    en: "your cash flow at a glance",
    hi: "आपके पैसे की पूरी जानकारी",
    kn: "ನಿಮ್ಮ ಹಣದ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ",
  },
  "header.search": { en: "Search invoices…", hi: "इनवॉइस खोजें…", kn: "ಇನ್‌ವಾಯ್ಸ್ ಹುಡುಕಿ…" },
  "common.export": { en: "Export", hi: "एक्सपोर्ट", kn: "ಎಕ್ಸ್‌ಪೋರ್ಟ್" },

  // Hero
  "hero.available": { en: "Cash available today", hi: "आज उपलब्ध पैसा", kn: "ಇಂದು ಲಭ್ಯವಿರುವ ಹಣ" },
  "hero.free": { en: "free to spend", hi: "खर्च के लिए", kn: "ಖರ್ಚಿಗೆ" },
  "hero.enough": {
    en: "Enough cash for the next {days} days",
    hi: "अगले {days} दिन के लिए पर्याप्त पैसा",
    kn: "ಮುಂದಿನ {days} ದಿನಗಳಿಗೆ ಸಾಕಷ್ಟು ಹಣ",
  },
  "hero.watch": {
    en: "Comfortable, but keep an eye on cash in about {days} days",
    hi: "ठीक है, पर लगभग {days} दिन में पैसे पर ध्यान दें",
    kn: "ಸರಿ, ಆದರೆ ಸುಮಾರು {days} ದಿನಗಳಲ್ಲಿ ಹಣದ ಮೇಲೆ ಗಮನವಿರಲಿ",
  },
  "hero.short": {
    en: "Cash may run short in about {days} days",
    hi: "लगभग {days} दिन में पैसे की कमी हो सकती है",
    kn: "ಸುಮಾರು {days} ದಿನಗಳಲ್ಲಿ ಹಣ ಕಡಿಮೆಯಾಗಬಹುದು",
  },
  "hero.view": { en: "View details", hi: "जानकारी देखें", kn: "ವಿವರ ನೋಡಿ" },
  "hero.hide": { en: "Hide details", hi: "जानकारी छिपाएं", kn: "ವಿವರ ಮರೆಮಾಡಿ" },
  "hero.inBank": { en: "In the bank", hi: "बैंक में", kn: "ಬ್ಯಾಂಕಿನಲ್ಲಿ" },
  "hero.stock": { en: "Tied in stock", hi: "माल में फंसा", kn: "ಸ್ಟಾಕ್‌ನಲ್ಲಿ" },
  "hero.bills": { en: "Regular bills", hi: "नियमित बिल", kn: "ನಿಯಮಿತ ಬಿಲ್‌ಗಳು" },

  // Action list
  "act.title": { en: "Do this today", hi: "आज ये करें", kn: "ಇಂದು ಇದನ್ನು ಮಾಡಿ" },
  "act.sub": {
    en: "Your top priorities, in order",
    hi: "आपके जरूरी काम, क्रम में",
    kn: "ನಿಮ್ಮ ಮುಖ್ಯ ಕೆಲಸಗಳು, ಕ್ರಮದಲ್ಲಿ",
  },
  "act.sendWa": { en: "Send to WhatsApp", hi: "व्हाट्सएप पर भेजें", kn: "ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಿ" },
  "act.allDone": { en: "All done for today", hi: "आज के लिए सब हो गया", kn: "ಇಂದಿನ ಎಲ್ಲಾ ಕೆಲಸ ಮುಗಿದಿದೆ" },
  "act.nothing": {
    en: "Nothing needs your attention right now.",
    hi: "अभी कुछ करने की जरूरत नहीं।",
    kn: "ಈಗ ಏನೂ ಗಮನ ಬೇಕಿಲ್ಲ.",
  },
  "act.collect": { en: "Collect", hi: "वसूलें", kn: "ವಸೂಲಿ" },
  "act.remind": { en: "Remind", hi: "याद दिलाएं", kn: "ನೆನಪಿಸಿ" },
  "act.markPaid": { en: "Mark paid", hi: "भुगतान हुआ", kn: "ಪಾವತಿಸಿದೆ" },
  "act.confirmPaid": { en: "Confirm?", hi: "पक्का?", kn: "ಖಚಿತವೇ?" },
  "act.cancel": { en: "Cancel", hi: "रद्द करें", kn: "ರದ್ದುಮಾಡಿ" },
  "act.undo": { en: "Undo", hi: "वापस लें", kn: "ರದ್ದುಗೊಳಿಸಿ" },
  "act.paidToast": { en: "Marked paid", hi: "भुगतान दर्ज किया", kn: "ಪಾವತಿ ದಾಖಲಿಸಲಾಗಿದೆ" },
  "act.seeWhy": { en: "See why", hi: "क्यों देखें", kn: "ಏಕೆ ನೋಡಿ" },
  "act.greetBrief": { en: "Good morning! Today for", hi: "सुप्रभात! आज", kn: "ಶುಭೋದಯ! ಇಂದು" },
  "act.cashFree": { en: "Cash free to spend", hi: "खर्च के लिए पैसा", kn: "ಖರ್ಚಿಗೆ ಲಭ್ಯ ಹಣ" },

  // Action titles (dynamic)
  "act.collectFrom": {
    en: "Collect {amount} from {client}",
    hi: "{client} से {amount} वसूलें",
    kn: "{client} ಅವರಿಂದ {amount} ವಸೂಲಿ",
  },
  "act.overdue": { en: "{days} days overdue", hi: "{days} दिन बकाया", kn: "{days} ದಿನ ಬಾಕಿ" },
  "act.remindClient": {
    en: "Remind {client} — {amount}",
    hi: "{client} को याद दिलाएं — {amount}",
    kn: "{client} ಅವರಿಗೆ ನೆನಪಿಸಿ — {amount}",
  },
  "act.dueIn": { en: "due in {days} days", hi: "{days} दिन में देय", kn: "{days} ದಿನಗಳಲ್ಲಿ ಪಾವತಿ" },
  "act.payBill": {
    en: "Pay {name} — about {amount}",
    hi: "{name} को {amount} चुकाएं",
    kn: "{name} ಗೆ {amount} ಪಾವತಿಸಿ",
  },
  "act.monthlyBill": { en: "regular monthly bill", hi: "हर महीने का बिल", kn: "ಪ್ರತಿ ತಿಂಗಳ ಬಿಲ್" },
  "act.lowCash": {
    en: "Cash gets tight in about {days} days",
    hi: "लगभग {days} दिन में पैसे की तंगी",
    kn: "ಸುಮಾರು {days} ದಿನಗಳಲ್ಲಿ ಹಣದ ಕೊರತೆ",
  },
  "act.lowCashSub": {
    en: "Collect a payment early to stay safe",
    hi: "सुरक्षित रहने के लिए जल्दी वसूली करें",
    kn: "ಸುರಕ್ಷಿತವಾಗಿರಲು ಬೇಗ ವಸೂಲಿ ಮಾಡಿ",
  },

  // Forecast
  "fc.title": { en: "Will I run out of cash?", hi: "क्या पैसा खत्म हो जाएगा?", kn: "ಹಣ ಮುಗಿದುಹೋಗುತ್ತದೆಯೇ?" },
  "fc.sub": {
    en: "Money in your bank, over the next 90 days",
    hi: "अगले 90 दिन में बैंक का पैसा",
    kn: "ಮುಂದಿನ 90 ದಿನಗಳಲ್ಲಿ ಬ್ಯಾಂಕ್ ಹಣ",
  },
  "fc.today": { en: "Today", hi: "आज", kn: "ಇಂದು" },
  "fc.7": { en: "7 days", hi: "7 दिन", kn: "7 ದಿನ" },
  "fc.30": { en: "30 days", hi: "30 दिन", kn: "30 ದಿನ" },
  "fc.90": { en: "90 days", hi: "90 दिन", kn: "90 ದಿನ" },
  "fc.healthy": {
    en: "You're on track — your cash stays healthy for the next 90 days.",
    hi: "सब ठीक है — अगले 90 दिन आपका पैसा अच्छा रहेगा।",
    kn: "ಎಲ್ಲಾ ಸರಿ — ಮುಂದಿನ 90 ದಿನ ನಿಮ್ಮ ಹಣ ಚೆನ್ನಾಗಿರುತ್ತದೆ.",
  },
  "fc.watch": {
    en: "You're comfortable for about {days} days, but cash gets tight around {date}. Bringing in one payment early keeps you safe.",
    hi: "लगभग {days} दिन ठीक है, पर {date} के आसपास पैसे की तंगी होगी। एक वसूली जल्दी करने से सुरक्षित रहेंगे।",
    kn: "ಸುಮಾರು {days} ದಿನ ಸರಿ, ಆದರೆ {date} ರ ಸುಮಾರಿಗೆ ಹಣ ಕಡಿಮೆಯಾಗುತ್ತದೆ. ಒಂದು ವಸೂಲಿ ಬೇಗ ಮಾಡಿದರೆ ಸುರಕ್ಷಿತ.",
  },
  "fc.risky": {
    en: "Heads up — cash could run short in about {days} days (around {date}). Collect a couple of payments now to stay safe.",
    hi: "सावधान — लगभग {days} दिन ({date} के आसपास) में पैसे की कमी हो सकती है। अभी कुछ वसूली कर लें।",
    kn: "ಎಚ್ಚರ — ಸುಮಾರು {days} ದಿನಗಳಲ್ಲಿ ({date} ರ ಸುಮಾರಿಗೆ) ಹಣ ಕಡಿಮೆಯಾಗಬಹುದು. ಈಗಲೇ ಕೆಲವು ವಸೂಲಿ ಮಾಡಿ.",
  },

  // Money in / out
  "in.title": { en: "Money coming in", hi: "आने वाला पैसा", kn: "ಬರುವ ಹಣ" },
  "in.sub": {
    en: "Customers who owe you money",
    hi: "जिन ग्राहकों को आपको पैसा देना है",
    kn: "ನಿಮಗೆ ಹಣ ಕೊಡಬೇಕಾದ ಗ್ರಾಹಕರು",
  },
  "in.everyonePaid": { en: "Everyone has paid", hi: "सबने भुगतान कर दिया", kn: "ಎಲ್ಲರೂ ಪಾವತಿಸಿದ್ದಾರೆ" },
  "in.noPending": {
    en: "No pending collections right now.",
    hi: "अभी कोई वसूली बाकी नहीं।",
    kn: "ಈಗ ಯಾವುದೇ ವಸೂಲಿ ಬಾಕಿ ಇಲ್ಲ.",
  },
  "in.whatsapp": { en: "WhatsApp", hi: "व्हाट्सएप", kn: "ವಾಟ್ಸಾಪ್" },
  "out.title": { en: "Money going out", hi: "जाने वाला पैसा", kn: "ಹೋಗುವ ಹಣ" },
  "out.sub": { en: "Bills you pay every month", hi: "हर महीने के बिल", kn: "ಪ್ರತಿ ತಿಂಗಳು ಪಾವತಿಸುವ ಬಿಲ್" },
  "out.everyMonth": { en: "every month", hi: "हर महीने", kn: "ಪ್ರತಿ ತಿಂಗಳು" },

  // Ask
  "ask.title": { en: "Ask FloWise", hi: "फ्लोवाइज़ से पूछें", kn: "ಫ್ಲೋವೈಸ್‌ಗೆ ಕೇಳಿ" },
  "ask.sub": {
    en: "Ask anything about your money — answered from your own numbers",
    hi: "अपने पैसे के बारे में कुछ भी पूछें — आपके अपने आँकड़ों से जवाब",
    kn: "ನಿಮ್ಮ ಹಣದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ — ನಿಮ್ಮದೇ ಸಂಖ್ಯೆಗಳಿಂದ ಉತ್ತರ",
  },
  "ask.button": { en: "Ask", hi: "पूछें", kn: "ಕೇಳಿ" },
  "ask.thinking": { en: "FloWise is thinking…", hi: "फ्लोवाइज़ सोच रहा है…", kn: "ಫ್ಲೋವೈಸ್ ಯೋಚಿಸುತ್ತಿದೆ…" },
  "ask.inputLabel": { en: "Ask a question about your money", hi: "अपने पैसे के बारे में सवाल पूछें", kn: "ನಿಮ್ಮ ಹಣದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ" },
  "ask.error": {
    en: "Couldn't get an answer just now. Please try again.",
    hi: "अभी जवाब नहीं मिल पाया। कृपया फिर से कोशिश करें।",
    kn: "ಈಗ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },
  "ask.retry": { en: "Try again", hi: "फिर कोशिश करें", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
  "ask.q1": { en: "What should I do today?", hi: "आज मुझे क्या करना चाहिए?", kn: "ಇಂದು ನಾನು ಏನು ಮಾಡಬೇಕು?" },
  "ask.q2": { en: "Who owes me money?", hi: "मुझे किससे पैसा लेना है?", kn: "ನನಗೆ ಯಾರು ಹಣ ಕೊಡಬೇಕು?" },
  "ask.q3": { en: "Can I buy inventory this week?", hi: "क्या मैं इस हफ्ते माल खरीद सकता हूँ?", kn: "ಈ ವಾರ ನಾನು ಸ್ಟಾಕ್ ಖರೀದಿಸಬಹುದೇ?" },
  "ask.q4": { en: "Will I have enough for salaries?", hi: "क्या तनख्वाह के लिए पैसा होगा?", kn: "ಸಂಬಳಕ್ಕೆ ಸಾಕಷ್ಟು ಹಣ ಇರುತ್ತದೆಯೇ?" },
  "ask.q5": { en: "Why is my cash reducing?", hi: "मेरा पैसा क्यों कम हो रहा है?", kn: "ನನ್ನ ಹಣ ಏಕೆ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ?" },

  // More + FAB
  "more.title": { en: "More details", hi: "और जानकारी", kn: "ಇನ್ನಷ್ಟು ವಿವರ" },
  "more.sub": {
    en: "Charts, all transactions, tax drawer, reminders, templates & credit",
    hi: "चार्ट, सभी लेन-देन, टैक्स, रिमाइंडर, टेम्पलेट और क्रेडिट",
    kn: "ಚಾರ್ಟ್‌ಗಳು, ಎಲ್ಲಾ ವಹಿವಾಟುಗಳು, ತೆರಿಗೆ, ಜ್ಞಾಪನೆ, ಟೆಂಪ್ಲೇಟ್ ಮತ್ತು ಕ್ರೆಡಿಟ್",
  },
  "fab.add": { en: "Add money", hi: "पैसा जोड़ें", kn: "ಹಣ ಸೇರಿಸಿ" },
  "num.toDo": { en: "{n} to do", hi: "{n} काम", kn: "{n} ಕೆಲಸ" },

  // Loading / error / empty states
  "state.error": {
    en: "Couldn't load your numbers.",
    hi: "आपके आँकड़े लोड नहीं हो पाए।",
    kn: "ನಿಮ್ಮ ಸಂಖ್ಯೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ.",
  },
  "state.retry": { en: "Try again", hi: "फिर कोशिश करें", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
  "state.noData": {
    en: "No money recorded yet",
    hi: "अभी कोई पैसा दर्ज नहीं",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ಹಣ ದಾಖಲಾಗಿಲ್ಲ",
  },
  "state.noDataSub": {
    en: "Add a transaction or upload a bank statement to see your real cash.",
    hi: "अपना असली पैसा देखने के लिए एक लेन-देन जोड़ें या बैंक स्टेटमेंट अपलोड करें।",
    kn: "ನಿಮ್ಮ ನಿಜವಾದ ಹಣ ನೋಡಲು ಒಂದು ವಹಿವಾಟು ಸೇರಿಸಿ ಅಥವಾ ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
  },
};

export function tf(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const entry = STRINGS[key];
  let s = entry ? entry[lang] || entry.en : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
