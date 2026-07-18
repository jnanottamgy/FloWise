import { Card } from "@/components/ui/card";

// Placeholder dashboard — the real shell (sidebar + header + grid) lands in E4,
// and its content rows in E5–E8.
export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <Card>
        <p className="text-body text-muted">
          Dashboard shell arrives in E4.
        </p>
      </Card>
    </main>
  );
}
