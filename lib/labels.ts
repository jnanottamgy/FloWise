import type { TxnMode, TxnScope } from "./types";

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

export function categoryLabel(c: string): string {
  return CATEGORY_LABEL[c] ?? c;
}
