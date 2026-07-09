import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Oasis Academy" },
      { name: "description", content: "Answers to common questions about admissions, fees, curriculum, boarding, transport, uniform and more at Oasis Academy." },
      { property: "og:title", content: "FAQs — Oasis Academy" },
      { property: "og:description", content: "Your questions, answered." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQ,
});

const faqs = [
  { q: "What ages does Oasis accept?", a: "We welcome children from age 2 (Nursery) through age 18 (Secondary Year 12)." },
  { q: "When can I apply?", a: "Admissions are open year-round for the following academic session. Main intake is in September." },
  { q: "What are the school fees?", a: "Fees range from ₦850,000 to ₦1,450,000 per term depending on the division. See the Admissions page for details." },
  { q: "Do you offer scholarships?", a: "Yes — up to 20 partial and full scholarships are awarded each year based on merit and need." },
  { q: "Is there boarding?", a: "Yes, we offer boarding facilities for Secondary students with 24/7 supervision and pastoral care." },
  { q: "Do you provide transport?", a: "A fleet of school buses covers all major routes across Lagos with trained drivers and monitors." },
  { q: "What curriculum do you follow?", a: "A blended British and Nigerian curriculum culminating in WAEC, NECO, IGCSE and SAT pathways." },
  { q: "How do I communicate with teachers?", a: "Through our Parent Portal, weekly digest emails, termly PTA meetings, and open-door office hours." },
  { q: "Are meals included?", a: "Yes, our on-campus cafeteria provides nutritious breakfast, lunch and snacks daily." },
  { q: "What is the uniform policy?", a: "Full uniform is required. Uniform packs are available from the school shop before the term begins." },
];

function FAQ() {
  return (
    <>
      <PageHero
        eyebrow="Frequently Asked"
        title={<>Questions, <span className="italic text-gold">answered</span>.</>}
        subtitle="Everything parents want to know about life and learning at Oasis."
      />
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-3">
          {faqs.map((f, i) => <FAQItem key={i} {...f} />)}
        </div>
      </section>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-5 flex items-center justify-between text-left">
        <span className="font-semibold text-royal">{q}</span>
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}
