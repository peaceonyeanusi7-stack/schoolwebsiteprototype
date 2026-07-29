import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageHero } from "@/components/site/PageHero";
import { getEnquiry, submitApplication, startApplicationFeePayment } from "@/lib/admissions.functions";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

const LEVELS = ["Nursery", "Primary", "Secondary", "Boarding"] as const;

export const Route = createFileRoute("/apply")({
  validateSearch: z.object({ enquiry: z.string().uuid().optional() }),
  head: () => ({
    meta: [
      { title: "Admission Application — Oasis Academy" },
      {
        name: "description",
        content:
          "Complete your child's admission application to Oasis Academy and pay the application fee securely online.",
      },
      { property: "og:title", content: "Admission Application — Oasis Academy" },
      { property: "og:description", content: "Submit your application and pay the application fee securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const { enquiry } = Route.useSearch();
  const navigate = useNavigate();
  const loadEnquiry = useServerFn(getEnquiry);
  const submit = useServerFn(submitApplication);
  const startPayment = useServerFn(startApplicationFeePayment);

  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childName: "",
    childDob: "",
    childGender: "Female" as "Male" | "Female",
    level: "Nursery" as (typeof LEVELS)[number],
    previousSchool: "",
    address: "",
    notes: "",
  });
  const [stage, setStage] = useState<"form" | "submitting" | "redirecting">("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enquiry) return;
    loadEnquiry({ data: { enquiryId: enquiry } })
      .then((res) => {
        if (!res.enquiry) return;
        setForm((f) => ({
          ...f,
          parentName: res.enquiry!.parent_name,
          parentEmail: res.enquiry!.parent_email,
          parentPhone: res.enquiry!.parent_phone,
          childName: res.enquiry!.child_name,
          level: (LEVELS as readonly string[]).includes(res.enquiry!.level)
            ? (res.enquiry!.level as (typeof LEVELS)[number])
            : f.level,
        }));
      })
      .catch(() => undefined);
  }, [enquiry, loadEnquiry]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.parentName.trim().length < 2) return setError("Please enter the parent's full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.parentEmail.trim())) return setError("Please enter a valid email address.");
    if (form.parentPhone.trim().length < 7) return setError("Please enter a valid phone number.");
    if (form.childName.trim().length < 2) return setError("Please enter the child's full name.");
    if (!form.childDob) return setError("Please enter the child's date of birth.");

    setStage("submitting");
    try {
      const res = await submit({
        data: {
          enquiryId: enquiry ?? null,
          parentName: form.parentName.trim(),
          parentEmail: form.parentEmail.trim(),
          parentPhone: form.parentPhone.trim(),
          childName: form.childName.trim(),
          childDob: form.childDob,
          childGender: form.childGender,
          level: form.level,
          previousSchool: form.previousSchool.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
        },
      });

      setStage("redirecting");
      const pay = await startPayment({
        data: { applicationId: res.applicationId, callbackOrigin: window.location.origin },
      });
      window.location.href = pay.authorizationUrl;
    } catch (err) {
      setStage("form");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Step 2 — Application"
        title={
          <>
            Admission <span className="italic text-gold">application</span>.
          </>
        }
        subtitle="Complete your child's details. You'll be taken to a secure Paystack page to pay the application fee."
      />

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 md:p-12 shadow-sm">
            <form className="grid gap-5" onSubmit={onSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-5">
                <Text label="Parent Full Name" value={form.parentName} onChange={(v) => set("parentName", v)} />
                <Text label="Phone Number" type="tel" value={form.parentPhone} onChange={(v) => set("parentPhone", v)} />
              </div>
              <Text label="Email Address" type="email" value={form.parentEmail} onChange={(v) => set("parentEmail", v)} />

              <div className="grid md:grid-cols-2 gap-5">
                <Text label="Child's Full Name" value={form.childName} onChange={(v) => set("childName", v)} />
                <Text label="Date of Birth" type="date" value={form.childDob} onChange={(v) => set("childDob", v)} />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Select label="Gender" options={["Female", "Male"]} value={form.childGender} onChange={(v) => set("childGender", v as "Male" | "Female")} />
                <Select label="Applying To" options={[...LEVELS]} value={form.level} onChange={(v) => set("level", v as (typeof LEVELS)[number])} />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Text label="Previous School (optional)" value={form.previousSchool} onChange={(v) => set("previousSchool", v)} />
                <Text label="Home Address (optional)" value={form.address} onChange={(v) => set("address", v)} />
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold">Anything we should know? (optional)</span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30"
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={stage !== "form"}
                className="bg-royal text-white rounded-full py-4 font-semibold hover:brightness-110 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {stage !== "form" && <Loader2 className="size-4 animate-spin" />}
                {stage === "form" && (
                  <>
                    Submit & pay application fee <ArrowRight className="size-4" />
                  </>
                )}
                {stage === "submitting" && "Saving your application…"}
                {stage === "redirecting" && "Redirecting to secure payment…"}
              </button>

              <p className="text-xs text-muted-foreground inline-flex items-center gap-2 justify-center">
                <ShieldCheck className="size-3.5 text-emerald" /> Payments are processed securely by Paystack.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Haven't made an enquiry yet? <Link to="/admissions" className="text-royal font-semibold underline">Start here</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function Text({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
    return (
      <label className="grid gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-royal/30"
        />
      </label>
    );
  }

function Select({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
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
