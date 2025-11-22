import Image from "next/image";

export function AboutSection() {
  return (
    <section
      id="geschichten"
      className="relative overflow-hidden bg-white py-20 sm:py-28"
    >
      <div className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-brand/10 to-transparent sm:block" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="badge bg-brand/10 text-brand">Seit 1996</span>
          <h2 className="section-title">
            Familiengeführte Gastfreundschaft – mitten in Schwabing
          </h2>
          <p className="text-lg leading-relaxed text-brand-dark/80">
            Die vietnamesische Küche ist geprägt von Tradition und
            Leichtigkeit. Im NGUYEN bereiten wir unsere Speisen von Hand und mit
            größter Sorgfalt zu. Entdecken Sie eine Vielfalt an milden bis
            aromatisch-würzigen Gerichten und lassen Sie sich auf Wunsch einen
            Hauch vietnamesisches Feuer servieren.
          </p>
          <p className="text-lg leading-relaxed text-brand-dark/80">
            Reis begleitet uns in jeder Variation: als Reispapier, Reisnudeln
            oder duftender Jasminreis. Probieren Sie Pho Bò, Goi Cuon oder unser
            vegetarisches Bun – jede Spezialität erzählt eine Geschichte aus
            Saigon.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card">
              <h3 className="text-xl font-semibold text-brand">Ambiente</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">
                Warme Farben, sorgfältig arrangierte Details und ein Service, der
                aufmerksam und herzlich ist – so schmeckt Vietnam doppelt gut.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold text-brand">Frische</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">
                Wir wählen Zutaten täglich frisch aus und bereiten jedes Gericht
                unmittelbar zu. Ohne Kompromisse, mit viel Liebe.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="tel:+498928803451" className="btn-primary">
              Tisch reservieren
            </a>
            <a
              href="#anfahrt"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-dark"
            >
              Anfahrt & Öffnungszeiten ansehen →
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-3xl border-4 border-brand/20 lg:block" />
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-soft">
            <Image
              src="/images/view-5.jpg"
              alt="Restaurant Nguyen – gemütliches Interieur"
              width={960}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="card absolute -bottom-10 left-1/2 w-[85%] -translate-x-1/2 bg-white shadow-lg sm:w-3/4">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand/70">
              Highlights
            </p>
            <ul className="mt-3 space-y-2 text-sm text-brand-dark/70">
              <li>• Traditionelle Rezepte aus Saigon</li>
              <li>• Vegetarische und vegane Optionen</li>
              <li>• Exquisite Pho-Variationen & Fingerfood</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

