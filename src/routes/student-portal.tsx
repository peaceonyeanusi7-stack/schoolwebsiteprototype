import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/student-portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — Oasis Academy" },
      { name: "description", content: "Sign in to the Oasis Student Portal for timetable, assignments, results, resources and messages." },
      { property: "og:title", content: "Student Portal — Oasis Academy" },
      { property: "og:description", content: "Sign in to your student dashboard." },
      { property: "og:url", content: "/student-portal" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/student-portal" }],
  }),
  component: StudentPortal,
});

function StudentPortal() {
  return (
    <>
      <PageHero eyebrow="Student Portal" title="Student sign-in" subtitle="Your timetable, assignments, results and resources — all in one place." />
      <section className="pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div className="size-12 rounded-2xl bg-emerald/10 flex items-center justify-center mb-6"><Lock className="size-5 text-emerald" /></div>
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <label className="grid gap-2"><span className="text-sm font-semibold">Student ID</span><input type="text" className="rounded-xl border border-border px-4 py-3 bg-background" /></label>
              <label className="grid gap-2"><span className="text-sm font-semibold">Password</span><input type="password" className="rounded-xl border border-border px-4 py-3 bg-background" /></label>
              <button className="bg-emerald text-white rounded-full py-3 font-semibold">Sign In</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
