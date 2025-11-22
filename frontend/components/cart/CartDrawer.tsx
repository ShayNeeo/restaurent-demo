"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value / 100);
}

export function CartDrawer() {
  const {
    items,
    subtotal,
    discount,
    total,
    coupon,
    isOpen,
    updateQuantity,
    removeItem,
    closeCart,
    removeCoupon
  } = useCart();

  const hasItems = items.length > 0;

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[98] bg-black/40 transition-opacity ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-[99] flex h-full w-full max-w-md flex-col bg-gray-950/95 text-white shadow-2xl backdrop-blur transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold">Ihre Bestellung</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-gray-300 transition hover:border-white hover:text-white"
          >
            Schließen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasItems ? (
            <p className="text-sm text-gray-400">
              Ihr Warenkorb ist leer. Entdecken Sie unsere{" "}
              <Link
                href="/menu"
                onClick={closeCart}
                className="font-semibold text-yellow-400 underline-offset-4 hover:underline"
              >
                Speisekarte
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="rounded-2xl border border-brand-light/10 bg-brand-light/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatCurrency(item.unitAmount)} •{" "}
                        <span className="uppercase tracking-[0.3em] text-xs text-gray-500">
                          {item.currency}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 transition hover:text-red-300"
                    >
                      Entfernen
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-light/10 bg-brand-light/5 px-3 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(item.quantity - 1, 0))
                        }
                        className="px-2 text-lg leading-none text-gray-300 transition hover:text-white"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, Math.min(item.quantity + 1, 999))
                        }
                        className="px-2 text-lg leading-none text-gray-300 transition hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-yellow-300">
                      {formatCurrency(item.unitAmount * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 bg-gray-950/80 p-6">
          <dl className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <dt>Zwischensumme</dt>
              <dd className="font-medium text-white">{formatCurrency(subtotal)}</dd>
            </div>

            {coupon && discount > 0 ? (
              <div className="flex items-center justify-between text-emerald-300">
                <dt className="flex items-center gap-2">
                  Rabatt{" "}
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="rounded-full border border-emerald-400 px-2 py-0.5 text-xs text-emerald-200 transition hover:bg-emerald-400 hover:text-emerald-900"
                  >
                    Entfernen
                  </button>
                </dt>
                <dd>-{formatCurrency(discount)}</dd>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-base font-semibold text-white">
              <dt>Gesamt</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              onClick={hasItems ? closeCart : undefined}
              className={`flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] transition ${
                hasItems
                  ? "bg-yellow-400 text-gray-950 hover:bg-yellow-300"
                  : "pointer-events-none bg-gray-600 text-gray-300/60"
              }`}
            >
              Zur Kasse
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="w-full rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-gray-300 transition hover:border-white hover:text-white"
            >
              Weiter einkaufen
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

