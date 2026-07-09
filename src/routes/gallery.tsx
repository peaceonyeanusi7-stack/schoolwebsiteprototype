import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import heroSecondary from "@/assets/hero-secondary.jpg";
import heroNursery from "@/assets/hero-nursery.jpg";
import divisionNursery from "@/assets/division-nursery.jpg";
import divisionPrimary from "@/assets/division-primary.jpg";
import divisionSecondary from "@/assets/division-secondary.jpg";
import campus from "@/assets/campus.jpg";
import lab from "@/assets/facility-lab.jpg";
import sports from "@/assets/facility-sports.jpg";
import library from "@/assets/facility-library.jpg";
import coding from "@/assets/facility-coding.jpg";
import principal from "@/assets/principal.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Oasis Academy" },
      { name: "description", content: "Photographs of classrooms, laboratories, sports, arts, events, graduation and campus life at Oasis Academy." },
      { property: "og:title", content: "Gallery — Oasis Academy" },
      { property: "og:description", content: "A visual tour of life at Oasis Academy." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const images = [
    { src: heroSecondary, label: "Science Lab" },
    { src: divisionNursery, label: "Nursery" },
    { src: divisionPrimary, label: "Primary" },
    { src: divisionSecondary, label: "Robotics" },
    { src: lab, label: "Chemistry" },
    { src: sports, label: "Aquatics" },
    { src: library, label: "Library" },
    { src: coding, label: "Coding Lab" },
    { src: heroNursery, label: "Art Studio" },
    { src: campus, label: "Campus" },
    { src: principal, label: "Leadership" },
    { src: divisionSecondary, label: "Assembly" },
  ];
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Life at <span className="italic text-gold">Oasis</span>.</>}
        subtitle="A visual journey through our classrooms, campus, events and community."
      />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden group ${i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
                <img src={img.src} alt={img.label} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-semibold">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
