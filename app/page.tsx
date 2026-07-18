import Link from "next/link";
import { Card } from "@/components/ui/card";

// Placeholder onboarding entry — replaced by the full "come in as a business"
// flow in E3. Kept minimal so E0 verifies end-to-end.
export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <Card className="max-w-md text-center">
        <h1 className="text-hero font-bold text-ink">FloWise</h1>
        <p className="mt-2 text-body text-muted">
          Your AI cashflow copilot for small businesses.
        </p>
        <p className="mt-1 text-caption text-muted">Onboarding arrives in E3.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-pill bg-olive px-5 py-2.5 text-body font-medium text-white transition hover:bg-olive-dark"
        >
          Go to dashboard →
        </Link>
      </Card>
    </main>
  );
}
