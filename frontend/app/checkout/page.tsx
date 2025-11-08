"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { getBackendUrl } from "@/lib/api";

type ApplyCouponResponse = {
  valid: boolean;
  amount_off?: number | null;
  percent_off?: number | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, coupon, applyCoupon, removeCoupon } =
    useCart();

  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<"success" | "error" | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = items.length === 0 || isProcessing;

  const cartPayload = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitAmount: item.unitAmount,
        quantity: item.quantity,
        currency: item.currency
      })),
    [items]
  );

  const handleApplyCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!couponCode.trim()) {
      setCouponStatus("error");
      setCouponMessage("Bitte geben Sie einen Gutscheincode ein.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponStatus(null);
    setCouponMessage(null);

    try {
      const base = getBackendUrl();
      const response = await fetch(`${base}/api/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          cart: cartPayload
        })
      });

      if (!response.ok) {
        throw new Error("Der Gutschein konnte nicht geprüft werden.");
      }

      const data: ApplyCouponResponse = await response.json();
      if (!data.valid) {
        setCouponStatus("error");
        setCouponMessage("Dieser Gutschein ist nicht gültig oder wurde bereits verwendet.");
        return;
      }

      if (data.amount_off && data.amount_off > 0) {
        applyCoupon({
          code: couponCode.trim(),
          amountOff: data.amount_off,
          label: `Gutschein – ${formatCurrency(data.amount_off)}`
        });
        setCouponStatus("success");
        setCouponMessage("Gutschein erfolgreich angewendet.");
      } else if (data.percent_off && data.percent_off > 0) {
        applyCoupon({
          code: couponCode.trim(),
          percentOff: data.percent_off,
          label: `Rabatt – ${data.percent_off}%`
        });
        setCouponStatus("success");
        setCouponMessage("Rabattcode erfolgreich angewendet.");
      } else {
        setCouponStatus("error");
        setCouponMessage("Dieser Gutschein hat keinen verfügbaren Rabatt.");
      }
    } catch (err) {
      console.error(err);
      setCouponStatus("error");
      setCouponMessage("Beim Prüfen des Gutscheins ist ein Fehler aufgetreten.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const base = getBackendUrl();
      const response = await fetch(`${base}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart: cartPayload,
          coupon: coupon?.code,
          email: email.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Ihre Bestellung konnte nicht verarbeitet werden."
      );
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-brand-light/70 pt-24 pb-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] border border-white/10 bg-white/90 p-8 shadow-soft">
          <header className="mb-8">
            <span className="badge bg-brand/10 text-brand">Checkout</span>
            <h1 className="mt-4 text-3xl font-semibold text-brand-dark">
              Fast geschafft! Jetzt noch kurz bestätigen.
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Nach dem Klick auf „Bezahlen“ werden Sie zu PayPal geleitet. Sobald die Zahlung abgeschlossen
              ist, erhalten Sie eine Bestätigungs-E-Mail.
            </p>
          </header>

          <form onSubmit={handleApplyCoupon} className="space-y-8">
            <div>
              <label
                htmlFor="checkout-email"
                className="text-sm font-semibold uppercase tracking-[0.3em] text-brand"
              >
                E-Mail-Adresse für die Bestätigung
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hallo@meinname.de"
                className="mt-3 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="checkout-coupon"
                  className="text-sm font-semibold uppercase tracking-[0.3em] text-brand"
                >
                  Gutschein / Geschenkcode
                </label>
                {coupon ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500 transition hover:text-red-600"
                  >
                    Entfernen
                  </button>
                ) : null}
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="checkout-coupon"
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="CODE2025"
                  className="w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || items.length === 0}
                  className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApplyingCoupon ? "Prüfe…" : "Anwenden"}
                </button>
              </div>

              {couponStatus && couponMessage ? (
                <p
                  className={`mt-3 text-xs font-semibold uppercase tracking-[0.3em] ${
                    couponStatus === "success" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {couponMessage}
                </p>
              ) : null}

              {coupon && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
                  <strong>{coupon.label}</strong> wird an der Kasse angerechnet.
                </div>
              )}
            </div>
          </form>

          <hr className="my-8 border-dashed border-brand/20" />

          <div className="space-y-4 text-sm text-slate-600">
            <h2 className="text-base font-semibold uppercase tracking-[0.3em] text-brand">
              Sicherheit & Bezahlung
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Alle Zahlungen werden sicher über PayPal abgewickelt.</li>
              <li>Das Nguyen Team erhält Ihre Bestellung sofort nach erfolgreicher Zahlung.</li>
              <li>Gutscheine können direkt während des Bezahlens angerechnet werden.</li>
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2.5rem] border border-brand/20 bg-white/80 p-7 shadow-soft">
            <h2 className="mb-4 text-lg font-semibold text-brand">Bestellübersicht</h2>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ihr Warenkorb ist leer. Entdecken Sie unsere{" "}
                <a
                  href="/menu"
                  className="font-semibold text-brand underline-offset-4 hover:underline"
                >
                  Speisekarte
                </a>
                .
              </p>
            ) : (
              <ul className="space-y-4 text-sm">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-dark">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-brand">
                      {formatCurrency(item.unitAmount * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-6 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Zwischensumme</dt>
                <dd className="font-medium text-brand-dark">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Rabatt</dt>
                <dd className="font-medium text-emerald-500">
                  {discount > 0 ? `- ${formatCurrency(discount)}` : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-brand-dark">
                <dt>Gesamt</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={disabled}
              className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? "Weiterleitung…" : "Mit PayPal bezahlen"}
            </button>

            {error ? (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            ) : null}

            <p className="mt-4 text-xs text-slate-500">
              Mit dem Abschluss Ihrer Bestellung akzeptieren Sie unsere{" "}
              <a href="/coupon" className="underline underline-offset-4">
                Gutscheinbedingungen
              </a>{" "}
              sowie die{" "}
              <a href="https://muenchen-vietnam-restaurant.de/datenschutz/" className="underline underline-offset-4">
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/30 bg-brand text-white px-6 py-7 text-sm leading-relaxed shadow-lg">
            <p className="font-semibold">Abholung & Service</p>
            <p className="mt-2 text-white/80">
              Online bezahlte Bestellungen können vor Ort unkompliziert abgeholt werden. Auf Wunsch
              bereiten wir Gerichte zur gewünschten Uhrzeit vor. Für Bankett- und Catering-Anfragen
              beraten wir Sie gerne persönlich.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

