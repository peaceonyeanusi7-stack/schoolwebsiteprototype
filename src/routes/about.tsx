import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Award, Target, Heart, Users, ArrowRight } from "lucide-react";
import principalImg from "@/assets/principal.jpg";
import campusImg from "@/assets/campus.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Oasis Academy — Our Vision, Mission & Story" },
      { name: "description", content: "Discover Oasis Academy — our history since 1998, mission, vision, values, and leadership team committed to nurturing future leaders." },
      { property: "og:title", content: "About Oasis Academy" },
      { property: "og:description", content: "Our vision, mission, values and leadership." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  const values = [
    { icon: Award, title: "Excellence", desc: "Uncompromising standards in teaching, learning, and character." },
    { icon: Heart, title: "Compassion", desc: "A culture of kindness, empathy and service to others." },
    { icon: Target, title: "Discipline", desc: "Focused habits that build lifelong success and integrity." },
    { icon: Users, title: "Community", desc: "Strong partnerships between students, teachers and families." },
  ];
  return (
    <>
      <PageHero
        eyebrow="About Oasis"
        title={<>A legacy of <span className="italic text-gold">excellence</span> since 1998.</>}
        subtitle="For over twenty-five years, Oasis Academy has shaped confident, compassionate, and capable young leaders across Nigeria and the world."
      />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden aspect-[21/9]">
            <img src={campusImg} alt="Oasis Academy campus" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Our Vision</p>
            <p className="font-display text-2xl text-royal leading-snug">
              To be Africa's most trusted school — where every child discovers their potential.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Our Mission</p>
            <p className="text-muted-foreground leading-relaxed">
              To provide a world-class education that combines academic rigour, character formation, innovation, and global citizenship — preparing every student for a life of purpose and impact.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Our Philosophy</p>
            <p className="text-muted-foreground leading-relaxed">
              Every child is unique, gifted, and capable of extraordinary things when nurtured by loving educators in a safe, stimulating environment that honours both tradition and innovation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Core Values</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal">What we stand for.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl bg-background border border-border">
                <div className="size-11 rounded-xl bg-royal/10 flex items-center justify-center mb-4">
                  <v.icon className="size-5 text-royal" />
                </div>
                <h3 className="font-display text-xl text-ink mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <img src={principalImg} alt="Dr. Adaeze Okafor" className="rounded-3xl w-full aspect-[4/5] object-cover shadow-xl max-w-md" />
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Leadership</p>
            <h2 className="font-display text-4xl text-royal mb-4">Dr. Adaeze Okafor</h2>
            <p className="text-sm text-muted-foreground mb-6">Head of School · EdD (Harvard) · 22 years in education</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Dr. Okafor joined Oasis in 2015 after leadership roles at leading international schools in London and Accra. Her doctoral research in child development guides our whole-school approach to learning.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 text-royal font-semibold">
              Meet our full leadership <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
