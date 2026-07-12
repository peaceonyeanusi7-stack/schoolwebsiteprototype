import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell, StatCard, QuickLink } from "@/components/site/DashboardShell";
import { listSchoolUsers, inviteSchoolUser } from "@/lib/admin.functions";
import { UserPlus, Users } from "lucide-react";
import { ROLE_LABEL } from "@/lib/roles";

const ROLE_OPTIONS = ["teacher", "student", "parent", "accountant", "librarian"] as const;

export const Route = createFileRoute("/_authenticated/dashboard/school-admin")({
  head: () => ({ meta: [{ title: "School Admin — Oasis Academy" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listSchoolUsers);
  const inviteFn = useServerFn(inviteSchoolUser);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["school-users"],
    queryFn: () => fetchUsers(),
  });

  const invite = useMutation({
    mutationFn: (input: any) =>
      inviteFn({ data: { ...input, redirectTo: `${window.location.origin}/set-password` } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Invitation email sent." });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["school-users"] });
    },
    onError: (e: Error) => setMsg({ type: "err", text: e.message }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    invite.mutate({
      email: String(f.get("email") ?? ""),
      fullName: String(f.get("fullName") ?? ""),
      role: String(f.get("role") ?? "teacher"),
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  const users = data?.users ?? [];
  const filtered = filter === "all" ? users : users.filter((u: any) => u.roles.includes(filter));

  const counts = ROLE_OPTIONS.reduce((acc, r) => {
    acc[r] = users.filter((u: any) => u.roles.includes(r)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardShell
      roleLabel="School Admin"
      title="Operations dashboard"
      subtitle="Manage your school's teachers, students, parents and support staff."
      accent="royal"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {ROLE_OPTIONS.map((r) => (
          <StatCard key={r} label={ROLE_LABEL[r]} value={String(counts[r] ?? 0)} />
        ))}
      </div>

      <div className="rounded-3xl bg-card border border-border p-6 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-royal" />
            <h2 className="font-display text-2xl">School users</h2>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setMsg(null); }}
            className="inline-flex items-center gap-2 bg-royal text-white rounded-full px-4 py-2 text-sm font-semibold"
          >
            <UserPlus className="size-4" /> {showForm ? "Cancel" : "Invite user"}
          </button>
        </div>

        {msg && (
          <p className={`text-sm mb-4 ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>
        )}

        {showForm && (
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3 mb-6 p-4 rounded-2xl bg-muted/40">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold">Full name *</span>
              <input name="fullName" required className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold">Email *</span>
              <input name="email" type="email" required className="rounded-xl border border-border px-4 py-2.5 bg-background text-sm" />
            </label>
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

        {error ? (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        ) : isLoading ? (
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

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink label="Timetables" description="Class allocations and room bookings." />
        <QuickLink label="Announcements" description="Broadcast to parents, staff and students." />
        <QuickLink label="Events" description="Trips, PTA meetings and inter-house activities." />
      </div>
    </DashboardShell>
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
