import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-royal-deep text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-2 max-w-sm">
            <div className="[&_span]:!text-white [&_a]:!text-white">
              <Logo light />
            </div>
            <p className="mt-6 text-sm text-white/70 leading-relaxed">
              Empowering leaders through innovation, excellence, and character development.
              Providing world-class education from early childhood to graduation in Lagos, Nigeria.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="size-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gold mb-5">Academics</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/academics/nursery" className="hover:text-white">Nursery</Link></li>
              <li><Link to="/academics/primary" className="hover:text-white">Primary</Link></li>
              <li><Link to="/academics/secondary" className="hover:text-white">Secondary</Link></li>
              <li><Link to="/student-life" className="hover:text-white">Student Life</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gold mb-5">Admissions</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/admissions" className="hover:text-white">How to Apply</Link></li>
              <li><Link to="/contact" className="hover:text-white">Book a Tour</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-gold mb-5">Contact</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2"><MapPin className="size-4 shrink-0 mt-0.5" /> Victoria Island,<br />Lagos, Nigeria</li>
              <li className="flex gap-2"><Phone className="size-4 shrink-0 mt-0.5" /> +234 800 000 0000</li>
              <li className="flex gap-2"><Mail className="size-4 shrink-0 mt-0.5" /> hello@oasis.edu.ng</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Oasis Academy. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/parent-portal" className="text-xs text-white/60 hover:text-white">Parent Portal</Link>
            <Link to="/student-portal" className="text-xs text-white/60 hover:text-white">Student Portal</Link>
            <a href="#" className="text-xs text-white/60 hover:text-white">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
