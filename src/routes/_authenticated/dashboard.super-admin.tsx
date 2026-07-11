import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Super Admin" title="Institution overview" subtitle="Full oversight across every division, department and portal." accent="royal">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total students" value="1,248" hint="Across 3 divisions" />
        <StatCard label="Staff" value="184" hint="Teaching & support" />
        <StatCard label="Active parents" value="982" />
        <StatCard label="Term revenue" value="₦412M" hint="This term" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="User management" description="Provision accounts, assign roles, deactivate access." />
        <QuickLink label="Academic calendar" description="Publish terms, holidays and school-wide events." />
        <QuickLink label="Financial overview" description="Consolidated fees, payroll and expenditure." />
        <QuickLink label="Compliance & audit" description="Policies, incident logs and safeguarding records." />
        <QuickLink label="Divisions" description="Nursery, Primary and Secondary leadership." />
        <QuickLink label="Reports" description="Analytics across enrolment, results and finance." />
      </div>
    </DashboardShell>
  );
}
