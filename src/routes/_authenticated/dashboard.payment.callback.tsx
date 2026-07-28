import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyPaymentByReference } from "@/lib/payments.functions";
import { DashboardShell } from "@/components/site/DashboardShell";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/payment/callback")({
  head: () => ({ meta: [{ title: "Payment Verification — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const search = useSearch({ from: "/_authenticated/dashboard/payment/callback" }) as { reference?: string; trxref?: string };
  const reference = search.reference ?? search.trxref;
  const verifyFn = useServerFn(verifyPaymentByReference);
  const [state, setState] = useState<"loading" | "success" | "failed" | "missing">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setState("missing");
      return;
    }
    verifyFn({ data: { reference } })
      .then((res) => {
        setState(res.success ? "success" : "failed");
      })
      .catch((e: Error) => {
        setError(e.message);
        setState("failed");
      });
  }, [reference, verifyFn]);

  return (
    <DashboardShell roleLabel="Payment" title="Verifying your payment" accent="emerald">
      <div className="max-w-xl mx-auto rounded-3xl bg-card border border-border p-8 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="size-12 mx-auto animate-spin text-royal mb-4" />
            <p className="text-muted-foreground">Please wait while we confirm your payment with Paystack.</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="size-12 mx-auto text-emerald mb-4" />
            <h2 className="font-display text-2xl text-royal mb-2">Payment successful</h2>
            <p className="text-muted-foreground">Your payment has been verified. If you subscribed, your school account is now active.</p>
          </>
        )}
        {state === "failed" && (
          <>
            <XCircle className="size-12 mx-auto text-red-600 mb-4" />
            <h2 className="font-display text-2xl text-royal mb-2">Payment could not be verified</h2>
            <p className="text-muted-foreground">{error || "We could not confirm this payment. Please contact support if you were charged."}</p>
          </>
        )}
        {state === "missing" && (
          <>
            <XCircle className="size-12 mx-auto text-red-600 mb-4" />
            <h2 className="font-display text-2xl text-royal mb-2">No payment reference</h2>
            <p className="text-muted-foreground">We did not receive a payment reference. Please try again.</p>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
