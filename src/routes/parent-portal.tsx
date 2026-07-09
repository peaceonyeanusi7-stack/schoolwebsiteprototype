import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/parent-portal")({
  head: () => ({
    meta: [
      { title: "Parent Portal — Oasis Academy" },
      { name: "description", content: "Sign in to the Oasis Parent Portal for attendance, reports, fees, homework, messages and the school calendar." },
      { property: "og:title", content: "Parent Portal — Oasis Academy" },
      { property: "og:description", content: "Sign in to your family dashboard." },
      { property: "og:url", content: "/parent-portal" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/parent-portal" }],
  }),
  component: ParentPortal,
});

function ParentPortal() {
  return (
    <>
      <PageHero eyebrow="Parent Portal" title="Family sign-in" subtitle="Access your child's progress, attendance, fees and school calendar in one place." />
      <section className="pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div className="size-12 rounded-2xl bg-royal/10 flex items-center justify-center mb-6"><Lock className="size-5 text-royal" /></div>
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <label className="grid gap-2"><span className="text-sm font-semibold">Email</span><input type="email" className="rounded-xl border border-border px-4 py-3 bg-background" /></label>
              <label className="grid gap-2"><span className="text-sm font-semibold">Password</span><input type="password" className="rounded-xl border border-border px-4 py-3 bg-background" /></label>
              <button className="bg-royal text-white rounded-full py-3 font-semibold">Sign In</button>
              <a href="#" className="text-sm text-royal text-center">Forgot password?</a>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
