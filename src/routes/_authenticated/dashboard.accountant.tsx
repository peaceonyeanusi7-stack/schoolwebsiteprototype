import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/accountant")({
  head: () => ({ meta: [{ title: "Accountant — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Accountant" title="Finance dashboard" subtitle="Fees, payroll and financial reporting." accent="emerald">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Fees collected" value="₦318M" hint="This term" />
        <StatCard label="Outstanding" value="₦42M" />
        <StatCard label="Payroll due" value="₦68M" hint="This month" />
        <StatCard label="Invoices issued" value="1,204" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Fee collection" description="Track and reconcile student payments." />
        <QuickLink label="Invoices" description="Generate and send invoices to parents." />
        <QuickLink label="Payroll" description="Staff salaries, benefits and deductions." />
        <QuickLink label="Expenses" description="Approve and record operational expenses." />
        <QuickLink label="Reports" description="Monthly, termly and annual financials." />
        <QuickLink label="Bank reconciliation" description="Match transactions with statements." />
      </div>
    </DashboardShell>
  );
}
