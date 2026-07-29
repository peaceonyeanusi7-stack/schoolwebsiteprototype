import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { submitEnquiry } from "@/lib/admissions.functions";
import { FileText, ClipboardCheck, MessagesSquare, GraduationCap, Sparkles, CalendarDays, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

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

const LEVELS = ["Nursery", "Primary", "Secondary", "Boarding"] as const;

function EnquirySection() {
  const navigate = useNavigate();
  const submit = useServerFn(submitEnquiry);
  const [form, setForm] = useState({
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    childName: "",
    level: "Nursery" as (typeof LEVELS)[number],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.parentName.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.parentEmail.trim())) return setError("Please enter a valid email address.");
    if (form.parentPhone.trim().length < 7) return setError("Please enter a valid phone number.");
    if (form.childName.trim().length < 2) return setError("Please enter your child's full name.");

    setStatus("saving");
    try {
      const res = await submit({
        data: {
          parentName: form.parentName.trim(),
          parentEmail: form.parentEmail.trim(),
          parentPhone: form.parentPhone.trim(),
          childName: form.childName.trim(),
          level: form.level,
          message: form.message.trim() || null,
        },
      });
      setStatus("done");
      setTimeout(() => {
        navigate({ to: "/apply", search: { enquiry: res.enquiryId } });
      }, 900);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="apply" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-3xl bg-card border border-border p-8 md:p-12 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-3">Step 1 — Enquiry</p>
          <h2 className="font-display text-3xl text-royal mb-8">Admissions enquiry form</h2>

          {status === "done" ? (
            <div className="rounded-2xl bg-emerald/10 border border-emerald/30 p-6 text-center">
              <CheckCircle2 className="size-10 text-emerald mx-auto mb-3" />
              <h3 className="font-display text-xl text-royal mb-1">Enquiry received</h3>
              <p className="text-sm text-muted-foreground">
                Taking you to the admission application form…
              </p>
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={onSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Parent Full Name" value={form.parentName} onChange={(v) => set("parentName", v)} required />
                <Field label="Phone Number" type="tel" value={form.parentPhone} onChange={(v) => set("parentPhone", v)} required />
              </div>
              <Field label="Email Address" type="email" value={form.parentEmail} onChange={(v) => set("parentEmail", v)} required />
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Child's Full Name" value={form.childName} onChange={(v) => set("childName", v)} required />
                <SelectField
                  label="Applying To"
                  options={[...LEVELS]}
                  value={form.level}
                  onChange={(v) => set("level", v as (typeof LEVELS)[number])}
                />
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Message</span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={status === "saving"}
                className="bg-royal text-white rounded-full py-4 font-semibold hover:brightness-110 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {status === "saving" && <Loader2 className="size-4 animate-spin" />}
                {status === "saving" ? "Submitting…" : "Submit Enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
