import Image from "next/image";

const gallery = [
  { src: "/images/view-1.jpg", alt: "Außenansicht Nguyen Restaurant" },
  { src: "/images/view-2.jpg", alt: "Eingang Nguyen Restaurant" },
  { src: "/images/view-3.jpg", alt: "Hauptgastraum Nguyen Restaurant" },
  { src: "/images/view-4.jpg", alt: "Detailaufnahme vietnamesische Dekoration" },
  { src: "/images/view-5.jpg", alt: "Stimmungsvoller Abend im Restaurant" },
  { src: "/images/view-6.jpg", alt: "Festliche Tischdekoration" },
  { src: "/images/view-7.jpg", alt: "Barbereich mit vietnamesischen Cocktails" },
  { src: "/images/view-8.jpg", alt: "Gemütliche Sitznische mit warmem Licht" }
];

export function GallerySection() {
  return (
    <section id="galerie" className="bg-brand/95 py-20 sm:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 text-white">
        <div className="flex flex-col items-center text-center">
          <span className="badge bg-brand-light/10 text-white">Impressionen</span>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Atmosphäre zum Wohlfühlen
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Handverlesene Dekoration, viel Holz und warme Beleuchtung schaffen
            das besondere Flair unseres Hauses. Lassen Sie sich inspirieren.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((photo) => (
            <figure
              key={photo.src}
              className="group relative aspect-[4/5] overflow-hidden rounded-[2rem]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-xs uppercase tracking-[0.3em] text-white/70 opacity-0 transition group-hover:opacity-100">
                {photo.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

