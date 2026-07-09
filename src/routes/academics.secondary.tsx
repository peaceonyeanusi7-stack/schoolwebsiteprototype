import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight } from "lucide-react";
import img from "@/assets/division-secondary.jpg";

export const Route = createFileRoute("/academics/secondary")({
  head: () => ({
    meta: [
      { title: "Secondary School — Oasis Academy" },
      { name: "description", content: "Secondary education for ages 11–18 preparing students for WAEC, NECO, IGCSE and SAT with pathways in Sciences, Commercial, Arts, Coding and Robotics." },
      { property: "og:title", content: "Secondary School — Oasis Academy" },
      { property: "og:description", content: "Preparing future leaders for top universities worldwide." },
      { property: "og:url", content: "/academics/secondary" },
    ],
    links: [{ rel: "canonical", href: "/academics/secondary" }],
  }),
  component: Secondary,
});

function Secondary() {
  const junior = ["Core sciences", "Mathematics", "English & Literature", "Social Studies", "ICT & Coding", "Creative Arts"];
  const senior = ["Science stream", "Commercial stream", "Arts stream", "Robotics & AI", "Entrepreneurship", "University counselling"];
  const pathways = ["WAEC / NECO", "Cambridge IGCSE", "SAT & AP", "TOEFL / IELTS"];
  return (
    <>
      <PageHero
        eyebrow="Ages 11 – 18"
        accent="royal"
        title={<>Preparing <span className="italic text-gold">future leaders</span>.</>}
        subtitle="Academic rigour, career mentorship, and global exam pathways that open doors to the world's top universities."
      />
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <img src={img} alt="Secondary classroom" className="w-full aspect-[16/9] object-cover rounded-3xl" />
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-royal/5 border border-royal/15">
            <p className="text-xs uppercase tracking-widest text-royal font-semibold mb-3">Junior Secondary</p>
            <h3 className="font-display text-2xl text-royal mb-4">Years 7 – 9</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {junior.map((s) => <li key={s} className="flex items-center gap-2"><span className="size-1 rounded-full bg-royal" /> {s}</li>)}
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-gold/10 border border-gold/25">
            <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">Senior Secondary</p>
            <h3 className="font-display text-2xl text-royal mb-4">Years 10 – 12</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {senior.map((s) => <li key={s} className="flex items-center gap-2"><span className="size-1 rounded-full bg-gold" /> {s}</li>)}
            </ul>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl text-royal mb-6">Exam Pathways</h3>
          <div className="flex flex-wrap gap-3">
            {pathways.map((p) => (
              <span key={p} className="px-5 py-3 rounded-full bg-card border border-border text-sm font-semibold text-royal">{p}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Link to="/admissions" className="inline-flex items-center gap-2 bg-royal text-white px-8 py-4 rounded-full font-semibold">
            Apply to Secondary <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
