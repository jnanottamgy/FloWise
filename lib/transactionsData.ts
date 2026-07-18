import "server-only";
import txnData from "@/data/transactions.json";
import type { Transaction } from "./types";

interface Account {
  bankBalance: number;
  transactions: Transaction[];
}

const DATA = txnData as unknown as Record<string, Account>;

export function getTransactions(businessId: string): Transaction[] {
  return DATA[businessId]?.transactions ?? [];
}

export function getBankBalance(businessId: string): number {
  return DATA[businessId]?.bankBalance ?? 0;
}
