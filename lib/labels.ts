import type { TxnMode, TxnScope } from "./types";
import type { Lang } from "./i18n";

export const MODE_LABEL: Record<TxnMode, string> = {
  upi: "UPI",
  neft: "Bank",
  imps: "Bank",
  rtgs: "Bank",
  card: "Card",
  cash: "Cash",
  cheque: "Cheque",
};

export const SCOPE_LABEL: Record<TxnScope, string> = {
  business: "Business",
  personal: "Personal",
  unsure: "Not sure",
};

export const CATEGORY_LABEL: Record<string, string> = {
  materials: "Materials / stock",
  rent: "Rent",
  utilities: "Utilities",
  salaries: "Salaries",
  tax: "Tax / GST",
  software: "Software",
  labour: "Labour",
  packaging: "Packaging",
  transport: "Transport",
  sales: "Sales",
  fees: "Fees",
  groceries: "Groceries",
  education: "Education",
  entertainment: "Entertainment",
  fuel: "Fuel",
  dining: "Dining",
  other: "Other",
};

const CATEGORY_HI: Record<string, string> = {
  materials: "माल / स्टॉक",
  rent: "किराया",
  utilities: "बिजली/पानी",
  salaries: "तनख्वाह",
  tax: "टैक्स / GST",
  software: "सॉफ्टवेयर",
  labour: "मजदूरी",
  packaging: "पैकेजिंग",
  transport: "ट्रांसपोर्ट",
  sales: "बिक्री",
  fees: "फीस",
  groceries: "किराना",
  education: "शिक्षा",
  entertainment: "मनोरंजन",
  fuel: "ईंधन",
  dining: "खाना-पीना",
  other: "अन्य",
};

const CATEGORY_KN: Record<string, string> = {
  materials: "ಸಾಮಗ್ರಿ / ಸ್ಟಾಕ್",
  rent: "ಬಾಡಿಗೆ",
  utilities: "ವಿದ್ಯುತ್/ನೀರು",
  salaries: "ಸಂಬಳ",
  tax: "ತೆರಿಗೆ / GST",
  software: "ಸಾಫ್ಟ್‌ವೇರ್",
  labour: "ಕೂಲಿ",
  packaging: "ಪ್ಯಾಕೇಜಿಂಗ್",
  transport: "ಸಾರಿಗೆ",
  sales: "ಮಾರಾಟ",
  fees: "ಶುಲ್ಕ",
  groceries: "ದಿನಸಿ",
  education: "ಶಿಕ್ಷಣ",
  entertainment: "ಮನರಂಜನೆ",
  fuel: "ಇಂಧನ",
  dining: "ಊಟ / ಹೋಟೆಲ್",
  other: "ಇತರೆ",
};

export function categoryLabel(c: string, lang: Lang = "en"): string {
  if (lang === "hi") return CATEGORY_HI[c] ?? CATEGORY_LABEL[c] ?? c;
  if (lang === "kn") return CATEGORY_KN[c] ?? CATEGORY_LABEL[c] ?? c;
  return CATEGORY_LABEL[c] ?? c;
}
