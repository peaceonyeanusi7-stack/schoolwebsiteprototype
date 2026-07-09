import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap, Users, Shield, Cpu, Trophy, Palette,
  Sparkles, Globe, HeartHandshake, BookOpen, Music, TreeDeciduous,
  ArrowRight, Star, Quote, Play, Calendar, MapPin,
} from "lucide-react";

import heroSecondary from "@/assets/hero-secondary.jpg";
import heroNursery from "@/assets/hero-nursery.jpg";
import divisionNursery from "@/assets/division-nursery.jpg";
import divisionPrimary from "@/assets/division-primary.jpg";
import divisionSecondary from "@/assets/division-secondary.jpg";
import principalImg from "@/assets/principal.jpg";
import campusImg from "@/assets/campus.jpg";
import facilityLab from "@/assets/facility-lab.jpg";
import facilitySports from "@/assets/facility-sports.jpg";
import facilityLibrary from "@/assets/facility-library.jpg";
import facilityCoding from "@/assets/facility-coding.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oasis Academy — Premium Nursery, Primary & Secondary School" },
      { name: "description", content: "A leading private school in Lagos offering a complete educational journey from nursery through secondary, combining academic excellence, character development, and global standards." },
      { property: "og:title", content: "Oasis Academy — Premium Nursery, Primary & Secondary School" },
      { property: "og:description", content: "Nurturing the next generation of African leaders through world-class education." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Divisions />
      <PrincipalWelcome />
      <WhyChoose />
      <Facilities />
      <AdmissionsJourney />
      <StudentLife />
      <Testimonials />
      <NewsPreview />
      <FinalCTA />
    </>
  );
}

/* ------- Sections ------- */

function Hero() {
  return (
    <section className="relative pt-14 md:pt-20 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="size-1.5 rounded-full bg-emerald animate-pulse" />
              Global Excellence in Lagos
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.02] text-balance text-royal mb-6">
              Nurturing the next generation of{" "}
              <span className="text-gold italic">African leaders</span>.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl text-pretty">
              From the first steps in Nursery to graduation in Secondary, Oasis Academy provides a world-class educational journey that blends innovation, discipline, and deep-rooted values.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admissions"
                className="bg-royal text-white px-8 py-4 rounded-full font-semibold shadow-xl shadow-royal/20 hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2"
              >
                Apply for Admission <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="bg-card border border-border px-8 py-4 rounded-full font-semibold hover:bg-muted transition-colors inline-flex items-center gap-2"
              >
                <Play className="size-4" /> Book a Campus Tour
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Stat value="25+" label="Years of Excellence" />
              <Stat value="1:12" label="Teacher Ratio" />
              <Stat value="100%" label="Uni Placement" />
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-2 ring-1 ring-black/5">
              <img
                src={heroSecondary}
                alt="Secondary school students in a science laboratory"
                width={800}
                height={1000}
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-6 md:-left-12 z-20 w-1/2 rounded-3xl overflow-hidden shadow-2xl -rotate-3 border-4 border-surface">
              <img
                src={heroNursery}
                alt="Nursery school child painting joyfully"
                width={600}
                height={600}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-4 z-20 bg-sunshine rounded-3xl p-5 shadow-xl max-w-[180px] rotate-3">
              <p className="font-display text-3xl font-medium text-royal-deep leading-none">A+</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-royal-deep/70 mt-2">
                WAEC & IGCSE Excellence
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-medium text-royal">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TrustBar() {
  const items = ["WAEC Accredited", "IGCSE Cambridge Centre", "British Council Partner", "NECO Approved", "SAT Test Site", "AISEN Member"];
  return (
    <section className="border-y border-border bg-card overflow-hidden py-6">
      <div className="flex whitespace-nowrap marquee-track">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-8 shrink-0">
            <span className="size-1.5 rounded-full bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Divisions() {
  const divisions = [
    {
      slug: "/academics/nursery" as const,
      img: divisionNursery,
      color: "emerald",
      num: "01",
      title: "Nursery School",
      age: "Ages 2 – 5",
      blurb: "A joyful world of play-based discovery — where curiosity, motor skills, and social confidence bloom together.",
      pillars: ["Play-based curriculum", "Language development", "Sensory & motor skills", "Social discovery"],
    },
    {
      slug: "/academics/primary" as const,
      img: divisionPrimary,
      color: "sunshine",
      num: "02",
      title: "Primary School",
      age: "Ages 6 – 10",
      blurb: "Building strong foundations in Literacy, Numeracy, STEM, and character within a vibrant, technology-enabled community.",
      pillars: ["Literacy & Numeracy", "STEM & ICT", "Languages & Arts", "Leadership skills"],
    },
    {
      slug: "/academics/secondary" as const,
      img: divisionSecondary,
      color: "royal",
      num: "03",
      title: "Secondary School",
      age: "Ages 11 – 18",
      blurb: "Preparing future leaders for university success with rigorous WAEC, NECO, IGCSE, and SAT pathways.",
      pillars: ["Sciences & Commercial", "Coding & Robotics", "Career mentorship", "University prep"],
    },
  ];
  const bg: Record<string, string> = {
    emerald: "bg-emerald/5 border-emerald/15",
    sunshine: "bg-sunshine/10 border-sunshine/20",
    royal: "bg-royal/5 border-royal/15",
  };
  const chip: Record<string, string> = {
    emerald: "bg-emerald text-white",
    sunshine: "bg-sunshine text-royal-deep",
    royal: "bg-royal text-white",
  };
  const text: Record<string, string> = {
    emerald: "text-emerald",
    sunshine: "text-royal-deep",
    royal: "text-royal",
  };

  return (
    <section id="academics" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Our Academic Divisions</p>
          <h2 className="font-display text-4xl md:text-5xl text-royal mb-4">One school. A complete journey.</h2>
          <p className="text-muted-foreground text-lg">
            A seamless transition of excellence through every stage of a child's development — under one trusted roof.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {divisions.map((d) => (
            <Link
              key={d.slug}
              to={d.slug}
              className={`group relative rounded-3xl overflow-hidden border ${bg[d.color]} hover:-translate-y-1 transition-transform`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={d.img}
                  alt={d.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className={`size-11 rounded-2xl flex items-center justify-center font-semibold text-sm ${chip[d.color]}`}>
                    {d.num}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{d.age}</span>
                </div>
                <h3 className="font-display text-2xl text-ink mb-3">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{d.blurb}</p>
                <ul className="space-y-1.5 mb-6">
                  {d.pillars.map((p) => (
                    <li key={p} className={`flex items-center gap-2 text-xs font-medium ${text[d.color]}`}>
                      <span className="size-1 rounded-full bg-current" /> {p}
                    </li>
                  ))}
                </ul>
                <span className={`text-sm font-semibold inline-flex items-center gap-2 ${text[d.color]}`}>
                  Explore Division <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrincipalWelcome() {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="relative">
              <img
                src={principalImg}
                alt="Dr. Adaeze Okafor, Head of School"
                width={800}
                height={1000}
                loading="lazy"
                className="rounded-3xl w-full aspect-[4/5] object-cover shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-royal text-white rounded-2xl p-5 shadow-xl max-w-[220px]">
                <p className="font-display text-lg leading-tight">Dr. Adaeze Okafor</p>
                <p className="text-xs text-white/70 mt-1">Head of School · EdD (Harvard)</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">A Welcome from Our Head</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal mb-8 leading-tight">
              "Every child holds a spark of greatness. Our role is to help them{" "}
              <span className="italic text-gold">find it</span>."
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At Oasis Academy, we believe education is more than academics — it is the careful cultivation of character, curiosity, and courage. Since 1998, we have nurtured thousands of confident, compassionate, and capable young people who now serve as leaders across every continent.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our commitment is simple: to combine world-class teaching with the warmth of a close-knit family, and to prepare each child not just for exams, but for a meaningful life.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-royal font-semibold hover:gap-3 transition-all"
            >
              Read our full story <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  const pillars = [
    { icon: GraduationCap, title: "Qualified Educators", desc: "International certifications and continuous training." },
    { icon: Users, title: "Small Class Sizes", desc: "1:12 teacher-to-student ratio for personalised care." },
    { icon: Cpu, title: "Smart Classrooms", desc: "Technology-integrated learning across every room." },
    { icon: Shield, title: "Safe & Secure", desc: "24/7 surveillance and trained on-site security." },
    { icon: Trophy, title: "Academic Excellence", desc: "Consistent top-tier WAEC & IGCSE results." },
    { icon: Sparkles, title: "Character Formation", desc: "Values, discipline, and ethical leadership." },
    { icon: Palette, title: "Creative Arts", desc: "Dedicated studios for music, dance, and fine art." },
    { icon: TreeDeciduous, title: "Sports Excellence", desc: "Olympic-sized pool, courts, and full sports complex." },
    { icon: Globe, title: "Global Learning", desc: "Cambridge, WAEC, and SAT pathways under one roof." },
    { icon: HeartHandshake, title: "Parent Partnership", desc: "Weekly communication and open-door culture." },
    { icon: BookOpen, title: "Rich Curriculum", desc: "British + Nigerian blend with STEM, arts & humanities." },
    { icon: Music, title: "Leadership Development", desc: "Prefect systems, debate, model UN, entrepreneurship." },
  ];
  return (
    <section className="py-24 md:py-32 bg-royal-deep text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,var(--gold)_0%,transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Why Oasis</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">Twelve pillars of excellence.</h2>
          <p className="text-white/70 text-lg">
            The holistic experience we design for every child — from their first day in Nursery to their final graduation.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 gap-y-12">
          {pillars.map((p, i) => (
            <div key={p.title}>
              <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <p.icon className="size-5 text-gold" />
              </div>
              <p className="text-gold text-xs font-mono mb-1">{String(i + 1).padStart(2, "0")}</p>
              <h4 className="font-semibold text-sm mb-2">{p.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Facilities() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">World-Class Facilities</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal">Spaces designed for discovery.</h2>
          </div>
          <Link to="/gallery" className="text-sm font-semibold text-royal border-b-2 border-gold pb-1 inline-flex items-center gap-2 self-start">
            View full gallery <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[500px] md:h-[600px]">
          <FacilityCard img={facilityLab} label="Science Laboratories" className="col-span-2 row-span-2" featured />
          <FacilityCard img={facilityCoding} label="Coding & Robotics Lab" />
          <FacilityCard img={facilitySports} label="Sports Complex & Pool" />
          <FacilityCard img={facilityLibrary} label="Modern Library" className="col-span-2" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Smart Classrooms", "ICT Lab", "Music Studio", "Art Studio", "Auditorium", "Innovation Hub", "School Clinic", "Cafeteria", "School Buses", "Boarding House"].map((f) => (
            <span key={f} className="px-4 py-2 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilityCard({ img, label, className = "", featured }: { img: string; label: string; className?: string; featured?: boolean }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden group ${className}`}>
      <img src={img} alt={label} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-5 right-5">
        <p className={`text-white font-display ${featured ? "text-2xl md:text-3xl" : "text-lg"} font-medium`}>{label}</p>
      </div>
    </div>
  );
}

function AdmissionsJourney() {
  const steps = [
    "Enquiry", "Application", "Assessment", "Interview", "Decision", "Enrollment", "Orientation",
  ];
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-royal rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative overflow-hidden text-white">
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative z-10 max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Admissions</p>
            <h2 className="font-display text-4xl md:text-5xl mb-4">A seven-step journey to Oasis.</h2>
            <p className="text-white/70 mb-12 max-w-2xl">
              We designed our admissions process to be transparent, warm, and clear — so every family knows exactly what to expect.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-12 relative">
              {steps.map((step, i) => (
                <div key={step} className="relative">
                  <div className="size-10 rounded-full border-2 border-gold flex items-center justify-center text-gold text-sm font-semibold mb-3">
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold">{step}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admissions" className="bg-gold text-white px-8 py-4 rounded-full font-semibold hover:brightness-110 transition inline-flex items-center gap-2">
                Start Application <ArrowRight className="size-4" />
              </Link>
              <Link to="/contact" className="bg-white/10 border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/15 transition">
                Download Prospectus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentLife() {
  const clubs = [
    "Robotics Club", "Debate Society", "Chess Club", "Press Club", "Young Scientists",
    "Coding Club", "Music Ensemble", "Drama Society", "Entrepreneurship", "Community Service",
    "Football & Basketball", "Swimming Squad", "Fine Arts", "Model UN", "Cultural Heritage",
  ];
  return (
    <section className="py-24 md:py-32 bg-emerald/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-4">Life at Oasis</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal mb-6">Beyond the classroom.</h2>
            <p className="text-muted-foreground text-lg mb-8">
              We believe great education happens everywhere — on the field, in the studio, on the stage, and in service to community. Every child finds their passion here.
            </p>
            <Link to="/student-life" className="inline-flex items-center gap-2 text-emerald font-semibold">
              Explore student life <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {clubs.map((c, i) => (
                <span
                  key={c}
                  className={`px-5 py-3 rounded-full text-sm font-medium border ${
                    i % 3 === 0
                      ? "bg-emerald text-white border-emerald"
                      : i % 3 === 1
                      ? "bg-sunshine/20 text-royal-deep border-sunshine/30"
                      : "bg-card border-border"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "Oasis has been a second home for my three children. The balance of academic rigor and character building is truly unmatched in Lagos.",
      name: "Dr. Ifeoma Adenuga",
      role: "Parent · Grade 4 & 9",
    },
    {
      quote: "The technology facilities are world-class. My daughter started coding in Year 2 and now builds her own mini-robots at home!",
      name: "Mrs. Chima Nwosu",
      role: "Parent · Year 3",
    },
    {
      quote: "As a diplomat, I've placed my children in schools globally. Oasis holds its own against the best in London or Dubai. Exceptional leadership.",
      name: "H.E. Mr. Williams",
      role: "International Parent",
    },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Parent Voices</p>
          <h2 className="font-display text-4xl md:text-5xl text-royal">Trusted by Nigeria's families.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="p-8 bg-card ring-1 ring-border rounded-3xl relative hover:shadow-lg transition-shadow">
              <Quote className="size-8 text-gold/40 mb-4" />
              <div className="flex gap-0.5 mb-4 text-sunshine">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="size-10 rounded-full bg-royal/10 flex items-center justify-center text-royal font-semibold text-sm">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · <span className="text-emerald font-semibold">Verified</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsPreview() {
  const posts = [
    {
      tag: "Achievement",
      title: "Oasis wins Lagos State STEM Championship for third year",
      date: "October 12, 2026",
      color: "emerald",
    },
    {
      tag: "Event",
      title: "Annual Cultural Day celebrates Nigeria's rich heritage",
      date: "September 28, 2026",
      color: "sunshine",
    },
    {
      tag: "Admissions",
      title: "Scholarship applications now open for 2027 intake",
      date: "September 15, 2026",
      color: "royal",
    },
  ];
  return (
    <section className="py-24 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">News & Events</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal">Latest from campus.</h2>
          </div>
          <Link to="/news" className="text-sm font-semibold text-royal inline-flex items-center gap-2">
            All news <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-royal/5">
                <img src={campusImg} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex items-center gap-3 text-xs mb-3">
                <span className={`px-2.5 py-1 rounded-full font-semibold ${
                  p.color === "emerald" ? "bg-emerald/10 text-emerald" :
                  p.color === "sunshine" ? "bg-sunshine/15 text-royal-deep" :
                  "bg-royal/10 text-royal"
                }`}>
                  {p.tag}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> {p.date}
                </span>
              </div>
              <h3 className="font-display text-xl text-ink group-hover:text-royal transition-colors leading-snug">
                {p.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[2.5rem] overflow-hidden">
          <img src={campusImg} alt="Oasis Academy campus" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-deep/95 via-royal/85 to-royal/60" />
          <div className="relative p-12 md:p-20 max-w-2xl text-white">
            <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
              Begin your child's journey today.
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join a community dedicated to academic excellence, moral integrity, and global achievement. We look forward to welcoming your family.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/admissions" className="bg-gold text-white px-8 py-4 rounded-full font-semibold hover:brightness-110 transition">
                Apply for Admission
              </Link>
              <Link to="/contact" className="bg-white/10 border border-white/30 backdrop-blur px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition inline-flex items-center gap-2">
                <MapPin className="size-4" /> Visit Our Campus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
