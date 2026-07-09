import { useEffect, useState } from "react";

const messages = [
  "Admissions Now Open for the 2026/2027 Academic Session",
  "Book a Campus Tour — Experience Oasis in Person",
  "Excellence from Nursery to Secondary",
  "Limited Scholarship Opportunities Available",
  "Preparing Future Leaders Since 1998",
  "Safe, Technology-Driven Learning Environment",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-royal py-2 px-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
        <span className="size-1.5 rounded-full bg-sunshine animate-pulse" />
        <p className="text-xs md:text-sm font-medium tracking-wide text-center transition-opacity">
          {messages[i]}
        </p>
      </div>
    </div>
  );
}
