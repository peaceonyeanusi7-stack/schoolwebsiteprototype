import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight } from "lucide-react";
import divisionNursery from "@/assets/division-nursery.jpg";
import divisionPrimary from "@/assets/division-primary.jpg";
import divisionSecondary from "@/assets/division-secondary.jpg";

export const Route = createFileRoute("/academics/")({
  head: () => ({
    meta: [
      { title: "Academics — Oasis Academy" },
      { name: "description", content: "Explore our academic divisions — Nursery, Primary and Secondary — offering blended British and Nigerian curricula from age 2 to 18." },
      { property: "og:title", content: "Academics — Oasis Academy" },
      { property: "og:description", content: "Nursery, Primary and Secondary excellence under one roof." },
      { property: "og:url", content: "/academics" },
    ],
    links: [{ rel: "canonical", href: "/academics" }],
  }),
  component: Academics,
});

const divisions = [
  { to: "/academics/nursery" as const, img: divisionNursery, title: "Nursery School", age: "Ages 2 – 5", color: "emerald" },
  { to: "/academics/primary" as const, img: divisionPrimary, title: "Primary School", age: "Ages 6 – 10", color: "sunshine" },
  { to: "/academics/secondary" as const, img: divisionSecondary, title: "Secondary School", age: "Ages 11 – 18", color: "royal" },
];

function Academics() {
  return (
    <>
      <PageHero
        eyebrow="Academics"
        title={<>A complete <span className="italic text-gold">learning</span> pathway.</>}
        subtitle="Three divisions. One unified philosophy of excellence. Choose a stage to explore our curriculum, faculty and outcomes."
      />
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {divisions.map((d) => (
            <Link key={d.to} to={d.to} className="group rounded-3xl overflow-hidden bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={d.img} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{d.age}</p>
                <h3 className="font-display text-2xl text-royal mb-3">{d.title}</h3>
                <span className="text-sm font-semibold text-royal inline-flex items-center gap-2">
                  Explore <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
