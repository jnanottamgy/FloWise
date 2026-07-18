import "server-only";
import type { Business, EnrichedInvoice, Metrics } from "./types";
import { formatDate, formatINR } from "./format";
import { followupTemplate, summaryTemplate } from "./drafts";

// Model is configurable via env (GEMMA_MODEL) but defaults to the specified one.
const MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
// The model reasons for a while; 25s is long enough to reach a salvageable draft
// but short enough that we don't leave the owner waiting a full minute for what is
// often just the instant deterministic fallback.
const TIMEOUT_MS = 25_000;
// Enough for the model to reason far enough to produce a complete draft we can
// salvage. Short answers (summaries) reach a draft early; longer answers
// (emails) need more room, so callers can raise it.
const MAX_OUTPUT_TOKENS = 1536;

export function hasGemmaKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Gemma-4 "thinks out loud" and cannot be told to stop. So we let it reason but
// demand the final answer inside <out>…</out>, then extract that — robustly,
// because the model echoes the tag names inside its own reasoning.
const OUTPUT_RULE =
  "\n\nWhen you are completely finished, write your final answer between the markers <out> and </out>. " +
  "Put nothing except the final answer between those markers.";

const REASONING_MARKERS =
  /(\*\s|Draft\s?\d|Refin|Constraint Check|Summary Idea|Self-correction|Let's try|Re-evaluat|Final (Version|Text|Polish)|Option [AB]\b|Revised Draft)/i;

// First-person / meta cues that reveal the model is still narrating its own
// process rather than answering the owner. Used to reject short "direct answer"
// candidates so chain-of-thought can never reach the UI.
const META_CUES =
  /\b(let me|i'?ll|i will|i think|i need to|we need to|the owner|the user|the data|the prompt|the instruction|let'?s|okay,|actually,|wait,|hmm|strictly speaking|self-correct)\b/i;

function stripTags(s: string): string {
  return s.replace(/^<\/?out>/i, "").replace(/<\/?out>$/i, "").trim();
}

/** True if the text still looks like the model's reasoning rather than an answer.
 *  Deliberately strict — a false positive just means we show the (correct)
 *  deterministic fallback instead of leaking chain-of-thought. */
function looksLikeReasoning(s: string): boolean {
  if (REASONING_MARKERS.test(s)) return true;
  if (META_CUES.test(s)) return true;
  if (/<\/?out>/i.test(s)) return true; // stray tag = mid-reasoning echo
  const bullets = (s.match(/(^|\n)\s*[*\-•]\s/g) ?? []).length;
  if (bullets >= 2) return true;
  return false;
}

function clean(s: string): string {
  return s.replace(/^["'*\s]+/, "").replace(/["'*\s]+$/, "").trim();
}

/** Salvage a complete multi-line email from the reasoning. Each email block
 *  runs from a `Subject:` line to the next reasoning bullet; we keep only blocks
 *  that reach a sign-off (so we never surface a truncated draft). */
function salvageEmail(raw: string): string | null {
  const blocks = [...raw.matchAll(/Subject:[\s\S]*?(?=\n[ \t]*\*|$)/gi)]
    .map((m) => clean(m[0]))
    .filter((b) => b.length >= 80);
  const complete = blocks.filter((b) =>
    /(warm regards|best regards|kind regards|regards|sincerely|thank you|thanks|best wishes)/i.test(
      b,
    ),
  );
  return complete.length ? complete[complete.length - 1] : null;
}

/** Salvage the model's best complete draft from its own reasoning, e.g. lines
 *  like `*Draft 3 (Warmer):* <text>` or `Final Version: <text>`. This lets us
 *  succeed at a lower token budget (faster) even if it never reaches <out>. */
function salvageDraft(raw: string): string | null {
  const re =
    /(?:Draft\s*\d[^\n:]*:|Final(?:\s+\w+)?:|Revised:|Polished:)\s*([^\n]{25,900})/gi;
  const cands = [...raw.matchAll(re)]
    .map((m) => clean(m[1]))
    .filter(
      (s) =>
        s.length >= 25 &&
        !/<\/?out>/i.test(s) &&
        !REASONING_MARKERS.test(s) &&
        /[.!?]$/.test(s), // looks like a finished sentence
    );
  return cands.length ? cands[cands.length - 1] : null;
}

/** Pull the final answer out of the model's verbose response. */
function extractAnswer(raw: string): string | null {
  // 1) Real answers are substantial; the echoed "<out> and </out>" fragments are tiny.
  const closed = [...raw.matchAll(/<out>([\s\S]*?)<\/out>/gi)]
    .map((m) => m[1].trim())
    .filter((s) => s.length >= 25);
  if (closed.length) return stripTags(closed[closed.length - 1]);

  // 2) Opened the final <out> but got truncated before closing — salvage the tail,
  //    but ONLY if it reads like a finished answer. The model echoes the <out>
  //    marker mid-reasoning, so an unguarded tail is the #1 chain-of-thought leak.
  const open = raw.lastIndexOf("<out>");
  if (open !== -1) {
    const tail = stripTags(raw.slice(open + 5));
    if (
      tail.length >= 25 &&
      tail.length < 900 &&
      !looksLikeReasoning(tail) &&
      /[.!?]["')\]]?\s*$/.test(tail) // ends on a complete sentence
    ) {
      return tail;
    }
  }

  // 3) No usable <out>: salvage the model's own finished draft from the reasoning.
  if (/Subject:/i.test(raw)) {
    const email = salvageEmail(raw);
    if (email) return email;
  }
  const draft = salvageDraft(raw);
  if (draft) return draft;

  // 4) A short, direct answer with no reasoning tells. Kept tight (<= ~3
  //    sentences) so a verbose thought stream can never qualify.
  const t = raw.trim();
  if (t && t.length < 400 && !looksLikeReasoning(t) && /[.!?]["')\]]?\s*$/.test(t)) {
    return t;
  }
  return null;
}

/**
 * Call Gemma via the Gemini API. NEVER throws — on a missing key, HTTP error,
 * timeout, or an unparseable "thinking out loud" response it returns the
 * provided fallback, so the app always works (and never hangs the UI).
 */
export async function callGemma(
  prompt: string,
  fallback: string,
  maxTokens: number = MAX_OUTPUT_TOKENS,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallback;

  try {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + OUTPUT_RULE }] }],
        // Low temperature: these are factual money answers, and less creative
        // rambling means a cleaner final answer and less reasoning to leak.
        generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[gemma] HTTP", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return fallback;
    }
    const data = await res.json();
    const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) return fallback;
    const answer = extractAnswer(text);
    // Final safety net: if extraction still produced something that smells like
    // reasoning (stray markers/tags) or is implausibly long for an answer, show
    // the deterministic fallback rather than risk leaking chain-of-thought.
    if (!answer || REASONING_MARKERS.test(answer) || /<\/?out>/i.test(answer) || answer.length > 1500) {
      return fallback;
    }
    return answer;
  } catch (err) {
    console.error("[gemma] error", (err as Error)?.name ?? err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Cache — keyed by content signature so sample AND custom businesses are safe.
// ---------------------------------------------------------------------------
const summaryCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// 1) Plain-language cash-flow summary for the business owner.
// ---------------------------------------------------------------------------
export async function generateSummary(
  business: Business,
  m: Metrics,
): Promise<string> {
  const key = `${business.id}|${m.outstanding}|${m.overdue}|${m.flaggedCount}|${m.collected90d}|${m.collectionRatePct}`;
  const cached = summaryCache.get(key);
  if (cached) return cached;

  const fallback = summaryTemplate(business.name, m);

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
  // Only cache a genuine model answer — caching the fallback would permanently
  // disable the AI summary for this business after a single timeout. Keep the
  // map bounded so it can't grow without limit on a long-lived server.
  if (text !== fallback) {
    if (summaryCache.size > 200) summaryCache.clear();
    summaryCache.set(key, text);
  }
  return text;
}

// ---------------------------------------------------------------------------
// 2) One-line reason a flagged invoice is at risk (<= 15 words).
// Computed deterministically from the data: precise, instant, and — because it
// quotes exact figures/day-counts — clearer than a verbose model's phrasing.
// ---------------------------------------------------------------------------
export function deterministicReason(inv: EnrichedInvoice): string {
  if (inv.overdue) {
    return (
      `${inv.client} is ${Math.abs(inv.daysToDue)} days overdue on ${formatINR(inv.amount)}` +
      `${inv.clientHasLateHistory ? " and has paid late before." : "."}`
    );
  }
  if (inv.clientHasLateHistory) {
    return `${inv.client} has a history of late payment; ${formatINR(inv.amount)} is still open.`;
  }
  return `${formatINR(inv.amount)} from ${inv.client} falls due in ${inv.daysToDue} day${inv.daysToDue === 1 ? "" : "s"} and is unpaid.`;
}

/** Fill aiReason for every flagged invoice. Green stays null. Synchronous —
 *  keeps the invoices endpoint instant. */
export function attachReasons(invoices: EnrichedInvoice[]): EnrichedInvoice[] {
  for (const inv of invoices) {
    if (inv.risk !== "green") inv.aiReason = deterministicReason(inv);
  }
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

  const fallback = followupTemplate(business.name, inv);

  const prompt =
    `Draft a polite but firm follow-up email from the accounts team of ${business.name} ` +
    `(a ${business.industry.toLowerCase()}) to their client "${inv.client}" about an at-risk invoice. ` +
    `4-6 sentences, professional and warm, plain text (no markdown). Include a subject line. ` +
    `Sign off as "Accounts Team, ${business.name}".\n\n` +
    `Invoice: ${inv.id}\nAmount: ${formatINR(inv.amount)}\nDue date: ${formatDate(inv.dueDate)}\nStatus: ${state}`;

  // Emails need more room than summaries for a complete draft to appear.
  return callGemma(prompt, fallback, 3000);
}
