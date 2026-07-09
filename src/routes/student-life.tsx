import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/student-life")({
  head: () => ({
    meta: [
      { title: "Student Life — Oasis Academy" },
      { name: "description", content: "Sports, arts, clubs, leadership programmes and community service that shape well-rounded students at Oasis Academy." },
      { property: "og:title", content: "Student Life — Oasis Academy" },
      { property: "og:description", content: "Beyond the classroom — clubs, sports, arts and leadership." },
      { property: "og:url", content: "/student-life" },
    ],
    links: [{ rel: "canonical", href: "/student-life" }],
  }),
  component: StudentLife,
});

function StudentLife() {
  const groups = [
    { title: "Sports", items: ["Football", "Basketball", "Swimming Squad", "Tennis", "Athletics", "Table Tennis"] },
    { title: "Arts & Culture", items: ["Choir", "Drama Society", "Fine Arts", "Instrumental Music", "Dance", "Cultural Heritage"] },
    { title: "Academic Clubs", items: ["Debate Society", "Model UN", "Young Scientists", "Chess Club", "Press Club", "Coding Club"] },
    { title: "Leadership & Service", items: ["Prefect Body", "Community Service", "Entrepreneurship", "Peer Mentoring", "Environmental Club", "Faith Fellowship"] },
  ];
  return (
    <>
      <PageHero
        eyebrow="Student Life"
        title={<>Where <span className="italic text-gold">passions</span> take flight.</>}
        subtitle="From the football field to the debate stage, every student finds their voice, their team, and their calling."
      />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div key={g.title} className="p-8 rounded-3xl bg-card border border-border">
              <h3 className="font-display text-2xl text-royal mb-6">{g.title}</h3>
              <div className="flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-emerald/5 border border-emerald/20 text-sm text-emerald font-medium">{i}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
