import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

interface Props {
  roleLabel: string;
  title: string;
  subtitle?: string;
  accent?: "royal" | "gold" | "emerald" | "sunshine";
  children: ReactNode;
}

const accentClasses: Record<NonNullable<Props["accent"]>, string> = {
  royal: "bg-royal text-white",
  gold: "bg-gold text-white",
  emerald: "bg-emerald text-white",
  sunshine: "bg-sunshine text-royal",
};

export function DashboardShell({ roleLabel, title, subtitle, accent = "royal", children }: Props) {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-[70vh] bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}>
              {roleLabel}
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-medium text-royal">{title}</h1>
            {subtitle && <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>}
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium text-royal">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function QuickLink({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 hover:border-royal/40 transition-colors cursor-pointer">
      <h3 className="font-semibold text-lg">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
