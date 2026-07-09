import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight } from "lucide-react";
import img from "@/assets/division-primary.jpg";

export const Route = createFileRoute("/academics/primary")({
  head: () => ({
    meta: [
      { title: "Primary School — Oasis Academy" },
      { name: "description", content: "Primary education for ages 6–10 combining British and Nigerian curricula with STEM, ICT, languages, arts and leadership development." },
      { property: "og:title", content: "Primary School — Oasis Academy" },
      { property: "og:description", content: "Strong foundations for confident young learners." },
      { property: "og:url", content: "/academics/primary" },
    ],
    links: [{ rel: "canonical", href: "/academics/primary" }],
  }),
  component: Primary,
});

function Primary() {
  const pillars = [
    { title: "Literacy & Numeracy", desc: "Daily focused instruction with rich texts and problem-solving." },
    { title: "STEM & ICT", desc: "Coding from Year 2, weekly science, and integrated tablets." },
    { title: "Languages", desc: "English, French, and Yoruba/Igbo/Hausa options." },
    { title: "Character Education", desc: "Weekly assemblies, values program, and service projects." },
    { title: "Sports & Wellness", desc: "Swimming, football, athletics, and mindful movement." },
    { title: "Arts & Music", desc: "Choir, instruments, drama, and dedicated art studios." },
  ];
  return (
    <>
      <PageHero
        eyebrow="Ages 6 – 10"
        accent="sunshine"
        title={<>Building <span className="italic text-gold">foundations</span> that last.</>}
        subtitle="Our Primary programme develops confident, curious, and capable learners ready for the next academic challenge."
      />
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <img src={img} alt="Primary classroom" className="w-full aspect-[16/9] object-cover rounded-3xl" />
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl bg-sunshine/10 border border-sunshine/20">
              <h3 className="font-display text-xl text-royal mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-royal mb-4">Curious to learn more?</h2>
          <Link to="/admissions" className="inline-flex items-center gap-2 bg-royal text-white px-8 py-4 rounded-full font-semibold">
            Apply to Primary <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
