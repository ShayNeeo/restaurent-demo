export default function GenericThankYouPage() {
  return (
    <main className="bg-brand-light/70 pt-24 pb-20">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <div className="rounded-[2.5rem] border border-white/20 bg-white/95 px-8 py-16 shadow-soft">
          <span className="badge bg-brand/10 text-brand">Vielen Dank</span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-dark">
            Wir haben Ihre Bestellung registriert.
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Sollte Ihre Bestellnummer noch nicht sichtbar sein, aktualisieren Sie die Seite in ein paar
            Sekunden oder prüfen Sie Ihr E-Mail-Postfach.
          </p>
          <a
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-brand-dark"
          >
            Zurück zur Speisekarte
          </a>
        </div>
      </section>
    </main>
  );
}

