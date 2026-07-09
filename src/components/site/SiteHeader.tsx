import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";

const academics = [
  { to: "/academics/nursery", label: "Nursery School" },
  { to: "/academics/primary", label: "Primary School" },
  { to: "/academics/secondary", label: "Secondary School" },
] as const;

const primaryLinks = [
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/student-life", label: "Student Life" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [acadOpen, setAcadOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium hover:text-royal transition-colors">About</Link>
            <div
              className="relative"
              onMouseEnter={() => setAcadOpen(true)}
              onMouseLeave={() => setAcadOpen(false)}
            >
              <button className="text-sm font-medium flex items-center gap-1 hover:text-royal transition-colors">
                Academics <ChevronDown className="size-3.5" />
              </button>
              {acadOpen && (
                <div className="absolute top-full left-0 pt-3 min-w-[220px]">
                  <div className="bg-card rounded-2xl shadow-xl border border-border p-2">
                    {academics.map((a) => (
                      <Link
                        key={a.to}
                        to={a.to}
                        className="block px-4 py-2.5 text-sm rounded-xl hover:bg-royal/5 hover:text-royal transition-colors"
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/admissions" className="text-sm font-medium hover:text-royal transition-colors">Admissions</Link>
            <Link to="/student-life" className="text-sm font-medium hover:text-royal transition-colors">Student Life</Link>
            <Link to="/gallery" className="text-sm font-medium hover:text-royal transition-colors">Gallery</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-royal transition-colors">Contact</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="hidden md:inline-flex text-sm font-semibold text-royal px-4 py-2 hover:bg-royal/5 rounded-full transition-colors"
          >
            Book Tour
          </Link>
          <Link
            to="/admissions"
            className="bg-gold text-white text-sm font-semibold py-2.5 px-5 rounded-full flex items-center gap-2 shadow-sm ring-1 ring-gold/50 hover:brightness-110 transition"
          >
            Apply Now
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden size-10 flex items-center justify-center rounded-full hover:bg-muted"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
            {[...primaryLinks].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-royal/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">Academics</p>
              {academics.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-royal/5 block"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
