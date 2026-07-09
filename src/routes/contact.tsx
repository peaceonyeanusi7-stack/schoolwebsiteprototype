import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Campus Tour — Oasis Academy" },
      { name: "description", content: "Get in touch with Oasis Academy. Visit our Lagos campus, book a tour, or send an admissions enquiry." },
      { property: "og:title", content: "Contact — Oasis Academy" },
      { property: "og:description", content: "Book a campus tour or send us a message." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>Come visit <span className="italic text-gold">Oasis</span>.</>}
        subtitle="Book a tour, ask a question, or say hello. We'd love to meet your family."
      />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-royal/5 mb-8">
              <iframe
                title="Oasis Academy location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=3.40%2C6.42%2C3.45%2C6.45&layer=mapnik"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="grid gap-4">
              <InfoRow icon={MapPin} title="Address" text="15 Academy Way, Victoria Island, Lagos, Nigeria" />
              <InfoRow icon={Phone} title="Phone" text="+234 800 000 0000" />
              <InfoRow icon={MessageCircle} title="WhatsApp" text="+234 800 000 0000" />
              <InfoRow icon={Mail} title="Email" text="hello@oasis.edu.ng" />
              <InfoRow icon={Clock} title="Office Hours" text="Mon – Fri, 8:00 AM – 4:00 PM" />
            </div>
          </div>
          <div className="rounded-3xl bg-card border border-border p-8">
            <h2 className="font-display text-3xl text-royal mb-6">Send a message</h2>
            <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
              <Field label="Your Name" />
              <Field label="Email" type="email" />
              <Field label="Phone" type="tel" />
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Reason</span>
                <select className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30">
                  <option>Book a campus tour</option>
                  <option>Admissions enquiry</option>
                  <option>General question</option>
                  <option>Careers</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Message</span>
                <textarea rows={4} className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30" />
              </label>
              <button className="bg-royal text-white rounded-full py-4 font-semibold hover:brightness-110">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
      <div className="size-10 rounded-xl bg-royal/10 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-royal" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">{title}</p>
        <p className="text-sm font-medium">{text}</p>
      </div>
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
