# FloWise — Build Prompt Pack (E0–E9)

Paste these into your AI coding tool **one at a time, in order**. Each prompt is self-contained and builds one element. After each element, commit:

```
git add -A && git commit -m "<element>" && git push
```

**What you're building:** "FloWise — AI Cashflow Copilot for SMEs." A premium single-page dashboard (Next.js) that surfaces cash-flow risk with Gemma AI. It is **multi-business**: a business "comes in" via an onboarding entry — picking a preloaded **sample business** or creating its own **Workspace** by uploading/pasting invoices. Layout follows the reference image; content is cashflow. Core loop: **AI Summary → click a Flagged Invoice → Follow-Up Draft side panel → Send → In Progress tracker.**

**Terminology:** a business that *uses* FloWise = a **Business / Workspace** (tenant). The people who *owe it money* = **clients**.

---

## Design system (reference for every prompt)

- **Palette:** bg `#F8F7F4` · cards `#FFFFFF` · text `#111111` / `#777777` · border `rgba(0,0,0,.05)` · **olive `#5F786A`** · sage `#A7B6A8` · success `#58A56C` · warning `#C7A85B` · error `#D06A6A`. Use color sparingly; whitespace dominates.
- **Cards:** radius `28px`, shadow `0 15px 45px rgba(0,0,0,.06)`, 1px near-invisible border, generous padding.
- **Layout:** centered container `max-w 1700px`, padding `32`, gap `24`, CSS Grid (4 columns).
- **Type:** Inter (400/500/600/700). Hero 34 / Section 22 / Body 15 / Caption 13.
- **Motion (Framer Motion):** hover lift 4px, count-up numbers, chart draw-in, sliding sidebar highlight, buttons scale 1.02 — never abrupt.
- **Responsive:** 1700 / 1440 / 1024 / mobile (sidebar collapses, search→icon, single column). **A11y:** keyboard nav, focus rings, ARIA, high contrast.
- **Currency:** `₹` with thousands separators.

**Stack:** Next.js (App Router) + TypeScript · Tailwind · Shadcn/ui · Framer Motion · Recharts · Lucide · React Query. AI runs server-side in route handlers calling Gemma `gemma-4-26b-a4b-it`; key in `.env.local` as `GEMINI_API_KEY`, with a canned fallback so demos never break.

**Multi-business model:** `/` = onboarding (pick a sample or create a workspace by name + upload/paste invoices) → `/dashboard` = the app, scoped to the active business (held in a `BusinessContext` + `localStorage`). A header dropdown switches businesses. Everything (risk, metrics, chart, profile, AI) runs on the active business's invoices.

**Risk logic (deterministic — AI writes only the one-line reason):** `TODAY = 2026-07-18`. Red = unpaid AND (past due OR client has `paid_late` history). Yellow = unpaid AND due within 3 days. Green = otherwise. Badge color is code-computed, never AI. Risk/metrics are **pure functions** (server + client) so uploaded businesses work too.

**Sample businesses (all share TODAY 2026-07-18, each has red+yellow+green):**
- **Aria Textiles** (textiles) — Outstanding ₹2,17,000 · Overdue ₹1,19,000 · Flagged 3 (INV008 red, INV010 red, INV003 yellow).
- **Brew & Bloom Café** (catering) — red BB05, yellow BB03, green BB06.
- **Northline Studio** (design agency) — red NS02 & NS04, yellow NS05, green NS06.

---

## E0 — Scaffold + design system

```
Create a Next.js 14 (App Router) + TypeScript app called "flowise" in the current directory (already a git repo). Set up the premium design system.

Install & configure: Tailwind CSS, Shadcn/ui (run its init), Framer Motion, Recharts, lucide-react, @tanstack/react-query. Add a React Query provider in the root layout. Load Inter via next/font.

Design tokens in tailwind.config + globals.css (CSS vars + theme extensions):
- colors: bg #F8F7F4, card #FFFFFF, ink #111111, muted #777777, border rgba(0,0,0,.05), olive #5F786A, sage #A7B6A8, success #58A56C, warning #C7A85B, error #D06A6A
- radius card=28px; shadow card=0 15px 45px rgba(0,0,0,.06)
- font sizes: hero 34, section 22, body 15, caption 13 (generous line-height)
Page background = #F8F7F4. Create a reusable <Card> component (rounded-[28px], white, soft shadow, 1px border rgba(0,0,0,.05), padding) used everywhere — no duplicate card JSX.

Set up two routes: "/" (onboarding, placeholder for now) and "/dashboard" (placeholder). Add /data folder. Verify `npm run dev`, print the run command.
```

---

## E1 — Multi-business data + pure risk engine + metrics + read APIs

```
Add FloWise's multi-business data layer. Everything is scoped to a business.

1. Save data/businesses.json with THREE businesses, each { id, name, industry, email, invoices:[...] }. Use this exact content:
{
  "businesses": [
    {
      "id": "aria-textiles", "name": "Aria Textiles", "industry": "Textile supplier", "email": "accounts@ariatextiles.example",
      "invoices": [
        { "id":"INV001","client":"Meridian Retail","amount":45000,"issueDate":"2026-05-02","dueDate":"2026-05-16","paidDate":"2026-05-15","status":"paid" },
        { "id":"INV002","client":"Meridian Retail","amount":62000,"issueDate":"2026-06-01","dueDate":"2026-06-15","paidDate":"2026-06-14","status":"paid" },
        { "id":"INV003","client":"Meridian Retail","amount":58000,"issueDate":"2026-07-05","dueDate":"2026-07-19","paidDate":null,"status":"unpaid" },
        { "id":"INV004","client":"Kavya Fashions","amount":30000,"issueDate":"2026-04-20","dueDate":"2026-05-04","paidDate":"2026-05-04","status":"paid" },
        { "id":"INV005","client":"Kavya Fashions","amount":35000,"issueDate":"2026-06-10","dueDate":"2026-06-24","paidDate":"2026-06-23","status":"paid" },
        { "id":"INV006","client":"Sunrise Garments","amount":80000,"issueDate":"2026-04-10","dueDate":"2026-04-24","paidDate":"2026-05-03","status":"paid_late" },
        { "id":"INV007","client":"Sunrise Garments","amount":72000,"issueDate":"2026-05-15","dueDate":"2026-05-29","paidDate":"2026-06-05","status":"paid_late" },
        { "id":"INV008","client":"Sunrise Garments","amount":68000,"issueDate":"2026-06-20","dueDate":"2026-07-04","paidDate":null,"status":"unpaid" },
        { "id":"INV009","client":"Kavya Fashions","amount":40000,"issueDate":"2026-07-10","dueDate":"2026-07-24","paidDate":null,"status":"unpaid" },
        { "id":"INV010","client":"Meridian Retail","amount":51000,"issueDate":"2026-07-01","dueDate":"2026-07-15","paidDate":null,"status":"unpaid" }
      ]
    },
    {
      "id": "brew-bloom", "name": "Brew & Bloom Café", "industry": "Café & catering", "email": "accounts@brewbloom.example",
      "invoices": [
        { "id":"BB01","client":"Orion Offices","amount":12000,"issueDate":"2026-05-01","dueDate":"2026-05-15","paidDate":"2026-05-14","status":"paid" },
        { "id":"BB02","client":"Orion Offices","amount":15000,"issueDate":"2026-06-01","dueDate":"2026-06-15","paidDate":"2026-06-13","status":"paid" },
        { "id":"BB03","client":"Orion Offices","amount":18000,"issueDate":"2026-07-06","dueDate":"2026-07-20","paidDate":null,"status":"unpaid" },
        { "id":"BB04","client":"Lila Events","amount":22000,"issueDate":"2026-04-15","dueDate":"2026-04-29","paidDate":"2026-05-06","status":"paid_late" },
        { "id":"BB05","client":"Lila Events","amount":26000,"issueDate":"2026-06-10","dueDate":"2026-06-24","paidDate":null,"status":"unpaid" },
        { "id":"BB06","client":"GreenLeaf Co-work","amount":9000,"issueDate":"2026-07-08","dueDate":"2026-07-22","paidDate":null,"status":"unpaid" },
        { "id":"BB07","client":"GreenLeaf Co-work","amount":11000,"issueDate":"2026-05-20","dueDate":"2026-06-03","paidDate":"2026-06-02","status":"paid" }
      ]
    },
    {
      "id": "northline-studio", "name": "Northline Studio", "industry": "Design agency", "email": "hello@northline.example",
      "invoices": [
        { "id":"NS01","client":"Halcyon Brands","amount":120000,"issueDate":"2026-04-05","dueDate":"2026-05-05","paidDate":"2026-05-04","status":"paid" },
        { "id":"NS02","client":"Halcyon Brands","amount":95000,"issueDate":"2026-06-01","dueDate":"2026-07-01","paidDate":null,"status":"unpaid" },
        { "id":"NS03","client":"Meadow FMCG","amount":60000,"issueDate":"2026-03-20","dueDate":"2026-04-20","paidDate":"2026-05-02","status":"paid_late" },
        { "id":"NS04","client":"Meadow FMCG","amount":75000,"issueDate":"2026-06-15","dueDate":"2026-07-15","paidDate":null,"status":"unpaid" },
        { "id":"NS05","client":"Vertex Realty","amount":45000,"issueDate":"2026-07-10","dueDate":"2026-07-19","paidDate":null,"status":"unpaid" },
        { "id":"NS06","client":"Vertex Realty","amount":50000,"issueDate":"2026-07-12","dueDate":"2026-07-26","paidDate":null,"status":"unpaid" },
        { "id":"NS07","client":"Halcyon Brands","amount":80000,"issueDate":"2026-05-15","dueDate":"2026-06-14","paidDate":"2026-06-14","status":"paid" }
      ]
    }
  ]
}

2. lib/types.ts: Invoice, EnrichedInvoice, Business, Metrics types.
3. lib/riskEngine.ts — export TODAY = "2026-07-18". PURE functions (no fs, usable server+client):
   enrichInvoices(invoices) -> per invoice { ...it, daysToDue, overdue, clientHasLateHistory, risk } where
     red = unpaid AND (overdue OR clientHasLateHistory); yellow = unpaid AND daysToDue in 0..3 and not red; green = otherwise.
   getFlagged(enriched) -> risk !== green.
4. lib/metrics.ts — PURE computeMetrics(invoices): outstanding, overdue, flaggedCount, collected90d, collectionRatePct, monthly cashflow series (collected vs outstanding), per-client breakdown.
5. lib/businesses.ts (server): loadBusinesses() from data/businesses.json, getBusiness(id).
6. Route handlers, business-scoped — each accepts a sample business via ?business=<id> OR a custom business via POST body { business: { name, invoices[] } }:
   GET/POST /api/businesses  -> list of samples (id, name, industry, invoiceCount, outstanding)
   GET/POST /api/invoices    -> { business:{id,name,industry,email}, invoices: enriched[] }
   GET/POST /api/summary     -> { business, metrics, aiSummary:"" }
Risk/metrics code-computed only. Test /api/businesses, /api/invoices?business=brew-bloom, /api/summary?business=northline-studio and show JSON.
```

---

## E2 — Gemma AI (business-aware)

```
Add Gemma (Gemini API) integration to FloWise, server-side only, business-aware.

- Read process.env.GEMINI_API_KEY. Create .env.example with GEMINI_API_KEY= (no real .env). Ensure .env.local is gitignored.
- lib/ai.ts: callGemma(prompt) POSTs to
  https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=<KEY>
  body { contents:[{ parts:[{ text: prompt }] }] }, parse candidates[0].content.parts[0].text. try/catch returns a sensible fallback string (never throws).
- Wire AI (every prompt names the active business + industry so text is tailored):
  * /api/summary: from the business + computed metrics, a warm 2–3 sentence plain-language cash-flow summary for that business owner (no jargon). Fill aiSummary. Cache by businessId.
  * /api/invoices: for each FLAGGED invoice, a one-line reason (<=15 words) from client, amount, days overdue/to-due, history -> invoice.aiReason (green null). Promise.all + cache.
  * POST /api/followup { businessId?, business?, invoiceId }: draft a polite-but-firm follow-up email from the business's accounts team to the client about the at-risk/overdue invoice (amount, id, due date; ~4–6 sentences, signed with the business name) -> { draft }. Fallback template if no key.
Works for both sample (id) and uploaded (posted) businesses. Test summary/invoices/followup for two different businesses; show output.
```

---

## E3 — Onboarding entry + Business context + import + persistence

```
Build FloWise's onboarding entry — the "come in as a business" flow — plus the shared business state. Use design tokens + <Card>.

1. lib/businessContext.tsx — a BusinessContext provider holding: activeBusiness (id + name + industry + invoices), list of user-created businesses, setActiveBusiness, addBusiness. Persist activeBusiness id and any created businesses to localStorage; hydrate on load.
2. "/" Onboarding page (premium, centered on #F8F7F4):
   - FloWise olive logo + "Welcome to FloWise" (hero) + "Your AI cashflow copilot for small businesses" (muted).
   - "Choose a sample business": 3 selectable cards from GET /api/businesses (name, industry, invoice count, outstanding ₹). Selecting one sets it active.
   - an "or" divider.
   - "Bring your own workspace": a business Name input + an import control that accepts JSON or CSV of invoices (drag-drop or paste). CSV columns: id,client,amount,issueDate,dueDate,paidDate,status. Validate against the schema, show clear inline errors, preview count + a computed risk spread. A "Download template" link (sample CSV + JSON).
   - primary olive "Enter workspace →" button -> router.push('/dashboard'). Disabled until a business is selected/created.
3. Guard: /dashboard redirects to "/" if no active business. Motion: cards lift on hover, page fades in.
```

---

## E4 — Dashboard shell: sidebar + header (with switcher) + grid

```
Build the /dashboard shell to match the reference (floating icon sidebar + full-width header + 4-column grid), reading the active business from BusinessContext. Framer Motion.

- Page: bg #F8F7F4, centered max-w 1700, padding 32, big rounded outer surface; below the header a grid = fixed sidebar column + 4-col content grid (gap 24).
- Sidebar (components/dashboard/Sidebar.tsx): white rounded capsule, icons only (lucide 22px). Olive sunburst logo top. Nav: Dashboard (active dark square), Invoices, AI Workspace, Analytics, Clients, Documents; spacer; Settings, Logout; user avatar bottom. Hover scale 1.05, sliding highlight, ARIA + tooltips. Only Dashboard functional.
- Header (components/dashboard/Header.tsx): left = olive logo + a BUSINESS SWITCHER dropdown showing the active business name (lists samples + user-created; switching updates context) and, under it, "Good Morning · {activeBusiness.name}" hero with subtitle "{activeBusiness.industry} — your cash flow at a glance" (muted). Right = search pill "Search invoices…" + dark circular search button + two circular glass-hover buttons (messages w/ red dot, bell). Include a small "Switch / add business" affordance that routes to "/".
- Compose Sidebar + Header + an empty 4-col grid with labelled placeholders for Rows 1–4. Page fades in. Responsive 1700/1440/1024/mobile (sidebar collapses, search→icon, single column).
```

---

## E5 — Row 1: metric cards

```
Build Row 1: four metric cards spanning 4 columns, from React Query GET /api/summary for the active business (pass ?business=<id> for samples, or POST the custom business).

MetricCard.tsx (reusable): lucide icon in a soft circular tint, muted caption title, large count-up number (Framer Motion), small Recharts sparkline/mini-bars on the right, hover lift 4px.
Cards L→R from metrics: 1) Outstanding ₹  2) Flagged Invoices (count)  3) Collected (90d) ₹  4) Overdue ₹ — HIGHLIGHTED olive (#5F786A) filled bg, white text/number, white wavy line.
Currency ₹ with separators. Loading skeletons; graceful error.
```

---

## E6 — Row 2: Cash Flow chart + Collection gauge + Business profile

```
Build Row 2 (3 cards): Cash Flow chart (span 2), Collection gauge (span 1), Business profile (span 1). Data from /api/summary for the active business.

1. AnalyticsChart.tsx — "Cash Flow" (span 2): title + "✓ On track" pill + "Monthly ▾" filter (Week/Month/Year). Two inner stat pills ("Collected {rate}% ▲", "Outstanding ₹{outstanding} ▼") from real metrics. Large smooth Recharts area/line of the monthly series, soft grid, tooltip, animated draw-in. Olive stroke, sage fill.
2. CollectionCard.tsx — semicircular gauge ring showing collectionRatePct (animated fill), "Total Outstanding ₹{outstanding}" (olive), a short note.
3. ProfileCard.tsx — the ACTIVE business: logo/avatar, name, email, industry, and three stats: Invoices (total), Clients (distinct client count), Flagged (count). "Switch business" text button -> "/".
Responsive: stack under 1024.
```

---

## E7 — Row 3: Flagged Invoices + Activity Feed + AI Assistant

```
Build Row 3 (3 cards): Flagged Invoices (span 2), Activity Feed (span 1), AI Assistant (span 1). Data from /api/invoices + /api/summary for the active business. Lift selectedInvoiceId into shared dashboard state.

1. FlaggedInvoices.tsx (span 2): card "Flagged Invoices". Only risk red/yellow, sorted red-first then amount desc. Each row (<button>): client avatar/initials, client name, invoice id, amount ₹, due date, color-coded risk BADGE (red="At risk", yellow="Watch" — from invoice.risk, text label not color-only), invoice.aiReason muted below. Hover reveals "Draft follow-up →" + lift. Click sets selectedInvoiceId. Staggered fade-in. Exclude sentIds (E8).
2. ActivityFeed.tsx (span 1): timeline of recent events for this business (payment received, invoice flagged, follow-up sent) — avatar, action, timestamp, +/- status badge. Fade-in + hover highlight. Seed from paid/paid_late invoices; a live entry is added on send (E8).
3. AIAssistantCard.tsx (span 1): animated glowing olive AI orb (soft pulse), "AI Ready", the AI cash-flow summary (metrics.aiSummary, 2–3 sentences, business-specific), primary olive "Launch AI Assistant". Loading shimmer.
```

---

## E8 — Follow-Up side panel + In Progress tracker + wire loop

```
Complete the FloWise core loop for the active business.

1. FollowUpPanel.tsx — right slide-in overlay (Framer Motion, ~420px, dimmed backdrop; Esc + close + backdrop click dismiss, clearing selectedInvoiceId). On open, POST /api/followup { businessId or business, invoiceId } (React Query mutation), loading state, then editable <textarea> with the draft. Top: invoice context (client, id, amount ₹, due date, risk badge). Buttons: olive "Send", "Cancel".
2. Shared dashboard state (per active business): sentInvoices [{ invoice, message, sentAt }] and sentIds Set. onSend(invoiceId, message): push entry (timestamp), add to sentIds, close panel, add "Follow-up sent" to Activity Feed. Flagged list excludes sentIds. (Key this state by business id so switching business keeps trackers separate.)
3. Row 4 — InProgressTracker.tsx: "In Progress" listing sent follow-ups (client, invoice id, amount ₹, "Sent • <relative time>"). Empty: muted "No follow-ups sent yet." Fade-in new entries.
Verify: pick Aria → summary loads → flag INV008 → panel drafts → edit → Send → INV008 leaves Flagged, appears in In Progress, Activity gains an item. Switch to Brew & Bloom → its own flagged/trackers show.
```

---

## E9 — Polish: motion, responsive, a11y

```
Final polish on the FloWise dashboard + onboarding.

- Motion: numbers count up on mount, charts animate on load, gauge rings fill smoothly, sidebar highlight slides, cards lift 4px, buttons scale 1.02, pages fade. Consistent easing/durations; nothing abrupt.
- Responsive: 1700/1440/1024/mobile. Mobile: sidebar collapses (top bar/drawer), search→icon, grid single column, cards stack, business switcher stays reachable, onboarding cards stack.
- A11y: keyboard nav across onboarding, sidebar, switcher, invoice rows, panel; visible focus rings; ARIA labels; badges convey status via text not color alone; side panel traps focus + restores on close.
- Performance: lazy-load Recharts, memoize, avoid needless re-renders, proper loading/empty states.
Final visual pass vs the reference: warm neutral bg, floating white sidebar, generous whitespace, olive sparingly. It should feel expensive — and clearly work for ANY business, not just the samples.
```

---

## Verify (end-to-end)

1. `npm run dev`; optionally add `GEMINI_API_KEY` to `.env.local` (fallback text works without it).
2. `/` onboarding: three sample businesses render with real outstanding figures; selecting one enters `/dashboard`.
3. Dashboard scoped to the chosen business: metrics count up, **Overdue** olive-filled, Cash Flow chart draws in, gauge fills, profile shows that business.
4. Flagged Invoices + AI reasons match the business (Aria: INV008/INV010 red, INV003 yellow; Brew & Bloom: BB05 red, BB03 yellow; Northline: NS02/NS04 red, NS05 yellow).
5. Header switcher swaps businesses live; trackers stay per-business. Click flagged → draft → edit → Send → moves to In Progress + Activity entry.
6. "Bring your own": paste/upload a CSV/JSON → validates → new workspace dashboard renders with correct risk badges.
7. Responsive 1700/1440/1024/mobile; keyboard + focus states pass.

## Notes / risks

- Model id `gemma-4-26b-a4b-it` is unusual (public ids look like `gemma-3-27b-it`); if it 404s the fallback keeps the demo alive — swap the id in one place (`lib/ai.ts`).
- Only the **Dashboard** sidebar item is functional; the rest are elegant non-clickable chrome.
- Gemma via Gemini API supports only `contents`/`parts` (no systemInstruction), so prompts are inlined.
- Uploaded businesses live in the browser (context + localStorage) only — no server-side persistence, which is fine for the hackathon.
