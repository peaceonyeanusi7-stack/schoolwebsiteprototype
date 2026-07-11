import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({ meta: [{ title: "Student Portal — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Student" title="Hello, Scholar" subtitle="Your classes, assignments and results — all in one place." accent="sunshine">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Classes today" value="6" />
        <StatCard label="Assignments due" value="3" />
        <StatCard label="Term average" value="82%" />
        <StatCard label="Attendance" value="99%" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Timetable" description="Your weekly schedule." />
        <QuickLink label="Assignments" description="Homework and project submissions." />
        <QuickLink label="Results" description="Test scores and end-of-term reports." />
        <QuickLink label="Library" description="Borrow books and reserve e-resources." />
        <QuickLink label="Clubs" description="Activities, sports and societies." />
        <QuickLink label="Messages" description="Chat with teachers and classmates." />
      </div>
    </DashboardShell>
  );
}
