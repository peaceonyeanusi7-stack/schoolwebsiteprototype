import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { verifyPublicPayment } from "@/lib/admissions.functions";
import { PageHero } from "@/components/site/PageHero";
import { CheckCircle2, XCircle, Loader2, Printer } from "lucide-react";

export const Route = createFileRoute("/payment/callback")({
  ssr: false,
  validateSearch: z.object({ reference: z.string().optional(), trxref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Confirmation — Oasis Academy" },
      { name: "description", content: "Confirmation and receipt for your Oasis Academy payment." },
      { property: "og:title", content: "Payment Confirmation — Oasis Academy" },
      { property: "og:description", content: "Confirmation and receipt for your Oasis Academy payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallbackPage,
});

type Result = Awaited<ReturnType<typeof verifyPublicPayment>>;

function CallbackPage() {
  const { reference, trxref } = Route.useSearch();
  const ref = reference ?? trxref;
  const verify = useServerFn(verifyPublicPayment);
  const [state, setState] = useState<"loading" | "done" | "error">(ref ? "loading" : "error");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(ref ? null : "No payment reference was provided.");
  const started = useRef(false);

  useEffect(() => {
    if (!ref || started.current) return;
    started.current = true;
    verify({ data: { reference: ref } })
      .then((res) => {
        setResult(res);
        setState("done");
      })
      .catch((e: Error) => {
        setError(e.message);
        setState("error");
      });
  }, [ref, verify]);

  const success = result?.success === true;

  return (
    <>
      <PageHero
        eyebrow="Payment"
        title={success ? "Payment confirmed" : "Payment status"}
        subtitle={
          success
            ? "Thank you — your payment has been verified by Paystack."
            : "We are confirming your transaction with Paystack."
        }
      />

      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm text-center print:border-0">
            {state === "loading" && (
              <>
                <Loader2 className="size-12 mx-auto animate-spin text-royal mb-4" />
                <p className="text-muted-foreground">Verifying your payment…</p>
              </>
            )}

            {state === "error" && (
              <>
                <XCircle className="size-12 mx-auto text-red-600 mb-4" />
                <h2 className="font-display text-2xl text-royal mb-2">We couldn't confirm this payment</h2>
                <p className="text-muted-foreground">{error}</p>
              </>
            )}

            {state === "done" && result && !success && (
              <>
                <XCircle className="size-12 mx-auto text-red-600 mb-4" />
                <h2 className="font-display text-2xl text-royal mb-2">Payment not completed</h2>
                <p className="text-muted-foreground">{result.message ?? "This transaction was not successful."}</p>
              </>
            )}

            {state === "done" && result && success && (
              <>
                <CheckCircle2 className="size-12 mx-auto text-emerald mb-4" />
                <h2 className="font-display text-2xl text-royal mb-2">
                  {result.kind === "admission" ? "Application fee paid" : "Payment successful"}
                </h2>

                {result.kind === "subscription" && (
                  <p className="text-muted-foreground">
                    Your school subscription is active. We've emailed an invitation to{" "}
                    <strong>{result.payerEmail}</strong> to set the School Admin password.
                  </p>
                )}

                {result.kind === "admission" && result.application && (
                  <div className="mt-6 text-left rounded-2xl border border-border overflow-hidden">
                    <div className="bg-royal text-white px-6 py-4 flex items-center justify-between">
                      <span className="font-display text-lg">Official Receipt</span>
                      <span className="text-xs opacity-80">{result.application.receipt_number}</span>
                    </div>
                    <dl className="divide-y divide-border text-sm">
                      <Row label="Applicant" value={result.application.child_name} />
                      <Row label="Level" value={result.application.level} />
                      <Row label="Paid by" value={result.payerName ?? result.payerEmail ?? "—"} />
                      <Row label="Amount" value={`₦${(result.amountKobo / 100).toLocaleString()}`} />
                      <Row label="Reference" value={result.reference} />
                      <Row
                        label="Date"
                        value={result.application.paid_at ? new Date(result.application.paid_at).toLocaleString() : "—"}
                      />
                      <Row label="Status" value="Application Fee Paid" />
                    </dl>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3 justify-center print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold"
                  >
                    <Printer className="size-4" /> Print receipt
                  </button>
                  <Link to="/" className="rounded-full bg-royal text-white px-6 py-3 text-sm font-semibold">
                    Back to homepage
                  </Link>
                </div>

                {result.kind === "admission" && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Our admissions team has been notified and will contact you at {result.payerEmail} to schedule the assessment.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-ink text-right">{value}</dd>
    </div>
  );
}
