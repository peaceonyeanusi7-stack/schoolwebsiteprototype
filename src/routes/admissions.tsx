import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { FileText, ClipboardCheck, MessagesSquare, GraduationCap, Sparkles, CalendarDays, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — Oasis Academy" },
      { name: "description", content: "Apply for admission to Oasis Academy. A transparent 7-step admissions journey for Nursery, Primary and Secondary. Scholarships available." },
      { property: "og:title", content: "Admissions — Oasis Academy" },
      { property: "og:description", content: "Begin your child's journey with a simple 7-step admissions process." },
      { property: "og:url", content: "/admissions" },
    ],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: Admissions,
});

function Admissions() {
  const steps = [
    { icon: FileText, title: "Enquiry", desc: "Submit an online enquiry or call our admissions team." },
    { icon: FileText, title: "Application", desc: "Complete the application form and upload documents." },
    { icon: ClipboardCheck, title: "Assessment", desc: "Age-appropriate diagnostic assessment on campus." },
    { icon: MessagesSquare, title: "Interview", desc: "Family interview with school leadership." },
    { icon: Sparkles, title: "Decision", desc: "Offer letter issued within 5 working days." },
    { icon: GraduationCap, title: "Enrollment", desc: "Accept offer and complete registration." },
    { icon: CalendarDays, title: "Orientation", desc: "Welcome day and campus induction." },
  ];

  const fees = [
    { level: "Nursery", app: "₦25,000", tuition: "₦850,000 / term" },
    { level: "Primary", app: "₦25,000", tuition: "₦1,150,000 / term" },
    { level: "Secondary", app: "₦40,000", tuition: "₦1,450,000 / term" },
    { level: "Boarding (add-on)", app: "—", tuition: "₦650,000 / term" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Admissions Open"
        title={<>Begin your child's <span className="italic text-gold">journey</span>.</>}
        subtitle="A transparent, warm, and clear admissions process designed for families across Lagos and beyond."
      >
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#apply" className="bg-royal text-white px-8 py-4 rounded-full font-semibold shadow-xl shadow-royal/20 inline-flex items-center gap-2">
            Start Application <ArrowRight className="size-4" />
          </a>
          <Link to="/contact" className="bg-card border border-border px-8 py-4 rounded-full font-semibold">
            Book a Tour
          </Link>
        </div>
      </PageHero>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.slice(0, 4).map((s, i) => (
              <StepCard key={s.title} num={i + 1} icon={s.icon} title={s.title} desc={s.desc} />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4 max-w-4xl mx-auto">
            {steps.slice(4).map((s, i) => (
              <StepCard key={s.title} num={i + 5} icon={s.icon} title={s.title} desc={s.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">Investment</p>
            <h2 className="font-display text-4xl md:text-5xl text-royal">Fees & scholarships.</h2>
            <p className="text-muted-foreground mt-4">Payments accepted online via Paystack. Scholarships available for exceptional students.</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-royal text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Level</th>
                  <th className="text-left px-6 py-4 font-semibold">Application Fee</th>
                  <th className="text-left px-6 py-4 font-semibold">Tuition</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.level} className="border-t border-border">
                    <td className="px-6 py-4 font-semibold text-royal">{f.level}</td>
                    <td className="px-6 py-4 text-muted-foreground">{f.app}</td>
                    <td className="px-6 py-4 text-muted-foreground">{f.tuition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <EnquirySection />
    </>
  );
}

function StepCard({ num, icon: Icon, title, desc }: { num: number; icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-gold transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="size-8 rounded-full bg-royal text-white text-xs font-semibold flex items-center justify-center">{num}</span>
        <Icon className="size-4 text-gold" />
      </div>
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30" />
    </label>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <select className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
