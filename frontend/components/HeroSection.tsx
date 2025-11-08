"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const slides = [
  {
    image: "/images/view-3.jpg",
    eyebrow: "Tradition trifft Moderne",
    heading: "Nguyen Restaurant München",
    description:
      "Familiengeführt, herzlich, exquisit. Erleben Sie die unverwechselbar leichte Küche Vietnams – frisch zubereitet und mit viel Liebe serviert."
  },
  {
    image: "/images/view-6.jpg",
    eyebrow: "Warme Atmosphäre",
    heading: "Ein Ort zum Genießen",
    description:
      "Ob Dinner mit Freunden oder romantischer Abend – genießen Sie authentische Speisen in wohligem Ambiente voller Charme."
  },
  {
    image: "/images/view-8.jpg",
    eyebrow: "Frische Zutaten",
    heading: "Vietnam in Schwabing",
    description:
      "Wir kochen mit Leidenschaft, frischen Kräutern und traditionellen Rezepten aus Saigon – für einen Abend wie im Urlaub."
  }
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (event.clientX / innerWidth - 0.5) * 10,
        y: (event.clientY / innerHeight - 0.5) * 10
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const parallaxStyle = useMemo(
    () => ({
      transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`
    }),
    [mousePosition]
  );

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.heading}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover brightness-75"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="pointer-events-none absolute inset-0">
        <span
          aria-hidden
          className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl"
          style={parallaxStyle}
        />
        <span
          aria-hidden
          className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl"
          style={{ transform: `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0)` }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <span className="badge bg-white/20 text-sm uppercase tracking-[0.3em] text-white">
          {slides[active].eyebrow}
        </span>
        <h1 className="font-display text-4xl leading-tight text-white drop-shadow-xl sm:text-5xl md:text-6xl">
          {slides[active].heading}
        </h1>
        <p className="max-w-2xl text-lg text-white/85 sm:text-xl">
          {slides[active].description}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <a href="tel:+498928803451" className="btn-primary">
            Jetzt reservieren
          </a>
          <a href="#speisekarte" className="btn-light">
            Speisekarte entdecken
          </a>
        </div>
        <div className="mt-8 grid w-full gap-4 rounded-3xl bg-white/10 p-6 text-left backdrop-blur sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Adresse</p>
            <p className="mt-1 text-sm font-semibold">
              Georgenstraße 67 <br />
              80799 München-Schwabing
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Öffnungszeiten</p>
            <p className="mt-1 text-sm font-medium">
              Mo–Fr & So: 12:00–15:00, 17:30–22:30 <br />
              Sa: 17:30–22:30
            </p>
          </div>
          <a
            href="tel:+498928803451"
            className="group block rounded-2xl border border-white/20 p-4 transition hover:border-white/40"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Reservierungen</p>
            <p className="mt-1 text-lg font-semibold tracking-wide text-white group-hover:text-yellow-200">
              089 28803451
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/60">
              Jetzt anrufen
            </p>
          </a>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((_slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={`h-2 w-8 rounded-full transition ${
                index === active ? "bg-yellow-300" : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

