import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/parent")({
  head: () => ({ meta: [{ title: "Parent Portal — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Parent" title="Family dashboard" subtitle="Your child's progress, attendance and school communications." accent="gold">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Children" value="2" />
        <StatCard label="Attendance" value="98%" hint="This term" />
        <StatCard label="Outstanding fees" value="₦0" />
        <StatCard label="Upcoming events" value="3" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Academic reports" description="Termly results and progress cards." />
        <QuickLink label="Attendance" description="Daily register and absence notes." />
        <QuickLink label="Fees & payments" description="Invoices, receipts and online payment." />
        <QuickLink label="Homework" description="Assignments and submission tracking." />
        <QuickLink label="Messages" description="Direct chat with class teachers." />
        <QuickLink label="Calendar" description="Term dates, events and holidays." />
      </div>
    </DashboardShell>
  );
}
