import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import { Lock } from "lucide-react";
import { pickPrimaryRole, ROLE_DASHBOARD, type AppRole } from "@/lib/roles";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Oasis Academy" },
      { name: "description", content: "Sign in to Oasis Academy portal for staff, parents and students." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

async function redirectToRoleDashboard(navigate: ReturnType<typeof useNavigate>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { data: rows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const roles = (rows ?? []).map((r) => r.role as AppRole);
  const primary = pickPrimaryRole(roles);
  navigate({ to: primary ? ROLE_DASHBOARD[primary] : "/dashboard/pending" });
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) redirectToRoleDashboard(navigate);
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    await redirectToRoleDashboard(navigate);
  }

  return (
    <>
      <PageHero
        eyebrow="Portal Sign-in"
        title="Welcome back"
        subtitle="Sign in to your Oasis Academy portal. Accounts are provisioned by school administrators."
      />
      <section className="pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div className="size-12 rounded-2xl bg-royal/10 flex items-center justify-center mb-6">
              <Lock className="size-5 text-royal" />
            </div>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border px-4 py-3 bg-background"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-border px-4 py-3 bg-background"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-royal text-white rounded-full py-3 font-semibold disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Need access? Contact the school office.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
