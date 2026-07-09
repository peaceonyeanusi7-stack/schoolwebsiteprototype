import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Calendar } from "lucide-react";
import campus from "@/assets/campus.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Events — Oasis Academy" },
      { name: "description", content: "Latest news, achievements, events and blog articles from Oasis Academy." },
      { property: "og:title", content: "News & Events — Oasis Academy" },
      { property: "og:description", content: "Stories, achievements and events from our community." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: News,
});

function News() {
  const posts = [
    { tag: "Achievement", title: "Oasis wins Lagos State STEM Championship for third year", date: "October 12, 2026", excerpt: "Our robotics team took home gold in the highly competitive state finals." },
    { tag: "Event", title: "Annual Cultural Day celebrates Nigeria's rich heritage", date: "September 28, 2026", excerpt: "Students, staff and families gathered for a joyful day of music, dance and food." },
    { tag: "Admissions", title: "Scholarship applications now open for 2027 intake", date: "September 15, 2026", excerpt: "Up to 20 full and partial scholarships available for exceptional students." },
    { tag: "Parenting", title: "5 tips to support your child's reading at home", date: "September 4, 2026", excerpt: "Practical strategies from our literacy coordinator." },
    { tag: "Academic", title: "IGCSE results place Oasis among Nigeria's top 5", date: "August 22, 2026", excerpt: "94% of candidates achieved A*–C grades in six or more subjects." },
    { tag: "Wellness", title: "Introducing our new counselling and wellness programme", date: "August 10, 2026", excerpt: "A whole-school approach to student mental health and wellbeing." },
  ];
  return (
    <>
      <PageHero
        eyebrow="News & Events"
        title={<>Stories from <span className="italic text-gold">our community</span>.</>}
        subtitle="Achievements, events, and voices from across Oasis Academy."
      />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="rounded-3xl overflow-hidden bg-card border border-border group cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={campus} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-royal/10 text-royal font-semibold">{p.tag}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> {p.date}</span>
                </div>
                <h3 className="font-display text-lg text-ink mb-2 group-hover:text-royal transition-colors">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
