import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  accent = "royal",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  accent?: "royal" | "emerald" | "sunshine" | "gold";
  children?: ReactNode;
}) {
  const accentClass = {
    royal: "bg-royal/10 text-royal",
    emerald: "bg-emerald/10 text-emerald",
    sunshine: "bg-sunshine/15 text-royal",
    gold: "bg-gold/10 text-gold",
  }[accent];
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--royal)_0%,transparent_60%)] opacity-[0.04]" />
      <div className="max-w-5xl mx-auto px-6 text-center">
        {eyebrow && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 ${accentClass}`}>
            <span className="size-1.5 rounded-full bg-current opacity-70" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-medium leading-[1.05] text-balance text-royal mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
