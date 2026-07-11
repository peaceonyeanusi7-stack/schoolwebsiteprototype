import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/teacher")({
  head: () => ({ meta: [{ title: "Teacher — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <DashboardShell roleLabel="Teacher" title="Good morning, Teacher" subtitle="Your classes, lessons and student progress at a glance." accent="emerald">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Classes today" value="5" />
        <StatCard label="Assignments to grade" value="23" />
        <StatCard label="Students" value="142" />
        <StatCard label="Messages" value="4" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="My timetable" description="Today's schedule and room assignments." />
        <QuickLink label="Attendance" description="Mark register for each class period." />
        <QuickLink label="Gradebook" description="Enter scores and generate reports." />
        <QuickLink label="Lesson plans" description="Curriculum planner and resources." />
        <QuickLink label="Parent messages" description="Communicate with guardians directly." />
        <QuickLink label="Behaviour notes" description="Log commendations and incidents." />
      </div>
    </DashboardShell>
  );
}
