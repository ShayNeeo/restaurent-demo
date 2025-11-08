const openingHours = [
  {
    days: "Montag – Freitag & Sonntag",
    times: ["12:00 – 15:00 (warme Küche bis 14:30)", "17:30 – 22:30 (warme Küche bis 21:00)"]
  },
  {
    days: "Samstag",
    times: ["17:30 – 22:30 (warme Küche bis 21:00)"]
  }
];

export function VisitSection() {
  return (
    <section
      id="anfahrt"
      className="relative overflow-hidden bg-white py-20 sm:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(140,50,49,0.08),_transparent_60%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[2.5rem] bg-brand-light/70 p-10 shadow-soft">
          <span className="badge bg-brand/10 text-brand">Besuch planen</span>
          <h2 className="section-title">
            Wir freuen uns auf Ihren Besuch in München-Schwabing
          </h2>
          <p className="text-base text-slate-700">
            Reservieren Sie telefonisch oder kommen Sie spontan vorbei. Für
            Gruppen empfehlen wir eine kurze Voranmeldung, damit wir Ihre Wünsche
            perfekt vorbereiten können.
          </p>
          <div className="rounded-3xl border border-brand/20 bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-brand">Kontakt</h3>
            <p className="mt-2 text-sm text-slate-600">
              Georgenstraße 67, 80799 München-Schwabing
            </p>
            <a
              href="tel:+498928803451"
              className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-brand transition hover:text-brand-dark"
            >
              089 28803451
            </a>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-brand/70">
              📱 Jetzt online bestellen!
            </p>
          </div>
          <div className="rounded-3xl border border-brand/20 bg-white/90 p-6">
            <h3 className="text-lg font-semibold text-brand">Öffnungszeiten</h3>
            <div className="mt-4 space-y-4 text-sm">
              {openingHours.map((line) => (
                <div key={line.days}>
                  <p className="font-semibold text-slate-700">{line.days}</p>
                  {line.times.map((time) => (
                    <p key={time} className="text-slate-600">
                      {time}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex-1 overflow-hidden rounded-[2.5rem] shadow-soft">
            <iframe
              title="Google Maps: Nguyen Vietnam-Restaurant München"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2661.613983626932!2d11.568734815649654!3d48.156246779224944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479e75c2be83bf53%3A0xa8dc2f14fecb4608!2sGeorgenstra%C3%9Fe+67%2C+80799+M%C3%BCnchen!5e0!3m2!1sde!2sde!4v1508710615544"
              className="h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-[2rem] border border-white bg-brand text-white p-6 text-sm leading-relaxed shadow-lg">
            <p>
              Folgen Sie uns auf{" "}
              <a
                href="https://www.instagram.com/nguyenrestaurant/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline decoration-white/40 underline-offset-4 transition hover:text-yellow-200"
              >
                Instagram
              </a>{" "}
              und{" "}
              <a
                href="https://de-de.facebook.com/Nguyen-Restaurant-214605088558219/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline decoration-white/40 underline-offset-4 transition hover:text-yellow-200"
              >
                Facebook
              </a>{" "}
              für Einblicke hinter die Kulissen, neue Gerichte und aktuelle Aktionen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

