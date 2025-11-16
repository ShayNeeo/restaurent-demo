 "use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CartButton } from "./cart/CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navLinks = [
  { label: "Über uns", href: "#geschichten" },
  { label: "Speisekarte", href: "#speisekarte" },
  { label: "Galerie", href: "#galerie" },
  { label: "Anfahrt", href: "#anfahrt" }
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setAtTop(current < 16);
      setHidden(current > lastScroll.current && current > 120);
      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [mobileOpen]);

  const baseClasses =
    "fixed inset-x-0 top-0 z-50 border-b border-white/10 transition-transform duration-300";
  const background = atTop ? "bg-transparent" : "bg-brand/80 backdrop-blur";

  return (
    <>
      <header className={`${baseClasses} ${background} ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="#hero"
            className="font-display text-2xl text-white drop-shadow transition hover:text-yellow-300"
          >
            Nguyen Restaurant
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium text-white sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-yellow-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="tel:+498928803451"
              className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] transition hover:bg-white/30"
            >
              089 28803451
            </a>
            <LanguageSwitcher />
            <CartButton />
          </nav>

          <div className="flex items-center gap-3 sm:hidden">
            <CartButton />
            <button
              type="button"
              aria-label={mobileOpen ? "Navigation schließen" : "Navigation öffnen"}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white hover:bg-white/20"
            >
              <span className="sr-only">
                {mobileOpen ? "Navigation schließen" : "Navigation öffnen"}
              </span>
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-brand-dark/80 backdrop-blur transition-opacity duration-300 sm:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <nav
        className={`fixed inset-x-0 top-0 z-50 mt-[72px] flex origin-top flex-col gap-4 bg-gray-950/95 px-6 py-10 text-sm text-white shadow-2xl transition-transform duration-300 sm:hidden ${
          mobileOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-base font-semibold uppercase tracking-[0.35em] transition hover:text-yellow-200"
          >
            {link.label}
          </a>
        ))}
        <a
          href="tel:+498928803451"
          onClick={() => setMobileOpen(false)}
          className="rounded-full bg-white/20 px-4 py-2 text-center text-base font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white/30"
        >
          089 28803451
        </a>
        <a
          href="/coupon"
          onClick={() => setMobileOpen(false)}
          className="rounded-full border border-white/20 px-4 py-2 text-center text-base font-semibold uppercase tracking-[0.35em] text-white transition hover:border-yellow-300 hover:text-yellow-300"
        >
          Gutscheine
        </a>
        <div className="flex justify-center border-t border-white/10 pt-4">
          <LanguageSwitcher />
        </div>
      </nav>
    </>
  );
}

