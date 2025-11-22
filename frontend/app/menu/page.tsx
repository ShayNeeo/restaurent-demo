"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { getBackendUrl } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  unit_amount: number;
  currency: string;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  allergens?: string | null;
  additives?: string | null;
  spice_level?: string | null;
  serving_size?: string | null;
  dietary_tags?: string | null;
  ingredients?: string | null;
};

type ProductsResponse = {
  products: Product[];
};

const FALLBACK_IMAGE = "/images/view-4.jpg";
const FALLBACK_DESCRIPTION = "Frisch zubereitet mit typischen Kräutern Vietnams – perfekt für einen Abend in Schwabing.";
const FALLBACK_CATEGORY = "Klassiker";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency
  }).format(amount / 100);
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const base = getBackendUrl();
        const response = await fetch(`${base}/products`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Produktliste konnte nicht geladen werden (${response.status})`);
        }

        const data: ProductsResponse = await response.json();
        setProducts(data.products);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
          setError("Produkte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const grouped = useMemo(() => {
    if (!products.length) {
      return [];
    }

    const map = new Map<string, Product[]>();
    for (const product of products) {
      const category = product.category || FALLBACK_CATEGORY;
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)!.push(product);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      unitAmount: product.unit_amount,
      quantity: 1,
      currency: product.currency
    });
    openCart();
  };

  return (
    <main className="bg-brand-light/70 pt-28 pb-20">
      <section className="mx-auto w-full max-w-6xl px-6">
        <header className="mb-12 text-center">
          <span className="badge bg-brand/10 text-brand">Speisekarte</span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-dark sm:text-4xl">
            Vietnamesische Küche mit Münchner Seele
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Alle Gerichte werden frisch zubereitet und lassen sich auch zum Mitnehmen bestellen.
            Stellen Sie sich Ihr Menü individuell zusammen und schließen Sie den Kauf bequem über
            PayPal ab.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-brand/30 bg-white/60">
            <div className="text-sm uppercase tracking-[0.4em] text-brand">
              Laden…
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/80 px-6 py-10 text-center text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50/90 px-6 py-10 text-center text-yellow-800">
            Noch keine Produkte vorhanden. Legen Sie im Admin-Bereich neue Speisen an.
          </div>
        ) : (
          <div className="space-y-14">
            {grouped.map(([category, items]) => (
              <section key={category}>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-brand">{category}</h2>
                  <span className="text-xs uppercase tracking-[0.4em] text-brand/60">
                    Frisch zubereitet
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((product) => {
                    const imageUrl = product.image_url || FALLBACK_IMAGE;
                    const description = product.description || FALLBACK_DESCRIPTION;
                    const allergens = product.allergens?.split(',').map(a => a.trim()).filter(Boolean) || [];
                    const dietaryTags = product.dietary_tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
                    
                    return (
                      <article
                        key={product.id}
                        className="group flex gap-6 rounded-[2.5rem] border border-white/0 bg-white/90 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl bg-brand/5">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="128px"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-lg font-semibold text-brand-dark">
                                {product.name}
                              </h3>
                              {product.serving_size && (
                                <span className="shrink-0 rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                                  {product.serving_size}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{description}</p>
                            {product.ingredients && (
                              <p className="mt-2 text-xs text-slate-500">
                                <span className="font-medium">Zutaten:</span> {product.ingredients}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {product.spice_level && (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                  🌶️ {product.spice_level}
                                </span>
                              )}
                              {dietaryTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                                >
                                  {tag === 'vegetarian' ? '🥬' : tag === 'vegan' ? '🌱' : ''} {tag}
                                </span>
                              ))}
                            </div>
                            {(allergens.length > 0 || product.additives) && (
                              <div className="mt-2 text-xs text-slate-500">
                                {allergens.length > 0 && (
                                  <span>
                                    <span className="font-medium">Allergene:</span> {allergens.join(', ')}
                                  </span>
                                )}
                                {product.additives && (
                                  <span className={allergens.length > 0 ? ' ml-3' : ''}>
                                    <span className="font-medium">Zusatzstoffe:</span> {product.additives}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-lg font-semibold text-brand">
                              {formatCurrency(product.unit_amount, product.currency)}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                            >
                              In den Warenkorb
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 bg-brand text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold">Reservieren oder vorbestellen</h2>
            <p className="mt-2 text-sm text-white/80">
              Sie haben besondere Wünsche oder möchten eine größere Gruppe anmelden? Rufen Sie uns an.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="tel:+498928803451"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-brand transition hover:bg-yellow-100"
            >
              089 28803451
            </a>
            <a
              href="/coupon"
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:border-white"
            >
              Geschenkgutschein kaufen
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

