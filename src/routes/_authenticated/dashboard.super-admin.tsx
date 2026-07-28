import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";
import { listSchools, createSchoolWithAdmin } from "@/lib/admin.functions";
import { listSubscriptionPlans, createSubscriptionPlan, listAllPayments } from "@/lib/payments.functions";
import { Plus, School, Mail, CreditCard, Layers } from "lucide-react";
import { formatNaira } from "@/lib/payments.functions";


export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchSchools = useServerFn(listSchools);
  const createFn = useServerFn(createSchoolWithAdmin);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: () => fetchSchools(),
  });

  const create = useMutation({
    mutationFn: (input: any) =>
      createFn({
        data: { ...input, redirectTo: `${window.location.origin}/set-password` },
      }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "School created and invitation email sent." });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate({
      schoolName: String(f.get("schoolName") ?? ""),
      address: String(f.get("address") ?? "") || null,
      phone: String(f.get("phone") ?? "") || null,
      schoolEmail: String(f.get("schoolEmail") ?? "") || null,
      adminEmail: String(f.get("adminEmail") ?? ""),
      adminName: String(f.get("adminName") ?? ""),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  const schools = data?.schools ?? [];

  return (
    <DashboardShell
      roleLabel="Super Admin"
      title="Institution overview"
      subtitle="Full oversight across every school, division and portal."
      accent="royal"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Schools" value={String(schools.length)} />
        <StatCard label="Active subscriptions" value={String(schools.filter((s: any) => s.subscription_status === "active").length)} />
        <StatCard label="Total school admins" value={String(schools.reduce((a: number, s: any) => a + s.admin_count, 0))} />
        <StatCard label="Term revenue" value="₦412M" hint="This term" />
      </div>

      <div className="rounded-3xl bg-card border border-border p-6 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <School className="size-5 text-royal" />
            <h2 className="font-display text-2xl">Schools</h2>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setMsg(null); }}
            className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Plus className="size-4" /> {showForm ? "Cancel" : "Onboard new school"}
          </button>
        </div>

        {msg && (
          <p className={`text-sm mb-4 ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>
        )}

        {showForm && (
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2 mb-6 p-4 rounded-2xl bg-muted/40">
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
                disabled={create.isPending}
                className="bg-royal text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {create.isPending ? "Creating…" : "Create school & send invite"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
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

      <p className="text-xs text-muted-foreground">
        Need to view your other tools? <Link to="/dashboard/pending" className="underline">More coming soon.</Link>
      </p>
    </DashboardShell>
  );
}

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm"
      />
    </label>
  );
}
