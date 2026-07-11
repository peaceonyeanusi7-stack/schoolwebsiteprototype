import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/school-admin")({
  head: () => ({ meta: [{ title: "School Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="School Admin" title="Operations dashboard" subtitle="Day-to-day management of admissions, staff and student records." accent="royal">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="New enquiries" value="34" hint="This week" />
        <StatCard label="Pending admissions" value="12" />
        <StatCard label="Attendance today" value="96%" />
        <StatCard label="Open tickets" value="7" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Admissions pipeline" description="Review applications and schedule assessments." />
        <QuickLink label="Staff roster" description="Manage teachers, support staff and shifts." />
        <QuickLink label="Timetables" description="Class allocations and room bookings." />
        <QuickLink label="Announcements" description="Broadcast to parents, staff and students." />
        <QuickLink label="Student records" description="Profiles, guardians and health notes." />
        <QuickLink label="Events" description="Trips, PTA meetings and inter-house activities." />
      </div>
    </DashboardShell>
  );
}
