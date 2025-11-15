export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl">Nguyen Restaurant</p>
          <p className="mt-1 text-sm text-white/70">
            Authentische vietnamesische Küche in München-Schwabing.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:items-center sm:gap-6">
          <a
            href="https://nguyenrestaurent.de/impressum"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Impressum
          </a>
          <a
            href="https://nguyenrestaurent.de/datenschutz"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Datenschutz
          </a>
          <span>© {new Date().getFullYear()} NGUYEN Vietnam-Restaurant München</span>
        </div>
      </div>
    </footer>
  );
}

