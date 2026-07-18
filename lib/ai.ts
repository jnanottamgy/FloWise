import "server-only";
import type { Business, EnrichedInvoice, Metrics } from "./types";
import { formatDate, formatINR } from "./format";

const MODEL = "gemma-4-26b-a4b-it";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function hasGemmaKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Call Gemma via the Gemini API. NEVER throws — on a missing key, HTTP error,
 * or network failure it returns the provided fallback, so the app always works
 * (great for offline hackathon demos).
 */
export async function callGemma(prompt: string, fallback: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallback;

  try {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[gemma] HTTP", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return fallback;
    }
    const data = await res.json();
    const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : fallback;
  } catch (err) {
    console.error("[gemma] error", err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Caches — keyed by content signature so sample AND custom businesses are safe.
// ---------------------------------------------------------------------------
const summaryCache = new Map<string, string>();
const reasonCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// 1) Plain-language cash-flow summary for the business owner.
// ---------------------------------------------------------------------------
export async function generateSummary(
  business: Business,
  m: Metrics,
): Promise<string> {
  const key = `${business.id}|${m.outstanding}|${m.overdue}|${m.flaggedCount}`;
  const cached = summaryCache.get(key);
  if (cached) return cached;

  const fallback =
    `${business.name} has ${formatINR(m.outstanding)} outstanding across ${m.totalInvoices} invoices, ` +
    `with ${formatINR(m.overdue)} already overdue and ${m.flaggedCount} invoice${m.flaggedCount === 1 ? "" : "s"} flagged as at-risk. ` +
    `Collections are running at about ${m.collectionRatePct}% — chasing the flagged clients first will protect your cash flow.`;

  const prompt =
    `You are a friendly cash-flow assistant for ${business.name}, a ${business.industry.toLowerCase()}. ` +
    `Write a warm, plain-language 2-3 sentence summary of their cash flow for the owner. No jargon, no bullet points, no markdown.\n\n` +
    `Numbers:\n` +
    `- Total outstanding: ${formatINR(m.outstanding)}\n` +
    `- Overdue: ${formatINR(m.overdue)}\n` +
    `- At-risk (flagged) invoices: ${m.flaggedCount}\n` +
    `- Collected in the last 90 days: ${formatINR(m.collected90d)}\n` +
    `- Collection rate: ${m.collectionRatePct}%\n` +
    `Speak directly to the owner. End with one gentle, concrete suggestion.`;

  const text = await callGemma(prompt, fallback);
  summaryCache.set(key, text);
  return text;
}

// ---------------------------------------------------------------------------
// 2) One-line reason a flagged invoice is at risk (<= 15 words).
// ---------------------------------------------------------------------------
export async function generateInvoiceReason(
  business: Business,
  inv: EnrichedInvoice,
): Promise<string> {
  const key = `${business.id}|${inv.id}|${inv.client}|${inv.amount}|${inv.risk}|${inv.daysToDue}`;
  const cached = reasonCache.get(key);
  if (cached) return cached;

  let fallback: string;
  if (inv.overdue) {
    fallback =
      `${inv.client} is ${Math.abs(inv.daysToDue)} days overdue on ${formatINR(inv.amount)}` +
      `${inv.clientHasLateHistory ? " and has paid late before." : "."}`;
  } else if (inv.clientHasLateHistory) {
    fallback = `${inv.client} has a history of late payment; ${formatINR(inv.amount)} is still open.`;
  } else {
    fallback = `${formatINR(inv.amount)} from ${inv.client} falls due in ${inv.daysToDue} day${inv.daysToDue === 1 ? "" : "s"} and is unpaid.`;
  }

  const prompt =
    `In 15 words or fewer, explain why this invoice for ${business.name} is at risk. ` +
    `Plain sentence, no markdown, no lead-in.\n` +
    `Client: ${inv.client}\nAmount: ${formatINR(inv.amount)}\nDue: ${formatDate(inv.dueDate)}\n` +
    `${inv.overdue ? `Overdue by ${Math.abs(inv.daysToDue)} days` : `Due in ${inv.daysToDue} days`}\n` +
    `Client has paid late before: ${inv.clientHasLateHistory ? "yes" : "no"}`;

  const text = await callGemma(prompt, fallback);
  reasonCache.set(key, text);
  return text;
}

/** Fill aiReason for every flagged invoice (in parallel). Green stays null. */
export async function attachReasons(
  business: Business,
  invoices: EnrichedInvoice[],
): Promise<EnrichedInvoice[]> {
  await Promise.all(
    invoices.map(async (inv) => {
      if (inv.risk !== "green") {
        inv.aiReason = await generateInvoiceReason(business, inv);
      }
    }),
  );
  return invoices;
}

// ---------------------------------------------------------------------------
// 3) Follow-up email draft.
// ---------------------------------------------------------------------------
export async function generateFollowup(
  business: Business,
  inv: EnrichedInvoice,
): Promise<string> {
  const state = inv.overdue
    ? `overdue by ${Math.abs(inv.daysToDue)} days`
    : `due on ${formatDate(inv.dueDate)}`;

  const fallback =
    `Subject: Payment reminder — Invoice ${inv.id}\n\n` +
    `Dear ${inv.client},\n\n` +
    `I hope you're doing well. This is a gentle reminder that invoice ${inv.id} for ${formatINR(inv.amount)}, ` +
    `${inv.overdue ? `was due on ${formatDate(inv.dueDate)} and is now ${state}` : `is ${state}`}. ` +
    `We'd be grateful if you could confirm the expected payment date at your earliest convenience.\n\n` +
    `We truly value our partnership and want to keep everything running smoothly. ` +
    `Please let me know if there's anything you need from us to help process this.\n\n` +
    `Warm regards,\nAccounts Team\n${business.name}`;

  const prompt =
    `Draft a polite but firm follow-up email from the accounts team of ${business.name} ` +
    `(a ${business.industry.toLowerCase()}) to their client "${inv.client}" about an at-risk invoice. ` +
    `4-6 sentences, professional and warm, plain text (no markdown). Include a subject line. ` +
    `Sign off as "Accounts Team, ${business.name}".\n\n` +
    `Invoice: ${inv.id}\nAmount: ${formatINR(inv.amount)}\nDue date: ${formatDate(inv.dueDate)}\nStatus: ${state}`;

  return callGemma(prompt, fallback);
}
