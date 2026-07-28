import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";
import { listFeeItems, listMyPayments, initializePayment } from "@/lib/payments.functions";
import { formatNaira } from "@/lib/payments.functions";
import { CreditCard, Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/parent")({
  head: () => ({ meta: [{ title: "Parent Portal — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const fetchFees = useServerFn(listFeeItems);
  const fetchPayments = useServerFn(listMyPayments);
  const pay = useServerFn(initializePayment);

  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["school-fees"],
    queryFn: () => fetchFees(),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => fetchPayments(),
  });

  const [paying, setPaying] = useState<string | null>(null);

  async function handlePayFee(feeId: string) {
    setPaying(feeId);
    try {
      const res = await pay({ data: { paymentType: "school_fee", feeItemId: feeId, callbackOrigin: window.location.origin } });
      window.location.href = res.authorizationUrl;
    } catch (e: any) {
      alert(e?.message ?? "Payment failed to start");
      setPaying(null);
    }
  }

  async function handlePayAdmission() {
    setPaying("admission");
    try {
      const res = await pay({ data: { paymentType: "admission", callbackOrigin: window.location.origin } });
      window.location.href = res.authorizationUrl;
    } catch (e: any) {
      alert(e?.message ?? "Payment failed to start");
      setPaying(null);
    }
  }

  const fees = feesData?.fees ?? [];
  const payments = paymentsData?.payments ?? [];
  const successful = payments.filter((p: any) => p.status === "success");
  const totalPaid = successful.reduce((sum: number, p: any) => sum + p.amount_kobo, 0);

  return (
    <DashboardShell roleLabel="Parent" title="Family dashboard" subtitle="Your child's progress, attendance and school communications." accent="gold">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Children" value="2" />
        <StatCard label="Attendance" value="98%" hint="This term" />
        <StatCard label="Outstanding fees" value={formatNaira(fees.reduce((sum: number, f: any) => sum + f.amount_kobo, 0) - totalPaid)} />
        <StatCard label="Payments made" value={String(successful.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="size-5 text-gold" />
            <h2 className="font-display text-2xl">Fee items</h2>
          </div>
          {feesLoading ? (
            <p className="text-sm text-muted-foreground">Loading fees…</p>
          ) : fees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fees have been set yet.</p>
          ) : (
            <div className="space-y-3">
              {fees.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border">
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-sm text-muted-foreground">{f.class_level || f.category.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatNaira(f.amount_kobo)}</p>
                    <button
                      onClick={() => handlePayFee(f.id)}
                      disabled={paying === f.id}
                      className="mt-1 inline-flex items-center gap-1 text-sm bg-gold text-royal rounded-full px-3 py-1 font-semibold disabled:opacity-60"
                    >
                      <CreditCard className="size-3" /> {paying === f.id ? "…" : "Pay"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="size-5 text-gold" />
            <h2 className="font-display text-2xl">My payments</h2>
          </div>
          {paymentsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p: any) => (
                <div key={p.id} className="p-3 rounded-xl border border-border text-sm">
                  <p className="font-semibold capitalize">{p.payment_type.replace("_", " ")}</p>
                  <p className="text-muted-foreground">{formatNaira(p.amount_kobo)}</p>
                  <p className="text-xs text-muted-foreground">{p.status}</p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handlePayAdmission}
            disabled={paying === "admission"}
            className="mt-4 w-full bg-gold text-royal rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {paying === "admission" ? "…" : "Pay admission fee"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Academic reports" description="Termly results and progress cards." />
        <QuickLink label="Attendance" description="Daily register and absence notes." />
        <QuickLink label="Homework" description="Assignments and submission tracking." />
        <QuickLink label="Messages" description="Direct chat with class teachers." />
        <QuickLink label="Calendar" description="Term dates, events and holidays." />
        <QuickLink label="Library" description="Reserve books and resources." />
      </div>
    </DashboardShell>
  );
}
