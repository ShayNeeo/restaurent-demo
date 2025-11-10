"use client";

import { useEffect, useState, useRef } from "react";
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

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

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
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blurIn {
          from {
            opacity: 0;
            filter: blur(10px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .animate-blur-in {
          animation: blurIn 0.8s ease-out forwards;
        }

        [data-scroll-reveal] {
          opacity: 0;
          transform: translateY(40px);
          transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        [data-scroll-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .split-text {
          display: inline-block;
          overflow: hidden;
        }

        .split-text span {
          display: inline-block;
          animation: fadeInUp 1s ease-out forwards;
        }
      `}</style>

      <NavBar />
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-white to-amber-50">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-amber-200/10 pointer-events-none" />
          
          <ScrollReveal className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-xs uppercase tracking-widest font-semibold text-brand/70 font-sans">
                  Kulinarische Meisterwerke
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-brand-dark leading-tight">
                Entdecke unsere <span className="text-brand">Köstlichkeiten</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-light">
                Eine Reise durch authentische vietnamesische Küche, zubereitet mit Leidenschaft und frischesten Zutaten.
              </p>

              <div className="flex gap-4 justify-center pt-8">
                <a href="#galerie" className="btn-primary">
                  Speisekarte erkunden
                </a>
                <a href="tel:+498928803451" className="btn-light">
                  Reservieren
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Gallery Section */}
        <section id="galerie" className="py-20 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                Speisekarte
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Sorgfältig ausgewählte Gerichte, die die Seele Vietnams einfangen
              </p>
            </ScrollReveal>

            {/* Category Filter */}
            <ScrollReveal className="mb-16">
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-500 text-sm uppercase tracking-wide ${
                      activeCategory === category
                        ? "bg-brand text-white shadow-lg scale-105"
                        : "bg-white text-brand border border-brand/20 hover:border-brand/50 hover:bg-brand/5"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-slate-600">Produkte werden geladen...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => {
                  const meta = productMeta[product.id.toLowerCase()];
                  return (
                    <ScrollReveal key={product.id} className={`${index % 3 === 0 ? "lg:col-start-1" : ""}`}>
                      <div className="group h-full overflow-hidden rounded-3xl bg-white shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        {/* Image Container */}
                        <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50">
                          {meta?.image && (
                            <Image
                              src={meta.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                          <p className="text-xs font-bold uppercase tracking-widest text-brand/60 mb-3">
                            {meta?.category || "Gericht"}
                          </p>
                          <h3 className="text-2xl font-display font-bold text-brand-dark mb-3 group-hover:text-brand transition-colors duration-300">
                            {product.name}
                          </h3>
                          <p className="text-sm leading-relaxed text-slate-600 mb-6 line-clamp-3">
                            {meta?.description}
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-amber-100">
                            <span className="text-3xl font-bold text-brand">
                              {(product.unit_amount / 100).toLocaleString("de-DE", {
                                style: "currency",
                                currency: product.currency
                              })}
                            </span>
                            <button className="rounded-full bg-gradient-to-r from-brand to-brand-accent px-6 py-2.5 font-semibold text-white shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-r from-brand/90 to-brand-dark/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl px-6 relative z-10">
            <ScrollReveal>
              <div className="space-y-8">
                <h2 className="text-4xl sm:text-5xl font-display font-bold">
                  Unsere <span className="text-amber-100">Philosophie</span>
                </h2>
                <p className="text-xl leading-relaxed text-white/90 max-w-2xl">
                  Im NGUYEN bereiten wir nicht nur Speisen zu – wir erzählen Geschichten. Jedes Gericht ist ein Kapitel aus der reichen kulinarischen Tradition Vietnams, serviert mit Authentizität und Herzlichkeit.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                { icon: "🌿", title: "Frische Zutaten", description: "Täglich handverlesen für maximale Qualität" },
                { icon: "👨‍🍳", title: "Handwerk", description: "Traditionelle Techniken, moderne Raffinesse" },
                { icon: "❤️", title: "Leidenschaft", description: "Gekocht mit Seele für Ihre Tafel" }
              ].map((item, index) => (
                <ScrollReveal key={index} className={`group`}>
                  <div className="text-center space-y-4 p-8 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20 transition-all duration-500">
                    <span className="text-5xl inline-block">{item.icon}</span>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurant Gallery */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                Unser Restaurant
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Atmosphäre, die Erinnerungen schafft
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <ScrollReveal key={index} className={`${index > 2 ? "lg:col-span-2" : "lg:col-span-1"}`}>
                  <div className="group relative h-64 lg:h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-200 to-amber-100 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Image
                      src={`/images/view-${index}.jpg`}
                      alt={`Restaurant View ${index}`}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-amber-50">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <div className="space-y-8">
                <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark">
                  Bereit für ein Abenteuer?
                </h2>
                <p className="text-lg text-slate-700 max-w-xl mx-auto">
                  Reservieren Sie Ihren Tisch und erleben Sie die Magie vietnamesischer Küche.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <a href="tel:+498928803451" className="btn-primary">
                    089 28803451
                  </a>
                  <a href="#" className="btn-light">
                    Online Reservation
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
