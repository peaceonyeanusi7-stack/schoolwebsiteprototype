import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/pending")({
  head: () => ({ meta: [{ title: "Access pending — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Awaiting role" title="Your account has no role assigned yet" subtitle="Please contact the school administrator to have a role assigned to your account." accent="royal">
      <div className="rounded-2xl bg-card border border-border p-8 text-sm text-muted-foreground">
        Once a Super Admin or School Admin assigns you a role, sign in again and you'll be taken to your dashboard automatically.
      </div>
    </DashboardShell>
  );
}
