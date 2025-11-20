"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// --- Types ---
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
    description: "Gebratene Nudel mit zartem Fleisch, Gemüse und knusprig gerösteten Zwiebeln.",
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

// --- Components ---

function MicrosoftHeader() {
  return (
    <header className="flex items-center justify-between px-[5%] h-[54px] bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-slate-800">
          <div className="w-6 h-6 bg-[#0078D4] grid grid-cols-2 gap-[2px] p-[2px]">
            <div className="bg-white/90"></div>
            <div className="bg-white/90"></div>
            <div className="bg-white/90"></div>
            <div className="bg-white/90"></div>
          </div>
          <span>Microsoft AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-[13px] text-slate-600 font-medium">
          <Link href="#" className="hover:underline hover:text-slate-900">Nguyen Restaurant</Link>
          <Link href="#" className="hover:underline hover:text-slate-900">Menu</Link>
          <Link href="#" className="hover:underline hover:text-slate-900">Reservations</Link>
          <Link href="#" className="hover:underline hover:text-slate-900">About Us</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-[13px]">
        <span className="hidden sm:inline hover:underline cursor-pointer">Search</span>
        <span className="hidden sm:inline hover:underline cursor-pointer">Sign In</span>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-[#f2f2f2] overflow-hidden">
      <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 min-h-[500px] items-center">
        <div className="p-12 md:p-24 flex flex-col justify-center space-y-6 z-10">
          <div className="inline-block bg-[#ffb900] text-black text-xs font-bold px-3 py-1 uppercase tracking-wider w-fit">
            New Experience
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#242424] leading-tight tracking-tight">
            NGUYEN <br /> Vietnam Restaurant
          </h1>
          <p className="text-lg text-slate-700 max-w-md leading-relaxed">
            Experience authentic Vietnamese cuisine in the heart of Munich. Fresh ingredients, traditional recipes, and a warm atmosphere.
          </p>
          <div className="pt-4">
            <a href="#menu" className="inline-block bg-[#0078D4] hover:bg-[#006cbe] text-white font-semibold px-6 py-3 text-sm transition-colors shadow-sm">
              Explore Menu
            </a>
          </div>
        </div>
        <div className="relative h-full min-h-[400px] w-full">
          <Image
            src="/images/view-2.jpg"
            alt="Restaurant Interior"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-[#242424] mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm flex-grow">{description}</p>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <a href="#" className="text-[#0078D4] font-semibold text-sm hover:underline flex items-center gap-1">
          Learn more
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </a>
      </div>
    </div>
  );
}

function ProductCard({ product, meta }: { product: Product, meta?: ProductMeta }) {
  return (
    <div className="group bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {meta?.image ? (
          <Image
            src={meta.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-[#242424] shadow-sm">
          {meta?.category || "Menu Item"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-[#242424] mb-2 group-hover:text-[#0078D4] transition-colors">
          {product.name}
        </h3>
        <p className="text-slate-600 text-sm mb-4 flex-grow line-clamp-3">
          {meta?.description || "Delicious authentic Vietnamese dish prepared with fresh ingredients."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-lg font-semibold text-[#242424]">
            {(product.unit_amount / 100).toLocaleString("de-DE", { style: "currency", currency: product.currency })}
          </span>
          <button className="text-[#0078D4] hover:bg-[#0078D4]/10 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function MicrosoftFooter() {
  return (
    <footer className="bg-[#f2f2f2] text-[#616161] text-xs py-12 px-[5%]">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
        <div className="space-y-3">
          <h4 className="font-semibold text-[#242424]">What's New</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Seasonal Menu</a></li>
            <li><a href="#" className="hover:underline">Chef's Specials</a></li>
            <li><a href="#" className="hover:underline">Events</a></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-[#242424]">Restaurant</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-[#242424]">Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Reservations</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span>English (US)</span>
          </div>
          <span className="hidden md:inline">Your Privacy Choices</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">Sitemap</a>
          <a href="#" className="hover:underline">Contact Microsoft</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms of use</a>
          <a href="#" className="hover:underline">Trademarks</a>
          <a href="#" className="hover:underline">Safety & eco</a>
          <a href="#" className="hover:underline">About our ads</a>
          <span>© Microsoft 2025</span>
        </div>
      </div>
    </footer>
  )
}

// --- Main Page ---

export default function ExamplePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <MicrosoftHeader />

      <main>
        <HeroSection />

        {/* Features Grid */}
        <section className="py-16 px-[5%] bg-white">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-3xl font-semibold text-[#242424] mb-12">Why Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon="🌿"
                title="Fresh Ingredients"
                description="We select ingredients daily and prepare every dish immediately. No compromises, just love and freshness."
              />
              <FeatureCard
                icon="👨‍🍳"
                title="Traditional Recipes"
                description="Authentic recipes from Saigon, prepared with passion and experience passed down through generations."
              />
              <FeatureCard
                icon="🎭"
                title="Warm Atmosphere"
                description="Warm colors, carefully arranged details, and service that is attentive and heartfelt."
              />
            </div>
          </div>
        </section>

        {/* Menu Grid */}
        <section id="menu" className="py-16 px-[5%] bg-[#f2f2f2]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-semibold text-[#242424]">Our Menu</h2>
              <a href="#" className="text-[#0078D4] font-semibold hover:underline flex items-center gap-1">
                View Full Menu
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4]"></div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    meta={productMeta[product.id.toLowerCase()]}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-[5%] bg-[#0078D4] text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to experience Vietnam?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">Book your table now and enjoy an unforgettable evening with us.</p>
          <button className="bg-white text-[#0078D4] font-bold py-3 px-8 rounded-sm hover:bg-gray-100 transition-colors shadow-lg">
            Reserve a Table
          </button>
        </section>

      </main>

      <MicrosoftFooter />
    </div>
  );
}
