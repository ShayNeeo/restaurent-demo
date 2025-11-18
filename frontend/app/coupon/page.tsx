"use client";

import { FormEvent, useState } from "react";
import Script from "next/script";
import { useCart } from "@/components/cart/CartContext";
import { getBackendUrl } from "@/lib/api";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wie funktionieren Geschenkgutscheine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Geschenkgutscheine sind digital und werden nach Zahlung per E-Mail verschickt. Sie erhalten automatisch 10% Bonusguthaben on top."
      }
    },
    {
      "@type": "Question",
      name: "Wo kann ich Gutscheincodes einlösen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Codes lassen sich sowohl vor Ort als auch bei Onlinebestellungen einlösen. Geben Sie den Code einfach beim Checkout ein."
      }
    },
    {
      "@type": "Question",
      name: "Gibt es einen Mindestbetrag für Geschenkgutscheine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, der Mindestbetrag für Geschenkgutscheine beträgt 10 €. Sie können auch individuelle Beträge zwischen 10 € und 500 € wählen."
      }
    },
    {
      "@type": "Question",
      name: "Wie lange sind Gutscheine gültig?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Geschenkgutscheine bleiben unbegrenzt gültig. Restwerte werden automatisch gespeichert und können bei der nächsten Bestellung eingelöst werden."
      }
    }
  ]
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

export default function CouponPage() {
  const { items } = useCart();
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<"success" | "error" | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [giftEmail, setGiftEmail] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const applyCart = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    unitAmount: item.unitAmount,
    quantity: item.quantity,
    currency: item.currency
  }));

  const handleCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkCode.trim()) {
      setCheckStatus("error");
      setCheckResult("Bitte geben Sie einen Code ein.");
      return;
    }

    setIsChecking(true);
    setCheckStatus(null);
    setCheckResult(null);

    try {
      const base = getBackendUrl();
      const response = await fetch(`${base}/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: checkCode.trim(),
          cart: applyCart
        })
      });

      if (!response.ok) {
        throw new Error("Der Code konnte nicht geprüft werden.");
      }

      const data: {
        valid: boolean;
        amount_off?: number | null;
        percent_off?: number | null;
      } = await response.json();

      if (!data.valid) {
        setCheckStatus("error");
        setCheckResult(
          "Dieser Gutschein ist nicht gültig, bereits verbraucht oder benötigt ein höheres Guthaben."
        );
        return;
      }

      setCheckStatus("success");
      if (data.amount_off && data.amount_off > 0) {
        setCheckResult(
          `Dieser Code reduziert Ihren aktuellen Warenkorb um ${formatCurrency(
            data.amount_off / 100
          )}.`
        );
      } else if (data.percent_off && data.percent_off > 0) {
        setCheckResult(`Dieser Code gewährt ${data.percent_off}% Rabatt auf Ihre Bestellung.`);
      } else {
        setCheckResult("Dieser Code ist gültig.");
      }
    } catch (error) {
      console.error(error);
      setCheckStatus("error");
      setCheckResult("Beim Prüfen des Codes ist ein Fehler aufgetreten.");
    } finally {
      setIsChecking(false);
    }
  };

  const amountToBuy = customAmount
    ? Math.max(10, Math.min(500, Math.round(Number(customAmount))))
    : selectedAmount;

  const handleBuy = async () => {
    if (Number.isNaN(amountToBuy) || amountToBuy < 10) {
      setBuyError("Der Mindestbetrag für Geschenkgutscheine beträgt 10 €.");
      return;
    }

    setIsBuying(true);
    setBuyError(null);

    try {
      const base = getBackendUrl();
      const response = await fetch(`${base}/gift-coupons/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_eur: amountToBuy,
          email: giftEmail.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setBuyError("Der Gutschein konnte nicht erstellt werden. Bitte versuchen Sie es erneut.");
      setIsBuying(false);
    }
  };

  return (
    <>
      <Script id="faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(faqSchema)}
      </Script>
      <main className="bg-brand-light/70 pt-24 pb-20">
      <section className="mx-auto w-full max-w-5xl px-6">
        <header className="text-center">
          <span className="badge bg-brand/10 text-brand">Gutscheine</span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-dark">
            Genuss verschenken oder Guthaben einlösen
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base text-slate-600">
            Unsere Geschenk-Gutscheine erhalten Sie digital mit 10% Bonus on top. Codes lassen sich hier
            prüfen und auf Ihre Bestellung anwenden.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section className="rounded-[2.5rem] border border-brand/20 bg-white/90 p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-brand">Code prüfen & anwenden</h2>
            <p className="mt-2 text-sm text-slate-600">
              Geben Sie Ihren Gutschein- oder Geschenkcode ein, um das verfügbare Guthaben zu prüfen.
              Wenn Sie bereits Artikel im Warenkorb haben, zeigen wir Ihnen sofort den geltenden Rabatt.
            </p>

            <form onSubmit={handleCheck} className="mt-6 space-y-4">
              <input
                type="text"
                value={checkCode}
                onChange={(event) => setCheckCode(event.target.value)}
                placeholder="Gutschein- oder Geschenkcode"
                className="w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="submit"
                disabled={isChecking}
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChecking ? "Prüfe…" : "Code prüfen"}
              </button>
            </form>

            {checkResult ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  checkStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {checkResult}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-brand/20 bg-white/70 p-4 text-xs text-slate-500">
              Tipp: Gutscheine werden automatisch im Checkout berücksichtigt. Sie können mehrere Codes
              nacheinander anwenden, solange Restguthaben vorhanden ist.
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-brand/20 bg-white/90 p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-brand">Geschenkgutschein kaufen</h2>
            <p className="mt-2 text-sm text-slate-600">
              Bezahlen Sie bequem mit PayPal und erhalten Sie automatisch 10% Bonusguthaben. Der Code wird
              Ihnen per E-Mail zugesendet.
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                Schnellwahl
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[10, 20, 50, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(value);
                      setCustomAmount("");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selectedAmount === value && !customAmount
                        ? "border-brand bg-brand text-white"
                        : "border-brand/20 bg-white hover:border-brand"
                    }`}
                  >
                    {formatCurrency(value)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="custom-amount"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-brand"
              >
                Individueller Betrag (mind. 10 €)
              </label>
              <input
                id="custom-amount"
                type="number"
                min={10}
                max={500}
                step={5}
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setSelectedAmount(0);
                }}
                placeholder="z. B. 75"
                className="mt-3 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="gift-email"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-brand"
              >
                E-Mail für den Versand
              </label>
              <input
                id="gift-email"
                type="email"
                value={giftEmail}
                onChange={(event) => setGiftEmail(event.target.value)}
                placeholder="optionale E-Mail-Adresse"
                className="mt-3 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
              <p className="mt-2 text-xs text-slate-500">
                Wenn leer, nutzen wir die PayPal-E-Mail-Adresse für die Zustellung.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-brand/20 bg-white/70 px-4 py-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Sie zahlen</span>
                <span className="font-semibold text-brand">
                  {formatCurrency(amountToBuy)}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600">
                <span>Sie erhalten</span>
                <span className="font-semibold">
                  {formatCurrency(amountToBuy * 1.1)} (inkl. 10% Bonus)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuy}
              disabled={isBuying}
              className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBuying ? "Weiterleitung…" : "Jetzt Gutschein kaufen"}
            </button>

            {buyError ? (
              <p className="mt-3 text-sm text-red-500">{buyError}</p>
            ) : null}

            <p className="mt-6 text-xs text-slate-500">
              Geschenkgutscheine bleiben unbegrenzt gültig. Restwerte werden automatisch gespeichert und
              können bei der nächsten Bestellung eingelöst werden.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-[2.5rem] border border-brand/20 bg-brand text-white px-8 py-10 text-sm leading-relaxed shadow-soft">
          <h2 className="text-lg font-semibold">FAQ & Bedingungen</h2>
          <ul className="mt-4 space-y-2 text-white/80">
            <li>• Geschenkgutscheine sind digital und werden nach Zahlung per E-Mail verschickt.</li>
            <li>• Codes lassen sich sowohl vor Ort als auch bei Onlinebestellungen einlösen.</li>
            <li>• Für Firmenanfragen stellen wir gerne Rechnungen aus – sprechen Sie uns an.</li>
          </ul>
        </section>
      </section>
    </main>
    </>
  );
}

