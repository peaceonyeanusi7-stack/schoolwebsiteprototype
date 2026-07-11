import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/librarian")({
  head: () => ({ meta: [{ title: "Librarian — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Librarian" title="Library dashboard" subtitle="Catalogue, circulation and reading programmes." accent="gold">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Titles" value="18,420" />
        <StatCard label="On loan" value="612" />
        <StatCard label="Overdue" value="24" />
        <StatCard label="New this term" value="86" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Catalogue" description="Add, edit and archive titles." />
        <QuickLink label="Circulation" description="Loans, returns and reservations." />
        <QuickLink label="Members" description="Student and staff library accounts." />
        <QuickLink label="Overdue" description="Send reminders and manage fines." />
        <QuickLink label="Reading programmes" description="Track class reading challenges." />
        <QuickLink label="Reports" description="Circulation trends and inventory." />
      </div>
    </DashboardShell>
  );
}
