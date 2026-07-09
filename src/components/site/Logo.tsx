import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="size-10 bg-royal rounded-xl flex items-center justify-center shadow-sm ring-1 ring-royal/20">
        <span className="text-gold font-display font-semibold text-xl leading-none">O</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display text-lg font-semibold tracking-tight ${light ? "text-white" : "text-royal"}`}>
          Oasis Academy
        </span>
        <span className={`text-[10px] tracking-[0.2em] uppercase font-medium ${light ? "text-white/60" : "text-muted-foreground"}`}>
          Nursery · Primary · Secondary
        </span>
      </div>
    </Link>
  );
}
