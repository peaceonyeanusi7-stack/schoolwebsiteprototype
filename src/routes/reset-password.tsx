import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Oasis Academy" },
      { name: "description", content: "Choose a new password for your Oasis Academy portal account." },
      { property: "og:title", content: "Reset Password — Oasis Academy" },
      { property: "og:description", content: "Choose a new password for your Oasis Academy portal account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => navigate({ to: "/auth" }), 1200);
  }

  return (
    <>
      <PageHero
        eyebrow="Account security"
        title="Choose a new password"
        subtitle="Set a new password for your Oasis Academy portal account."
      />
      <section className="pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div className="size-12 rounded-2xl bg-royal/10 flex items-center justify-center mb-6">
              <KeyRound className="size-5 text-royal" />
            </div>
            {done ? (
              <p className="text-sm text-emerald font-semibold">Password updated. Redirecting to sign in…</p>
            ) : !ready ? (
              <p className="text-sm text-muted-foreground">
                Verifying your reset link… if nothing happens, request a new reset email from the sign-in page.
              </p>
            ) : (
              <form className="grid gap-4" onSubmit={onSubmit}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">New password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border border-border px-4 py-3 bg-background"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Confirm password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="rounded-xl border border-border px-4 py-3 bg-background"
                  />
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-royal text-white rounded-full py-3 font-semibold disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
