"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

interface ProductsResponse {
  products: Product[];
}

type Product = {
  id: string;
  name: string;
  unit_amount: number;
  currency: string;
};

type ProductMeta = {
  image: string;
  description: string;
  category: string;
};

const productMeta: Record<string, ProductMeta> = {
  lobster: {
    image: "/images/bo-kho-goi-cuon.jpg",
    description: "Hausgemachte Pasta mit Hummer in aromatischer Bisque. Ein Signature-Dish des Hauses.",
    category: "Spezialitäten"
  },
  pho: {
    image: "/images/pho-chay.jpg",
    description: "Aromatische Reisnudelsuppe mit frischen Kräutern, Limette und zarter Brühe.",
    category: "Suppen"
  },
  bao: {
    image: "/images/khai-vi-starter.jpg",
    description: "Fluffige Bao-Buns gefüllt mit saftigem Fleisch oder Tofu, mariniert in Hoisin.",
    category: "Street Food"
  },
  gyoza: {
    image: "/images/steamed-gyoza.jpg",
    description: "Handgefaltete Teigtaschen mit Gemüse- oder Fleischfüllung, dazu Soja-Dip.",
    category: "Vorspeisen"
  },
  curry: {
    image: "/images/curry.jpg",
    description: "Cremiger Curry mit zarten Fleischstücken, Kokosmilch und aromatischen Gewürzen.",
    category: "Hauptgänge"
  },
  bunthitxao: {
    image: "/images/bun-thit-xao.jpg",
    description: "Gebratene Nudeln mit zartem Fleisch, Gemüse und knusprig gerösteten Zwiebeln.",
    category: "Nudelgerichte"
  },
  friedgyoza: {
    image: "/images/fried-gyoza.jpg",
    description: "Knusprig frittierte Teigtaschen mit würziger Soße zum Dippen.",
    category: "Vorspeisen"
  },
  goicuon: {
    image: "/images/goi-cuon.jpg",
    description: "Frische Reispapierrollen mit Shrimps, Kräutern und cremigem Erdnuss-Dip.",
    category: "Vorspeisen"
  }
};

export default function ExamplePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Alle");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const response = await fetch(`${backendUrl}/api/products`);
        if (response.ok) {
          const data = (await response.json()) as ProductsResponse;
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Alle", ...Array.from(new Set(products.map((p: Product) => productMeta[p.id.toLowerCase()]?.category || "Sonstiges")))];
  
  const filteredProducts = activeCategory === "Alle" 
    ? products 
    : products.filter((p: Product) => productMeta[p.id.toLowerCase()]?.category === activeCategory);

  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Beispiel-Galerie
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Erhalten Sie einen Einblick in unsere exquisiten Gerichte und Restaurants
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            {/* Category Filter */}
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition ${
                    activeCategory === category
                      ? "bg-brand text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center">
                <p className="text-slate-600">Produkte werden geladen...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => {
                  const meta = productMeta[product.id.toLowerCase()];
                  return (
                    <div
                      key={product.id}
                      className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                        {meta?.image && (
                          <Image
                            src={meta.image}
                            alt={product.name}
                            fill
                            className="object-cover transition group-hover:scale-110"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                          {meta?.category || "Dish"}
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {meta?.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-2xl font-bold text-brand">
                            {(product.unit_amount / 100).toLocaleString("de-DE", {
                              style: "currency",
                              currency: product.currency
                            })}
                          </span>
                          <button className="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-dark">
                            In den Warenkorb
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-900 py-16 text-white sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Warum NGUYEN Restaurant?
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
                <div className="text-4xl mb-4">🍲</div>
                <h3 className="text-xl font-bold">Authentische Rezepte</h3>
                <p className="mt-3 text-white/70">
                  Traditionelle vietnamesische Rezepte aus Saigon, zubereitet mit Leidenschaft und frischesten Zutaten.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
                <div className="text-4xl mb-4">👨‍🍳</div>
                <h3 className="text-xl font-bold">Erfahrene Köche</h3>
                <p className="mt-3 text-white/70">
                  Unser Team verfügt über jahrzehntelange Erfahrung in der vietnamesischen Küche und Tradition.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-bold">Premium-Qualität</h3>
                <p className="mt-3 text-white/70">
                  Nur die besten Zutaten, sorgsam ausgewählt und täglich frisch für Ihre Tafel zubereitet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Images Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Unser Restaurant
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                <div key={index} className="group relative h-64 overflow-hidden rounded-2xl bg-slate-200">
                  <Image
                    src={`/images/view-${index}.jpg`}
                    alt={`Restaurant View ${index}`}
                    fill
                    className="object-cover transition group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

