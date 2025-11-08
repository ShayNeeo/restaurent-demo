import { notFound } from "next/navigation";
import { getBackendUrl } from "@/lib/api";

type OrderItem = {
  product_id: string;
  quantity: number;
  unit_amount: number;
  name: string;
};

type OrderDetails = {
  id: string;
  email: string;
  total_cents: number;
  coupon_code?: string | null;
  discount_cents: number;
  items: OrderItem[];
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value / 100);
}

async function fetchOrder(id: string): Promise<OrderDetails> {
  const base = getBackendUrl();
  const response = await fetch(`${base}/orders/${id}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Bestellung konnte nicht geladen werden (${response.status}).`);
  }

  return response.json();
}

export default async function ThankYouPage({
  params
}: {
  params: { id: string };
}) {
  const order = await fetchOrder(params.id);

  const subtotal =
    order.items.reduce(
      (sum, item) => sum + item.unit_amount * Math.max(item.quantity, 0),
      0
    ) + order.discount_cents;

  return (
    <main className="bg-brand-light/70 pt-24 pb-20">
      <section className="mx-auto w-full max-w-4xl px-6">
        <div className="rounded-[2.5rem] border border-white/20 bg-white/95 p-10 shadow-soft">
          <header className="text-center">
            <span className="badge bg-brand/10 text-brand">Vielen Dank</span>
            <h1 className="mt-4 text-3xl font-semibold text-brand-dark">
              Ihre Bestellung ist bei uns eingegangen!
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Eine Bestätigung wurde an <strong>{order.email}</strong> gesendet. Wir melden uns, sobald
              alles vorbereitet ist.
            </p>
          </header>

          <div className="mt-10 rounded-3xl border border-brand/20 bg-white/70 p-6">
            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-semibold text-brand-dark">Bestellnummer:</span>{" "}
                {order.id}
              </p>
              <p>
                <span className="font-semibold text-brand-dark">Datum:</span>{" "}
                {new Date(order.created_at).toLocaleString("de-DE")}
              </p>
            </div>

            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              {order.items.map((item) => (
                <li
                  key={`${item.product_id}-${item.unit_amount}`}
                  className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/80 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-brand-dark">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {item.quantity} × {formatCurrency(item.unit_amount)}
                    </p>
                  </div>
                  <p className="font-semibold text-brand">
                    {formatCurrency(item.unit_amount * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-8 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Zwischensumme</dt>
                <dd className="font-medium text-brand-dark">
                  {formatCurrency(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Rabatt</dt>
                <dd className="font-medium text-emerald-500">
                  {order.discount_cents > 0
                    ? `- ${formatCurrency(order.discount_cents)}`
                    : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Gutschein</dt>
                <dd className="font-medium">
                  {order.coupon_code ? order.coupon_code : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-brand-dark">
                <dt>Gesamtbetrag</dt>
                <dd>{formatCurrency(order.total_cents)}</dd>
              </div>
            </dl>
          </div>

          <footer className="mt-10 space-y-4 rounded-3xl border border-brand/20 bg-brand text-white px-6 py-8 text-sm leading-relaxed">
            <p>
              <strong>Abholung & Service:</strong> Bitte nennen Sie beim Abholen einfach Ihre
              Bestellnummer. Für besondere Wünsche erreichen Sie uns telefonisch.
            </p>
            <p>
              Folgen Sie uns auf{" "}
              <a
                href="https://www.instagram.com/nguyenrestaurant/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Instagram
              </a>{" "}
              und{" "}
              <a
                href="https://de-de.facebook.com/Nguyen-Restaurant-214605088558219/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Facebook
              </a>{" "}
              für aktuelle Specials.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

