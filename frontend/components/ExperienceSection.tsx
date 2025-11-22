const highlights = [
  {
    title: "Mittagsmenüs & Take-away",
    description:
      "Von 12:00 bis 14:30 Uhr servieren wir eine verkürzte Karte mit beliebten Klassikern – ideal für die Mittagspause oder zum Mitnehmen.",
    badge: "Lunch"
  },
  {
    title: "Liebe zum Detail",
    description:
      "Hausgemachte Brühen, frische Kräuter und traditionelle Gewürze: Unsere Küche setzt auf Qualität, Nachhaltigkeit und Authentizität.",
    badge: "Frische"
  },
  {
    title: "Events & Gruppen",
    description:
      "Ob Familienfest oder Business Dinner: Wir gestalten individuelle Menüs und sorgen für einen unvergesslichen Abend im Herzen Schwabings.",
    badge: "Events"
  }
];

export function ExperienceSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="card border border-brand/10 bg-brand-light/40 transition hover:-translate-y-1 hover:border-brand/30"
            >
              <span className="badge mb-4 bg-brand/10 text-xs uppercase tracking-[0.35em] text-brand">
                {item.badge}
              </span>
              <h3 className="text-xl font-semibold text-brand-dark">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-dark/70">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        <div className="rounded-[2.5rem] border border-dashed border-brand/30 bg-brand-light/40 px-8 py-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-brand/70">
            Tipp
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-brand">
            Verwöhnen Sie Ihre Liebsten mit einem Gutscheinerlebnis
          </h3>
          <p className="mt-3 text-sm text-brand-dark/70">
            Fragen Sie unser Team nach Geschenk-Gutscheinen, die Sie direkt vor
            Ort erwerben können – inklusive persönlicher Beratung zu Menüempfehlungen.
          </p>
        </div>
      </div>
    </section>
  );
}

