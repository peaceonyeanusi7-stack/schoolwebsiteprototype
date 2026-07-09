import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Oasis Academy" },
      { name: "description", content: "Join Oasis Academy as a teacher, administrator, nurse, ICT staff or librarian. Explore open roles and apply online." },
      { property: "og:title", content: "Careers — Oasis Academy" },
      { property: "og:description", content: "Join a school that changes lives." },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: Careers,
});

function Careers() {
  const roles = [
    { title: "Primary Class Teacher", dept: "Primary", type: "Full-time" },
    { title: "Head of Sciences", dept: "Secondary", type: "Full-time" },
    { title: "Music Instructor", dept: "Arts", type: "Part-time" },
    { title: "School Nurse", dept: "Health", type: "Full-time" },
    { title: "ICT Support Officer", dept: "IT", type: "Full-time" },
    { title: "Librarian", dept: "Support", type: "Full-time" },
  ];
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={<>Teach where you <span className="italic text-gold">matter</span>.</>}
        subtitle="Join a school that invests deeply in professional growth, wellbeing, and community."
      />
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-3">
          {roles.map((r) => (
            <div key={r.title} className="p-6 rounded-2xl bg-card border border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-royal">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.dept} · {r.type}</p>
              </div>
              <button className="bg-royal text-white px-6 py-3 rounded-full text-sm font-semibold">Apply</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
