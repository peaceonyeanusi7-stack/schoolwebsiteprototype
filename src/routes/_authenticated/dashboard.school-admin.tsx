import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";
import { listSchoolUsers, inviteSchoolUser } from "@/lib/admin.functions";
import { listFeeItems, createFeeItem, getSchoolSubscription, listSubscriptionPlans, initializePayment } from "@/lib/payments.functions";
import { UserPlus, Users, Receipt, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { ROLE_LABEL } from "@/lib/roles";
import { formatNaira } from "@/lib/payments.functions";

const ROLE_OPTIONS = ["teacher", "student", "parent", "accountant", "librarian"] as const;

export const Route = createFileRoute("/_authenticated/dashboard/school-admin")({
  head: () => ({ meta: [{ title: "School Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listSchoolUsers);
  const inviteFn = useServerFn(inviteSchoolUser);
  const fetchFees = useServerFn(listFeeItems);
  const createFeeFn = useServerFn(createFeeItem);
  const fetchSubscription = useServerFn(getSchoolSubscription);
  const fetchPlans = useServerFn(listSubscriptionPlans);
  const payFn = useServerFn(initializePayment);

  const [activeTab, setActiveTab] = useState<"users" | "fees" | "subscription">("users");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["school-users"],
    queryFn: () => fetchUsers(),
  });

  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["school-fees"],
    queryFn: () => fetchFees(),
  });

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["school-subscription"],
    queryFn: () => fetchSubscription(),
  });

  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => fetchPlans(),
  });

  const invite = useMutation({
    mutationFn: (input: any) =>
      inviteFn({ data: { ...input, redirectTo: `${window.location.origin}/set-password` } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Invitation email sent." });
      setShowUserForm(false);
      qc.invalidateQueries({ queryKey: ["school-users"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  const createFee = useMutation({
    mutationFn: (input: any) => createFeeFn({ data: input }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Fee item created." });
      setShowFeeForm(false);
      qc.invalidateQueries({ queryKey: ["school-fees"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  const subscribe = useMutation({
    mutationFn: (planId: string) =>
      payFn({ data: { paymentType: "subscription", subscriptionPlanId: planId, callbackOrigin: window.location.origin } }),
    onSuccess: (res) => {
      window.location.href = res.authorizationUrl;
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  function onUserSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    invite.mutate({
      email: String(f.get("email") ?? ""),
      fullName: String(f.get("fullName") ?? ""),
      role: String(f.get("role") ?? "teacher"),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  function onFeeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    createFee.mutate({
      name: String(f.get("name") ?? ""),
      category: String(f.get("category") ?? "school_fee"),
      classLevel: String(f.get("classLevel") ?? "") || null,
      amountKobo: Math.round(Number(f.get("amountNaira") ?? 0) * 100),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  const users = usersData?.users ?? [];
  const filtered = filter === "all" ? users : users.filter((u: any) => u.roles.includes(filter));
  const counts = ROLE_OPTIONS.reduce((acc, r) => {
    acc[r] = users.filter((u: any) => u.roles.includes(r)).length;
    return acc;
  }, {} as Record<string, number>);

  const school = subData?.school;
  const isActive = school?.subscription_status === "active" && (school?.subscription_ends_at ? new Date(school.subscription_ends_at) > new Date() : false);
  const plans = plansData?.plans ?? [];

  return (
    <DashboardShell
      roleLabel="School Admin"
      title="Operations dashboard"
      subtitle="Manage your school's users, fees and subscription."
      accent="royal"
    >
      {!isActive && !subLoading && (
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">Subscription required</p>
            <p className="text-sm text-yellow-700">Your school account is currently {school?.subscription_status ?? "inactive"}. Subscribe to a plan to unlock all features.</p>
          </div>
        </div>
      )}

      {isActive && !subLoading && (
        <div className="rounded-2xl bg-emerald/10 border border-emerald/20 p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald" />
          <p className="text-sm font-semibold text-emerald-700">
            Subscription active until {school?.subscription_ends_at ? new Date(school.subscription_ends_at).toLocaleDateString() : "—"}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {ROLE_OPTIONS.map((r) => (
          <StatCard key={r} label={ROLE_LABEL[r]} value={String(counts[r] ?? 0)} />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="size-4" />}>Users</TabButton>
        <TabButton active={activeTab === "fees"} onClick={() => setActiveTab("fees")} icon={<Receipt className="size-4" />}>Fee Items</TabButton>
        <TabButton active={activeTab === "subscription"} onClick={() => setActiveTab("subscription")} icon={<CreditCard className="size-4" />}>Subscription</TabButton>
      </div>

      {msg && (
        <p className={`text-sm mb-4 ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>
      )}

      {activeTab === "users" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-royal" />
              <h2 className="font-display text-2xl">School users</h2>
            </div>
            <button
              onClick={() => { setShowUserForm((v) => !v); setMsg(null); }}
              className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              <UserPlus className="size-4" /> {showUserForm ? "Cancel" : "Invite user"}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={onUserSubmit} className="grid gap-3 sm:grid-cols-3 mb-6 p-4 rounded-2xl bg-muted/40">
              <Input name="fullName" label="Full name" required />
              <Input name="email" label="Email" type="email" required />
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold">Role *</span>
                <select name="role" required className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={invite.isPending}
                  className="bg-royal text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {invite.isPending ? "Sending…" : "Send invitation"}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-4 text-sm">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All ({users.length})</FilterChip>
            {ROLE_OPTIONS.map((r) => (
              <FilterChip key={r} active={filter === r} onClick={() => setFilter(r)}>
                {ROLE_LABEL[r]} ({counts[r] ?? 0})
              </FilterChip>
            ))}
          </div>

          {usersLoading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Roles</th>
                    <th className="py-2">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="py-3 font-semibold">{u.full_name || "—"}</td>
                      <td className="py-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r: string) => (
                            <span key={r} className="rounded-full bg-royal/10 text-royal px-2 py-0.5 text-xs font-semibold">
                              {ROLE_LABEL[r as keyof typeof ROLE_LABEL] ?? r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "fees" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <Receipt className="size-5 text-royal" />
              <h2 className="font-display text-2xl">Fee Items</h2>
            </div>
            <button
              onClick={() => { setShowFeeForm((v) => !v); setMsg(null); }}
              className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              <UserPlus className="size-4" /> {showFeeForm ? "Cancel" : "Add fee item"}
            </button>
          </div>

          {showFeeForm && (
            <form onSubmit={onFeeSubmit} className="grid gap-3 sm:grid-cols-3 mb-6 p-4 rounded-2xl bg-muted/40">
              <Input name="name" label="Fee name" required />
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold">Category *</span>
                <select name="category" required className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm">
                  <option value="school_fee">School Fee</option>
                  <option value="admission">Admission Fee</option>
                </select>
              </label>
              <Input name="classLevel" label="Class / Level" />
              <Input name="amountNaira" label="Amount (₦)" type="number" required />
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={createFee.isPending}
                  className="bg-royal text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {createFee.isPending ? "Saving…" : "Save fee item"}
                </button>
              </div>
            </form>
          )}

          {feesLoading ? (
            <p className="text-sm text-muted-foreground">Loading fee items…</p>
          ) : feesData?.fees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee items yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Class / Level</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(feesData?.fees ?? []).map((f: any) => (
                    <tr key={f.id} className="border-t border-border">
                      <td className="py-3 font-semibold">{f.name}</td>
                      <td className="py-3 capitalize">{f.category.replace("_", " ")}</td>
                      <td className="py-3 text-muted-foreground">{f.class_level || "—"}</td>
                      <td className="py-3">{formatNaira(f.amount_kobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="rounded-3xl bg-card border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="size-5 text-royal" />
            <h2 className="font-display text-2xl">Subscription</h2>
          </div>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscription plans available. Contact support.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p: any) => (
                <div key={p.id} className="rounded-2xl border border-border p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.duration_days} days</p>
                  <h3 className="font-display text-xl text-royal mt-1">{p.name}</h3>
                  <p className="text-2xl font-semibold mt-2">{formatNaira(p.amount_kobo)}</p>
                  {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                  <button
                    onClick={() => subscribe.mutate(p.id)}
                    disabled={subscribe.isPending}
                    className="mt-4 w-full bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  >
                    {subscribe.isPending ? "Redirecting…" : "Subscribe now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Timetables" description="Class allocations and room bookings." />
        <QuickLink label="Announcements" description="Broadcast to parents, staff and students." />
        <QuickLink label="Events" description="Trips, PTA meetings and inter-house activities." />
      </div>
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

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input name={name} type={type} required={required} className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm" />
    </label>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 font-semibold border transition-colors ${
        active ? "bg-royal text-white border-royal" : "bg-card border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
