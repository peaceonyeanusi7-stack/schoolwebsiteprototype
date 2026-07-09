import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight } from "lucide-react";
import img from "@/assets/division-nursery.jpg";

export const Route = createFileRoute("/academics/nursery")({
  head: () => ({
    meta: [
      { title: "Nursery School — Oasis Academy" },
      { name: "description", content: "Play-based early years education for ages 2–5 focused on curiosity, motor skills, language and social development at Oasis Academy Lagos." },
      { property: "og:title", content: "Nursery School — Oasis Academy" },
      { property: "og:description", content: "A joyful, play-based world of discovery for ages 2 to 5." },
      { property: "og:url", content: "/academics/nursery" },
    ],
    links: [{ rel: "canonical", href: "/academics/nursery" }],
  }),
  component: Nursery,
});

function Nursery() {
  const pillars = [
    { title: "Play-Based Curriculum", desc: "Hands-on discovery through structured play, songs, and stories." },
    { title: "Early Literacy", desc: "Phonics, storytelling, and pre-reading skills in a language-rich environment." },
    { title: "Motor Development", desc: "Fine and gross motor skills through art, music, and movement." },
    { title: "Social & Emotional", desc: "Kindness, sharing, and self-regulation guided by nurturing teachers." },
    { title: "Creative Arts", desc: "Painting, dance, drama, and music every single week." },
    { title: "Outdoor Learning", desc: "Safe, secure playgrounds with nature-based exploration." },
  ];
  return (
    <>
      <PageHero
        eyebrow="Ages 2 – 5"
        accent="emerald"
        title={<>A joyful world of <span className="italic text-gold">discovery</span>.</>}
        subtitle="Our Nursery is a warm, colourful home where our youngest learners take their first confident steps into education."
      />
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <img src={img} alt="Nursery classroom" className="w-full aspect-[16/9] object-cover rounded-3xl" />
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl bg-emerald/5 border border-emerald/15">
              <h3 className="font-display text-xl text-royal mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-royal mb-4">Ready to visit?</h2>
          <p className="text-muted-foreground mb-6">Come see our Nursery in action. Tours run every Tuesday and Thursday.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-emerald text-white px-8 py-4 rounded-full font-semibold">
            Book a Nursery Tour <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
