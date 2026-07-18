# FloWise — AI Cashflow Copilot for SMEs

A premium AI dashboard that helps **any small business** understand and act on **cash-flow risk** using Gemma AI. A business "comes in" via an onboarding entry — picking a preloaded **sample business** (Aria Textiles, Brew & Bloom Café, or Northline Studio) or creating its own **Workspace** by uploading/pasting invoices — then lands on a dashboard scoped to that business.

**Terminology:** a business that *uses* FloWise = a **Business / Workspace**; the people who *owe it money* = **clients**.

The dashboard is one premium workspace:

1. **Cash Flow Summary** — plain-language, AI-generated summary (in the AI Assistant card)
2. **Flagged Invoices** — at-risk invoices with color-coded risk badges (green / yellow / red) and a one-line AI reason
3. **Follow-Up Draft** — clicking a flagged invoice opens a side panel with an AI-drafted, editable follow-up + a Send button
4. **In Progress** — sent follow-ups move to a tracker at the bottom

A header **business switcher** swaps between businesses live; each keeps its own trackers.

## Tech stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Shadcn/ui
- **Motion / charts / icons:** Framer Motion · Recharts · Lucide React
- **Data fetching:** React Query
- **AI:** Gemma via the Gemini API (`gemma-4-26b-a4b-it`), called server-side from Next.js route handlers
- **Data:** static JSON (`data/invoices.json`) — no database

## Design language

Apple / Linear / Stripe / Framer aesthetic: warm neutral `#F8F7F4` background, floating white icon sidebar, olive `#5F786A` accent used sparingly, 28px rounded cards, soft shadows, generous whitespace, alive-but-calm motion. Layout modeled on a supplied reference dashboard.

## How this repo is built

The app is built **element by element** from a sequenced prompt pack. See **[PROMPTS.md](PROMPTS.md)** — paste E0 → E9 into your AI coding tool in order, committing after each.

## Running (after E0+)

```bash
npm install
# add your key (optional — a canned fallback works without it):
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

Open http://localhost:3000.

## Notes

- Risk badge colors are **deterministic** (computed in code from due dates + payment history); AI writes only the one-line human reasons and the summary/follow-up text. This keeps demos reliable even if the API is unavailable.
- Reference date for the demo is fixed at `2026-07-18`.
