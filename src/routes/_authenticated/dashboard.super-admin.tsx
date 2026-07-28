import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell, StatCard } from "@/components/site/DashboardShell";
import { listSchools, createSchoolWithAdmin } from "@/lib/admin.functions";
import { listSubscriptionPlans, createSubscriptionPlan, listAllPayments } from "@/lib/payments.functions";
import { Plus, School, Mail, CreditCard, Layers, Wallet } from "lucide-react";
import { formatNaira } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchSchools = useServerFn(listSchools);
  const createFn = useServerFn(createSchoolWithAdmin);
  const fetchPlans = useServerFn(listSubscriptionPlans);
  const createPlanFn = useServerFn(createSubscriptionPlan);
  const fetchPayments = useServerFn(listAllPayments);

  const [activeTab, setActiveTab] = useState<"schools" | "plans" | "payments">("schools");
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: () => fetchSchools(),
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => fetchPlans(),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["all-payments"],
    queryFn: () => fetchPayments(),
  });

  const createSchool = useMutation({
    mutationFn: (input: any) =>
      createFn({
        data: { ...input, redirectTo: `${window.location.origin}/set-password` },
      }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "School created and invitation email sent." });
      setShowSchoolForm(false);
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  const createPlan = useMutation({
    mutationFn: (input: any) => createPlanFn({ data: input }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Subscription plan created." });
      setShowPlanForm(false);
      qc.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  function onSchoolSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    createSchool.mutate({
      schoolName: String(f.get("schoolName") ?? ""),
      address: String(f.get("address") ?? "") || null,
      phone: String(f.get("phone") ?? "") || null,
      schoolEmail: String(f.get("schoolEmail") ?? "") || null,
      adminEmail: String(f.get("adminEmail") ?? ""),
      adminName: String(f.get("adminName") ?? ""),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  function onPlanSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    createPlan.mutate({
      name: String(f.get("name") ?? ""),
      description: String(f.get("description") ?? "") || null,
      amountKobo: Math.round(Number(f.get("amountNaira") ?? 0) * 100),
      durationDays: Number(f.get("durationDays") ?? 365),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  const schools = schoolsData?.schools ?? [];
  const plans = plansData?.plans ?? [];
  const payments = paymentsData?.payments ?? [];
  const totalRevenue = payments.reduce((sum: number, p: any) => (p.status === "success" ? sum + p.amount_kobo : sum), 0);

  return (
    <DashboardShell
      roleLabel="Super Admin"
      title="Institution overview"
      subtitle="Full oversight across every school, subscription plan and payment."
      accent="royal"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Schools" value={String(schools.length)} />
        <StatCard label="Active subscriptions" value={String(schools.filter((s: any) => s.subscription_status === "active").length)} />
        <StatCard label="Subscription plans" value={String(plans.length)} />
        <StatCard label="Total revenue" value={formatNaira(totalRevenue)} hint="Successful payments" />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <TabButton active={activeTab === "schools"} onClick={() => setActiveTab("schools")} icon={<School className="size-4" />}>
          Schools
        </TabButton>
        <TabButton active={activeTab === "plans"} onClick={() => setActiveTab("plans")} icon={<Layers className="size-4" />}>
          Subscription Plans
        </TabButton>
        <TabButton active={activeTab === "payments"} onClick={() => setActiveTab("payments")} icon={<Wallet className="size-4" />}>
          Payments
        </TabButton>
      </div>

      {msg && (
        <p className={`text-sm mb-4 ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>
      )}

      {activeTab === "schools" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <School className="size-5 text-royal" />
              <h2 className="font-display text-2xl">Schools</h2>
            </div>
            <button
              onClick={() => { setShowSchoolForm((v) => !v); setMsg(null); }}
              className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              <Plus className="size-4" /> {showSchoolForm ? "Cancel" : "Onboard new school"}
            </button>
          </div>

          {showSchoolForm && (
            <form onSubmit={onSchoolSubmit} className="grid gap-3 sm:grid-cols-2 mb-6 p-4 rounded-2xl bg-muted/40">
              <Input name="schoolName" label="School name" required />
              <Input name="schoolEmail" label="School email" type="email" />
              <Input name="address" label="Address" />
              <Input name="phone" label="Phone" />
              <div className="sm:col-span-2 border-t border-border pt-3 mt-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">School Admin invite</p>
              </div>
              <Input name="adminName" label="Admin full name" required />
              <Input name="adminEmail" label="Admin email" type="email" required />
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={createSchool.isPending}
                  className="bg-royal text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {createSchool.isPending ? "Creating…" : "Create school & send invite"}
                </button>
              </div>
            </form>
          )}

          {schoolsLoading ? (
            <p className="text-sm text-muted-foreground">Loading schools…</p>
          ) : schools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schools yet. Onboard the first one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2">School</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2">Admins</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s: any) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-3 font-semibold">{s.name}</td>
                      <td className="py-3 text-muted-foreground">
                        {s.email && <div className="flex items-center gap-1"><Mail className="size-3" />{s.email}</div>}
                        {s.phone && <div>{s.phone}</div>}
                      </td>
                      <td className="py-3">{s.admin_count}</td>
                      <td className="py-3 capitalize">{s.subscription_status}</td>
                      <td className="py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <Layers className="size-5 text-royal" />
              <h2 className="font-display text-2xl">Subscription Plans</h2>
            </div>
            <button
              onClick={() => { setShowPlanForm((v) => !v); setMsg(null); }}
              className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              <Plus className="size-4" /> {showPlanForm ? "Cancel" : "Add plan"}
            </button>
          </div>

          {showPlanForm && (
            <form onSubmit={onPlanSubmit} className="grid gap-3 sm:grid-cols-3 mb-6 p-4 rounded-2xl bg-muted/40">
              <Input name="name" label="Plan name" required />
              <Input name="amountNaira" label="Amount (₦)" type="number" required />
              <Input name="durationDays" label="Duration (days)" type="number" defaultValue="365" required />
              <div className="sm:col-span-3">
                <Input name="description" label="Description" />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={createPlan.isPending}
                  className="bg-royal text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {createPlan.isPending ? "Saving…" : "Save plan"}
                </button>
              </div>
            </form>
          )}

          {plansLoading ? (
            <p className="text-sm text-muted-foreground">Loading plans…</p>
          ) : plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscription plans yet. Add one above.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p: any) => (
                <div key={p.id} className="rounded-2xl border border-border p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.duration_days} days</p>
                  <h3 className="font-display text-xl text-royal mt-1">{p.name}</h3>
                  <p className="text-2xl font-semibold mt-2">{formatNaira(p.amount_kobo)}</p>
                  {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="size-5 text-royal" />
            <h2 className="font-display text-2xl">Payments</h2>
          </div>
          {paymentsLoading ? (
            <p className="text-sm text-muted-foreground">Loading payments…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Payer</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-3 font-semibold">{p.paystack_reference}</td>
                      <td className="py-3 capitalize">{p.payment_type.replace("_", " ")}</td>
                      <td className="py-3">{formatNaira(p.amount_kobo)}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "success" ? "bg-emerald/10 text-emerald" : p.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{p.payer_email}</td>
                      <td className="py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Need to view your other tools? <Link to="/dashboard/pending" className="underline">More coming soon.</Link>
      </p>
    </DashboardShell>
  );
}

function TabButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
        active ? "bg-royal text-white border-royal" : "bg-card border-border hover:bg-muted"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function Input({ label, name, type = "text", required = false, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm"
      />
    </label>
  );
}
