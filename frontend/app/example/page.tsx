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
    description: "Homemade pasta with lobster in aromatic bisque. A house signature dish.",
    category: "Signature"
  },
  pho: {
    image: "/images/pho-chay.jpg",
    description: "Aromatic rice noodle soup with fresh herbs, lime, and tender broth.",
    category: "Soups"
  },
  bao: {
    image: "/images/khai-vi-starter.jpg",
    description: "Fluffy bao buns filled with juicy meat or tofu, marinated in hoisin.",
    category: "Street Food"
  },
  gyoza: {
    image: "/images/steamed-gyoza.jpg",
    description: "Hand-folded dumplings with vegetable or meat filling, served with soy dip.",
    category: "Starters"
  },
  curry: {
    image: "/images/curry.jpg",
    description: "Creamy curry with tender meat pieces, coconut milk, and aromatic spices.",
    category: "Mains"
  },
  bunthitxao: {
    image: "/images/bun-thit-xao.jpg",
    description: "Stir-fried noodles with tender meat, vegetables, and crispy roasted onions.",
    category: "Noodles"
  },
  friedgyoza: {
    image: "/images/fried-gyoza.jpg",
    description: "Crispy fried dumplings with spicy dipping sauce.",
    category: "Starters"
  },
  goicuon: {
    image: "/images/goi-cuon.jpg",
    description: "Fresh rice paper rolls with shrimps, herbs, and creamy peanut dip.",
    category: "Starters"
  }
};

// --- Components ---

function MicrosoftAIHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 font-semibold text-xl tracking-tight text-slate-900">
            {/* Microsoft Logo Grid */}
            <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
              <div className="bg-[#F25022]"></div>
              <div className="bg-[#7FBA00]"></div>
              <div className="bg-[#00A4EF]"></div>
              <div className="bg-[#FFB900]"></div>
            </div>
            <span>Nguyen AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-slate-600">
            <Link href="#" className="hover:text-slate-900 transition-colors">Copilot Menu</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Experience</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Solutions</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">About</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[14px] font-medium">
          <button className="hidden sm:flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
            <span>Sign in</span>
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
          </button>
        </div>
      </div>
    </header>
  );
}

function CopilotHero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Abstract Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-blue-200/30 via-purple-200/30 to-pink-200/30 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>

      <div className="max-w-[1000px] mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-xs uppercase tracking-wider">New</span>
          <span className="text-slate-600 text-sm">Introducing the Future of Dining</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
          Your everyday <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">culinary companion</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Experience Nguyen Restaurant. Where traditional Vietnamese flavors meet modern culinary intelligence.
        </p>

        {/* Copilot-style Input Box */}
        <div className="max-w-2xl mx-auto mt-12 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-100 blur transition duration-500"></div>
          <div className="relative bg-white rounded-2xl p-2 shadow-xl flex items-center gap-4">
            <div className="pl-4 text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Ask me about our Pho or recommend a starter..."
              className="w-full py-4 text-lg outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
            <button className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm text-slate-500">
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Try: "Spicy Noodle Soup"</span>
            <span className="cursor-pointer hover:text-purple-600 transition-colors">Try: "Vegetarian Options"</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoGrid() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Reimagining the Restaurant Experience</h2>
          <p className="text-slate-600 max-w-2xl">Discover how we blend tradition with innovation to create unforgettable moments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          {/* Large Card */}
          <div className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
            <Image
              src="/images/view-2.jpg"
              alt="Interior"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 text-xs font-semibold w-fit mb-4">
                Ambiance
              </div>
              <h3 className="text-3xl font-bold mb-2">A Space for Connection</h3>
              <p className="text-white/90 max-w-md">Designed for comfort and conversation. Our space adapts to your mood, from intimate dinners to lively gatherings.</p>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="relative group rounded-3xl overflow-hidden bg-[#FFF8F0] p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl mb-6">🌿</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fresh & Organic</h3>
              <p className="text-slate-600 text-sm">Sourced directly from local farmers and trusted partners.</p>
            </div>
            <div className="mt-4">
              <div className="h-1 w-12 bg-orange-400 rounded-full"></div>
            </div>
          </div>

          {/* Small Card 2 */}
          <div className="relative group rounded-3xl overflow-hidden bg-[#F0F4FF] p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-6">👨‍🍳</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Master Chefs</h3>
              <p className="text-slate-600 text-sm">Culinary artists with decades of experience in Vietnamese cuisine.</p>
            </div>
            <div className="mt-4">
              <div className="h-1 w-12 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuSection({ products, loading }: { products: Product[], loading: boolean }) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Curated Menu</h2>
            <p className="text-slate-600 max-w-xl">Explore our selection of dishes, crafted with precision and passion.</p>
          </div>
          <Link href="#" className="group flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            <span>View Full Menu</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const meta = productMeta[product.id.toLowerCase()];
              return (
                <div key={product.id} className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                    {meta?.image ? (
                      <Image
                        src={meta.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                        {meta?.category || "Special"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                      {meta?.description || "A delicious culinary experience waiting for you."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <span className="text-lg font-bold text-slate-900">
                        {(product.unit_amount / 100).toLocaleString("de-DE", { style: "currency", currency: product.currency })}
                      </span>
                      <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
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
  );
}

function Footer() {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 px-6 border-t border-gray-200">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold text-xl text-slate-900 mb-6">
              <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                <div className="bg-[#F25022]"></div>
                <div className="bg-[#7FBA00]"></div>
                <div className="bg-[#00A4EF]"></div>
                <div className="bg-[#FFB900]"></div>
              </div>
              <span>Nguyen AI</span>
            </div>
            <p className="text-slate-600 text-sm max-w-xs mb-6">
              Empowering your dining experience with authentic flavors and modern hospitality.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Menu</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 hover:underline">Starters</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Mains</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Drinks</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Specials</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 hover:underline">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Press</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Sustainability</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 hover:underline">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Customer Stories</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 hover:underline">Reservations</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Locations</a></li>
              <li><a href="#" className="hover:text-blue-600 hover:underline">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>🌍</span>
              <span>English (US)</span>
            </div>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Trademarks</span>
          </div>
          <div>
            <span>© Nguyen Restaurant 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
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
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <MicrosoftAIHeader />
      <main>
        <CopilotHero />
        <BentoGrid />
        <MenuSection products={products} loading={loading} />
      </main>
      <Footer />
    </div>
  );
}
