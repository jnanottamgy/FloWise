# FloWise — Build Prompt Pack (E0–E8)

Paste these into your AI coding tool **one at a time, in order**. Each prompt is self-contained and builds one element of the FloWise dashboard. After each element, commit:

```
git add -A && git commit -m "<element>" && git push
```

**What you're building:** "FloWise — AI Cashflow Copilot" for a fictional textile SME, **Aria Textiles**. A premium single-page dashboard (Next.js) that surfaces cash-flow risk with Gemma AI. Layout follows the supplied reference image; content is cashflow. Core loop: **AI Summary → click a Flagged Invoice → Follow-Up Draft side panel → Send → In Progress tracker.**

---

## Design system (reference for every prompt)

- **Palette:** bg `#F8F7F4` · cards `#FFFFFF` · text `#111111` / `#777777` · border `rgba(0,0,0,.05)` · **olive `#5F786A`** · sage `#A7B6A8` · success `#58A56C` · warning `#C7A85B` · error `#D06A6A`. Use color sparingly; whitespace dominates.
- **Cards:** radius `28px`, shadow `0 15px 45px rgba(0,0,0,.06)`, 1px near-invisible border, generous padding.
- **Layout:** centered container `max-w 1700px`, padding `32`, gap `24`, CSS Grid (4 columns).
- **Type:** Inter (400/500/600/700). Hero 34 / Section 22 / Body 15 / Caption 13.
- **Motion (Framer Motion):** hover lift 4px, count-up numbers, chart draw-in, sliding sidebar highlight, buttons scale 1.02 — never abrupt.
- **Responsive:** 1700 / 1440 / 1024 / mobile (sidebar collapses, search→icon, single column). **A11y:** keyboard nav, focus rings, ARIA, high contrast.
- **Currency:** `₹` with thousands separators.

**Stack:** Next.js (App Router) + TypeScript · Tailwind · Shadcn/ui · Framer Motion · Recharts · Lucide · React Query. AI runs server-side in Next.js route handlers calling Gemma `gemma-4-26b-a4b-it`; key in `.env.local` as `GEMINI_API_KEY`, with a canned fallback so demos never break.

**Risk logic (deterministic — AI writes only the one-line reason):** `TODAY = 2026-07-18`. Red = unpaid AND (past due OR client has `paid_late` history). Yellow = unpaid AND due within 3 days. Green = otherwise. Badge color is code-computed, never from AI.

**Expected demo numbers:** Outstanding ₹2,17,000 · Overdue ₹1,19,000 (INV008 + INV010) · Flagged 3 (INV008 red, INV010 red, INV003 yellow) · Collected 90d ₹3,24,000. INV009 green.

---

## E0 — Scaffold + design system

```
Create a Next.js 14 (App Router) + TypeScript app called "flowise" in the current directory (which is already a git repo). Set up the full premium design system.

Install & configure: Tailwind CSS, Shadcn/ui (run its init), Framer Motion, Recharts, lucide-react, @tanstack/react-query. Add a React Query provider in the root layout. Load the Inter font via next/font.

Design tokens — put these in tailwind.config + globals.css as CSS variables and Tailwind theme extensions:
- colors: bg #F8F7F4, card #FFFFFF, ink #111111, muted #777777, border rgba(0,0,0,.05), olive #5F786A, sage #A7B6A8, success #58A56C, warning #C7A85B, error #D06A6A
- borderRadius: card = 28px; shadow: card = 0 15px 45px rgba(0,0,0,.06)
- font sizes: hero 34, section 22, body 15, caption 13 (generous line-height)
Set the page background to bg (#F8F7F4). Create a reusable <Card> component (rounded-[28px], white, soft shadow, 1px border rgba(0,0,0,.05), padding) that everything else will use — no duplicate card JSX later.

Add /data folder (empty for now). Verify `npm run dev` renders a blank #F8F7F4 page with the Inter font, and print the run command.
```

---

## E1 — Data + risk engine + read API routes

```
Add FloWise's data layer and risk logic.

1. Save exactly as data/invoices.json:
{
  "business": "Aria Textiles",
  "invoices": [
    { "id": "INV001", "client": "Meridian Retail",  "amount": 45000, "issueDate": "2026-05-02", "dueDate": "2026-05-16", "paidDate": "2026-05-15", "status": "paid" },
    { "id": "INV002", "client": "Meridian Retail",  "amount": 62000, "issueDate": "2026-06-01", "dueDate": "2026-06-15", "paidDate": "2026-06-14", "status": "paid" },
    { "id": "INV003", "client": "Meridian Retail",  "amount": 58000, "issueDate": "2026-07-05", "dueDate": "2026-07-19", "paidDate": null,          "status": "unpaid" },
    { "id": "INV004", "client": "Kavya Fashions",   "amount": 30000, "issueDate": "2026-04-20", "dueDate": "2026-05-04", "paidDate": "2026-05-04", "status": "paid" },
    { "id": "INV005", "client": "Kavya Fashions",   "amount": 35000, "issueDate": "2026-06-10", "dueDate": "2026-06-24", "paidDate": "2026-06-23", "status": "paid" },
    { "id": "INV006", "client": "Sunrise Garments", "amount": 80000, "issueDate": "2026-04-10", "dueDate": "2026-04-24", "paidDate": "2026-05-03", "status": "paid_late" },
    { "id": "INV007", "client": "Sunrise Garments", "amount": 72000, "issueDate": "2026-05-15", "dueDate": "2026-05-29", "paidDate": "2026-06-05", "status": "paid_late" },
    { "id": "INV008", "client": "Sunrise Garments", "amount": 68000, "issueDate": "2026-06-20", "dueDate": "2026-07-04", "paidDate": null,          "status": "unpaid" },
    { "id": "INV009", "client": "Kavya Fashions",   "amount": 40000, "issueDate": "2026-07-10", "dueDate": "2026-07-24", "paidDate": null,          "status": "unpaid" },
    { "id": "INV010", "client": "Meridian Retail",  "amount": 51000, "issueDate": "2026-07-01", "dueDate": "2026-07-15", "paidDate": null,          "status": "unpaid" }
  ]
}

2. Create lib/riskEngine.ts with TODAY = "2026-07-18" (exported). For each invoice compute daysToDue, overdue (unpaid & past due), clientHasLateHistory (client has any paid_late invoice), and risk:
   red    = unpaid AND (overdue OR clientHasLateHistory)
   yellow = unpaid AND daysToDue in 0..3 and not red
   green  = otherwise
   Export getEnrichedInvoices() (all, enriched) and getFlaggedInvoices() (risk !== green). Strong TS types (EnrichedInvoice).

3. Create lib/metrics.ts computing, in code: outstanding (Σ unpaid), overdue (Σ unpaid past-due), flaggedCount, collected90d (Σ paid within 90 days of TODAY), collectionRatePct (collected / (collected + outstanding)), plus a monthly cashflow series (collected vs outstanding by month, for the chart) and a per-client breakdown. Leave aiSummary:"" placeholder.

4. Add App Router route handlers:
   GET /api/invoices -> { business, invoices: enriched[] }
   GET /api/summary  -> { metrics, aiSummary:"" }
Risk/metrics are code-computed only. Test both routes and show JSON output.
```

---

## E2 — Gemma AI integration

```
Add Gemma (Gemini API) integration to FloWise, server-side only.

- Read process.env.GEMINI_API_KEY (dotenv/Next env). Create .env.example with GEMINI_API_KEY= (no real .env). Ensure .env.local is gitignored.
- lib/ai.ts: callGemma(prompt: string) POSTs to
  https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=<KEY>
  body { contents:[{ parts:[{ text: prompt }] }] }, parse candidates[0].content.parts[0].text. try/catch returns a sensible fallback string (never throws) so the app works with no key.
- Wire AI into routes:
  * GET /api/summary: prompt Gemma with the computed metrics for a warm, 2–3 sentence plain-language cash-flow summary for a small business owner (no jargon). Put in aiSummary. Cache in memory.
  * GET /api/invoices: for each FLAGGED invoice, generate a one-line reason (<=15 words) from client, amount, days overdue/to-due, payment history -> invoice.aiReason (green invoices null). Use Promise.all + in-memory cache.
- POST /api/followup { invoiceId }: look up invoice, prompt Gemma to draft a polite-but-firm follow-up email from Aria Textiles' accounts team about the at-risk/overdue invoice (amount, id, due date; ~4–6 sentences) -> { draft }. Fallback template if no key.
Test /api/summary, /api/invoices, POST /api/followup (fallback text is fine) and show output.
```

---

## E3 — App shell: background, sidebar, header, grid

```
Build the FloWise dashboard shell to match the reference layout (floating icon sidebar + full-width header + 4-column grid). Use the design tokens and <Card> from E0. Framer Motion for motion.

- Page: bg #F8F7F4, centered container max-w 1700px, padding 32, a big rounded outer surface like the reference. Below the header, a CSS grid with a fixed-width left sidebar column + a 4-column content grid (gap 24).
- Floating Sidebar (components/dashboard/Sidebar.tsx): a white rounded capsule, soft shadow, icons only (lucide, 22px). Top: logo mark (an olive sunburst/asterisk). Nav icons: Dashboard (active = dark rounded square, white icon), Invoices, AI Workspace, Analytics, Clients, Documents. A spacer, then Settings and Logout near the bottom, then a user avatar at the very bottom. Active item olive/dark; hover scale 1.05, sliding highlight; ARIA labels + tooltips. Only "Dashboard" is functional; others are visual (disabled) for now.
- Header (components/dashboard/Header.tsx): left = olive logo + "Good Morning" hero (34px) with subtitle "Aria Textiles — your cash flow at a glance" (muted). Right = large rounded search pill "Search invoices…" with a dark circular search button, plus two circular glass-hover buttons (messages with a red dot, notifications bell).
- Create the dashboard page composing Sidebar + Header + an empty 4-column grid with clearly-labelled placeholders for Rows 1–4. Page fades in on load. Make it responsive (1700/1440/1024/mobile: sidebar collapses to top or hides, search→icon, grid→single column).
```

---

## E4 — Row 1: metric cards

```
Build Row 1 of the FloWise grid: four metric cards spanning the 4 columns, styled like the reference metric row. Fetch data with React Query from /api/summary (metrics).

components/dashboard/MetricCard.tsx (reusable, strong types): icon (lucide, in a soft circular tint), title (caption, muted), large number (count-up animation via Framer Motion), and a small sparkline/mini-bar chart on the right (Recharts). Hover lifts 4px.

The four cards, left→right, from metrics:
1. "Outstanding" — ₹ outstanding — mini bar chart
2. "Flagged Invoices" — count — small line sparkline
3. "Collected (90d)" — ₹ collected90d — money icon + sparkline
4. "Overdue" — ₹ overdue — HIGHLIGHTED: olive (#5F786A) filled background, white text/number, white wavy line (this is the urgent metric, like "Activity" in the reference).

Format currency ₹ with thousands separators. Loading skeletons; graceful error.
```

---

## E5 — Row 2: Cash Flow chart + Collection gauge + Business profile

```
Build Row 2 of the FloWise grid (3 cards): Cash Flow chart (span 2), Collection-Rate gauge (span 1), Business Profile (span 1). Data from React Query (/api/summary metrics).

1. AnalyticsChart.tsx — "Cash Flow" card (span 2). Header: title "Cash Flow" + a "✓ On track" pill, and a "Monthly ▾" filter (Week/Month/Year). Two inner stat pills like the reference: "Collected 68% +2.45%" and "Outstanding ₹2,17,000 -4.75%" (use real metric values). Below: a large smooth Recharts area/line chart of the monthly cashflow series, soft grid, tooltip, animated line draw-in (Framer Motion / Recharts animation). Olive stroke, soft sage fill.
2. CollectionCard.tsx — "Collection Rate" card (gauge). "Total Outstanding ₹2,17,000" (olive), a note like "Collected X% more than last month", and a semicircular gauge ring (like the 80% donut in the reference) showing collectionRatePct, animated fill.
3. ProfileCard.tsx — "Aria Textiles" business profile: logo/avatar, business name, email (accounts@ariatextiles.example), and three stats: Invoices (total), Clients (3), Flagged (count). "View details" text button.
All cards: 28px radius, soft shadow, hover none/subtle. Responsive: stack under 1024.
```

---

## E6 — Row 3: Flagged Invoices + Activity Feed + AI Assistant

```
Build Row 3 of the FloWise grid (3 cards): Flagged Invoices (span 2), Activity Feed (span 1), AI Assistant (span 1). Fetch /api/invoices and /api/summary via React Query. Lift selectedInvoiceId into a shared dashboard state (context or parent state).

1. FlaggedInvoices.tsx (span 2, replaces the reference "Available Credit Card" slot) — a card titled "Flagged Invoices". List only risk red/yellow, sorted red-first then amount desc. Each row (a <button>): client avatar/initials, client name, invoice id, amount ₹, due date, a color-coded risk BADGE (red="At risk", yellow="Watch" — color from invoice.risk, text label not color-only), and invoice.aiReason in muted text below. Hover reveals a quick "Draft follow-up →" action and lifts slightly. Click sets selectedInvoiceId. Fade-in rows (stagger).
2. ActivityFeed.tsx (span 1, replaces "Your Transfers") — timeline of recent cashflow events (e.g. "Payment received — Kavya Fashions", "Invoice flagged — Sunrise Garments", "Follow-up sent — …") each with avatar, action, timestamp, and a colored +/- status badge like the reference transfers. Fade-in + hover highlight. Seed from paid/paid_late invoices + a live entry when a follow-up is sent (E7).
3. AIAssistantCard.tsx (span 1, replaces the fingerprint "Keep you safe" card) — an animated glowing olive AI orb (soft pulse), "AI Ready" status, the AI cash-flow summary text (metrics.aiSummary, 2–3 sentences), and a primary olive "Launch AI Assistant" button. Loading shimmer while summary loads.
```

---

## E7 — Follow-Up side panel + In Progress tracker + wire the loop

```
Complete the FloWise core loop.

1. FollowUpPanel.tsx — a right-side slide-in overlay (Framer Motion, ~420px, dimmed backdrop; Esc + close button + backdrop click dismiss, clearing selectedInvoiceId). Opens when selectedInvoiceId is set. On open, POST /api/followup { invoiceId } (React Query mutation), show a loading state, then fill an editable <textarea> with the draft. Top shows invoice context (client, id, amount ₹, due date, risk badge). Buttons: primary olive "Send", secondary "Cancel".
2. Shared dashboard state: sentInvoices: { invoice, message, sentAt }[] and a sentIds Set. onSend(invoiceId, message) pushes an entry (timestamp), adds id to sentIds, closes the panel, and pushes a "Follow-up sent" item to the Activity Feed. Flagged Invoices list (E6) must exclude sentIds.
3. Row 4 — InProgressTracker.tsx: a card/section titled "In Progress" listing sent follow-ups (client, invoice id, amount ₹, "Sent • <relative time>"). Empty state: muted "No follow-ups sent yet." Fade-in new entries.
Verify end to end: summary loads → flagged INV008 → panel drafts follow-up → edit → Send → INV008 leaves Flagged, appears in In Progress, and an Activity item is added. No real email; in-memory state is fine.
```

---

## E8 — Polish: motion, responsive, a11y

```
Final polish pass on the FloWise dashboard.

- Motion: ensure numbers count up on mount, charts animate on load, progress/gauge rings fill smoothly, sidebar active-highlight slides, cards lift 4px on hover, buttons scale 1.02, whole page fades in. Nothing abrupt; consistent easing/durations.
- Responsive: verify 1700 / 1440 / 1024 / mobile. Mobile: sidebar collapses (top bar or drawer), search becomes an icon, grid becomes single column, cards stack gracefully, spans reset to full width.
- Accessibility: keyboard navigation across sidebar + invoice rows + panel, visible focus rings, ARIA labels on icon buttons, badges convey status via text not color alone, high contrast, side panel traps focus and restores it on close.
- Performance: lazy-load the Recharts chart, memoize expensive components, avoid unnecessary re-renders, proper loading/empty states everywhere.
Do a final visual pass against the reference: warm neutral bg, floating white sidebar, generous whitespace, olive used sparingly. It should feel expensive.
```

---

## Verify (end-to-end)

1. `npm run dev`; optionally add `GEMINI_API_KEY` to `.env.local` (fallback text works without it).
2. Premium grid renders; metric numbers count up; **Overdue** card is olive-filled; Cash Flow chart draws in; Collection gauge fills to ~collectionRate%.
3. AI Assistant card shows the AI summary; Flagged Invoices shows INV008 + INV010 (red) and INV003 (yellow) with AI reasons.
4. Click INV008 → side panel drafts a follow-up → edit → Send → INV008 leaves Flagged, appears in In Progress, Activity Feed gains an entry.
5. Responsive at 1700/1440/1024/mobile; keyboard + focus states pass.

## Notes / risks

- Model id `gemma-4-26b-a4b-it` is unusual (public ids look like `gemma-3-27b-it`); if it 404s the fallback keeps the demo alive — swap the id in one place (`lib/ai.ts`).
- Only the **Dashboard** sidebar item is functional; the rest are elegant non-clickable chrome for the hackathon.
- Gemma via Gemini API supports only `contents`/`parts` (no systemInstruction), so prompts are inlined.
