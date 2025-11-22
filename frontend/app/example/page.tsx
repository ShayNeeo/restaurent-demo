"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import clsx from "clsx";

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
  tag?: string;
};

const productMeta: Record<string, ProductMeta> = {
  lobster: {
    image: "/images/bo-kho-goi-cuon.jpg",
    description: "Homemade pasta with lobster in aromatic bisque. A house signature dish.",
    category: "Signature",
    tag: "New Arrival"
  },
  pho: {
    image: "/images/pho-chay.jpg",
    description: "Aromatic rice noodle soup with fresh herbs, lime, and tender broth.",
    category: "Soups",
    tag: "Bestseller"
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

function MaiHeader() {
  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-brand-light/90 backdrop-blur-md rounded-full shadow-sm border border-stone-100 px-6 py-3 flex items-center justify-between w-full max-w-[1200px]">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <span className="text-xs font-medium text-stone-500 hidden sm:inline">Search</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="#" className="text-2xl font-serif tracking-widest text-mai-dark font-bold">NGUYEN</Link>
        </div>

        <nav className="flex items-center gap-6 text-xs font-medium text-stone-600">
          <Link href="#" className="hover:text-stone-900 transition-colors hidden md:block">About</Link>
          <Link href="#" className="hover:text-stone-900 transition-colors hidden md:block">Menu</Link>
          <Link href="#" className="hover:text-stone-900 transition-colors hidden md:block">Team</Link>
          <Link href="#" className="hover:text-stone-900 transition-colors">Reservations</Link>
        </nav>
      </div>
    </header>
  );
}

function MaiHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-32 overflow-hidden bg-mai-cream">
      {/* Shadow/Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-mai-peach/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-9xl font-display text-mai-dark leading-[0.9] tracking-tight"
        >
          <span className="italic font-light block mb-2">Approachable</span>
          <span className="block">Authenticity</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-mai-dark/70 max-w-2xl mx-auto font-light mt-8"
        >
          Responsible cuisine to empower humanity. <br />
          Experience the art of Vietnamese flavors in a modern setting.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mai-pill rounded-full text-xs font-mono uppercase tracking-wider text-stone-600">
            <span>off</span>
            <span>Accessibility Mode</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- Scroll Lock / Scrollytelling Section ---

const stories = [
  {
    id: 1,
    title: "The Vision",
    description: "We are a collective of builders, thinkers, and creators working to design technology that earns trust.",
    image: "/images/view-2.jpg",
    highlight: "chefs"
  },
  {
    id: 2,
    title: "The Craft",
    description: "Every dish is a story, told through the language of fresh ingredients and time-honored traditions.",
    image: "/images/view-1.jpg",
    highlight: "thinkers"
  },
  {
    id: 3,
    title: "The Community",
    description: "A space where flavors bring people together, creating moments that linger long after the meal ends.",
    image: "/images/view-3.jpg",
    highlight: "creators"
  }
];

function StickyScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-mai-cream">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6 grid lg:grid-cols-2 gap-20 items-center h-full">

          {/* Left Side: Dynamic Image */}
          <div className="relative h-[50vh] lg:h-[70vh] w-full rounded-sm overflow-hidden bg-stone-200">
            {stories.map((story, index) => {
              // Calculate opacity based on scroll progress
              // 0-0.33: Slide 1
              // 0.33-0.66: Slide 2
              // 0.66-1.0: Slide 3
              const start = index * 0.33;
              const end = start + 0.33;

              // We create a custom opacity transform for each image
              // It fades in when its 'turn' comes and fades out after
              const opacity = useTransform(
                smoothProgress,
                [start, start + 0.1, end - 0.1, end],
                [0, 1, 1, 0]
              );

              // Also add a slight scale effect
              const scale = useTransform(
                smoothProgress,
                [start, end],
                [1.1, 1]
              );

              // Ensure the first image is visible initially if needed (though the transform handles it)
              // We use absolute positioning to stack them
              return (
                <motion.div
                  key={story.id}
                  style={{ opacity, scale, zIndex: index }}
                  className="absolute inset-0"
                >
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Right Side: Text Content */}
          <div className="relative h-[50vh] flex items-center">
            {stories.map((story, index) => {
              const start = index * 0.33;
              const end = start + 0.33;

              const opacity = useTransform(
                smoothProgress,
                [start, start + 0.1, end - 0.1, end],
                [0, 1, 1, 0]
              );

              const y = useTransform(
                smoothProgress,
                [start, start + 0.1, end - 0.1, end],
                [50, 0, 0, -50]
              );

              return (
                <motion.div
                  key={story.id}
                  style={{ opacity, y }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-4">Nguyen Restaurant</div>
                  <h2 className="text-4xl md:text-5xl font-display text-mai-dark leading-tight mb-8">
                    {story.title === "The Vision" && (
                      <>We are a collective of <span className="italic text-mai-peach">chefs</span>, <span className="italic text-mai-peach">thinkers</span>, and <span className="italic text-mai-peach">creators</span>.</>
                    )}
                    {story.title === "The Craft" && (
                      <>Crafting <span className="italic text-mai-peach">authentic</span> flavors with <span className="italic text-mai-peach">modern</span> precision.</>
                    )}
                    {story.title === "The Community" && (
                      <>Building <span className="italic text-mai-peach">connections</span> through the shared language of <span className="italic text-mai-peach">food</span>.</>
                    )}
                  </h2>
                  <p className="text-lg text-stone-600 max-w-md mb-8">
                    {story.description}
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-mai-pill rounded-full text-sm font-medium text-mai-dark hover:bg-stone-200 transition-colors">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuGrid({ products, loading }: { products: Product[], loading: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Starters", "Mains", "Soups", "Noodles"];

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => productMeta[p.id.toLowerCase()]?.category === activeCategory || (activeCategory === "Mains" && productMeta[p.id.toLowerCase()]?.category === "Signature"));

  return (
    <section className="py-32 px-6 bg-mai-cream">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20 space-y-6">
          <h2 className="text-5xl md:text-7xl font-display text-mai-dark">Core products and <br /> <span className="italic">experiences</span></h2>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat
                  ? "bg-mai-dark text-white shadow-lg"
                  : "bg-mai-pill text-stone-600 hover:bg-stone-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-mai-dark border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => {
              const meta = productMeta[product.id.toLowerCase()];
              const isFeatured = idx === 0;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={product.id}
                  className={`group relative flex flex-col ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
                >
                  <div className={`relative w-full overflow-hidden rounded-sm bg-stone-100 ${isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                    {meta?.image ? (
                      <Image
                        src={meta.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-stone-300">No Image</div>
                    )}
                    {meta?.tag && (
                      <div className="absolute top-4 left-4 bg-brand-light/90 backdrop-blur px-3 py-1 text-xs font-mono uppercase tracking-wider text-mai-dark">
                        {meta.tag}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-display text-mai-dark ${isFeatured ? 'text-4xl' : 'text-2xl'}`}>
                        {product.name}
                      </h3>
                      <span className="font-mono text-sm text-stone-500">
                        {(product.unit_amount / 100).toLocaleString("de-DE", { style: "currency", currency: product.currency })}
                      </span>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed max-w-md">
                      {meta?.description || "A culinary masterpiece."}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StoriesSection() {
  return (
    <section className="py-32 px-6 bg-mai-cream border-t border-stone-200/50">
      <div className="max-w-[1000px] mx-auto text-center mb-20">
        <h2 className="text-4xl font-display text-mai-dark mb-4">Latest news</h2>
        <p className="text-2xl font-display italic text-stone-500">Stories. Updates. Perspectives.</p>
      </div>

      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16">
        <motion.div
          whileHover={{ y: -10 }}
          className="space-y-6 cursor-pointer group"
        >
          <div className="relative aspect-square bg-stone-100 overflow-hidden rounded-sm">
            <Image
              src="/images/view-1.jpg"
              alt="Story 1"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <h3 className="text-3xl font-display text-mai-dark group-hover:underline decoration-1 underline-offset-4">Towards Humanist Superintelligence in Dining</h3>
          <div className="flex items-center gap-4 text-xs font-mono text-stone-500 uppercase tracking-wider">
            <span className="bg-mai-pill px-2 py-1">Announcements</span>
            <span>20 min read</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -10 }}
          className="space-y-6 cursor-pointer group md:mt-32"
        >
          <div className="relative aspect-square bg-stone-100 overflow-hidden rounded-sm">
            <Image
              src="/images/view-3.jpg"
              alt="Story 2"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <h3 className="text-3xl font-display text-mai-dark group-hover:underline decoration-1 underline-offset-4">Fall Release: A big step forward in making Pho more personal.</h3>
          <div className="flex items-center gap-4 text-xs font-mono text-stone-500 uppercase tracking-wider">
            <span className="bg-mai-pill px-2 py-1">Menu Update</span>
            <span>5 min read</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SustainabilitySection() {
  return (
    <section className="py-32 px-6 bg-stone-100">
      <div className="max-w-[1000px] mx-auto text-center space-y-8">
        <div className="text-xs font-mono uppercase tracking-widest text-stone-500">Responsible Dining</div>
        <h2 className="text-4xl md:text-6xl font-display text-mai-dark leading-tight">
          We believe that <span className="italic text-mai-peach">sustainability</span> is not just a choice, but a <span className="italic text-mai-peach">responsibility</span>.
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          From sourcing local ingredients to minimizing waste, every decision we make is guided by our commitment to the planet and our community.
        </p>
        <div className="pt-8">
          <button className="px-8 py-3 border border-mai-dark rounded-full text-sm font-medium text-mai-dark hover:bg-mai-dark hover:text-white transition-all duration-300">
            Read our 2025 Impact Report
          </button>
        </div>
      </div>
    </section>
  );
}

function ReservationsSection() {
  return (
    <section className="py-32 px-6 bg-mai-cream border-t border-stone-200/50">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display text-mai-dark mb-4">Secure your table</h2>
          <p className="text-stone-600">Experience the future of dining. Reserve your spot today.</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Date</label>
                <input type="date" className="w-full p-3 bg-stone-50 border-b-2 border-stone-200 focus:border-mai-peach outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Guests</label>
                <select className="w-full p-3 bg-stone-50 border-b-2 border-stone-200 focus:border-mai-peach outline-none transition-colors">
                  <option>2 People</option>
                  <option>3 People</option>
                  <option>4 People</option>
                  <option>5+ People</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-500">Special Requests</label>
              <textarea rows={3} className="w-full p-3 bg-stone-50 border-b-2 border-stone-200 focus:border-mai-peach outline-none transition-colors" placeholder="Allergies, special occasions, etc."></textarea>
            </div>

            <button className="w-full py-4 bg-mai-dark text-white font-medium rounded-sm hover:bg-stone-800 transition-colors">
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function MaiFooter() {
  return (
    <footer className="bg-mai-cream pt-20 pb-10 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-32">
        <div className="col-span-2 md:col-span-1">
          <span className="text-2xl font-serif font-bold text-mai-dark block mb-8">NGUYEN</span>
        </div>

        <div className="space-y-4 text-sm font-mono text-stone-600">
          <a href="#" className="block hover:text-mai-dark">About</a>
          <a href="#" className="block hover:text-mai-dark">News</a>
          <a href="#" className="block hover:text-mai-dark">Team</a>
          <a href="#" className="block hover:text-mai-dark">Careers</a>
        </div>

        <div className="space-y-4 text-sm font-mono text-stone-600">
          <a href="#" className="block hover:text-mai-dark">LinkedIn</a>
          <a href="#" className="block hover:text-mai-dark">Instagram</a>
          <a href="#" className="block hover:text-mai-dark">X</a>
        </div>

        <div className="space-y-4 text-sm font-mono text-stone-600">
          <a href="#" className="block hover:text-mai-dark">Contact</a>
          <a href="#" className="block hover:text-mai-dark">Privacy & Cookies</a>
          <a href="#" className="block hover:text-mai-dark">Terms</a>
          <a href="#" className="block hover:text-mai-dark">Trademarks</a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex justify-between items-end text-xs font-mono text-stone-400 uppercase tracking-wider">
        <div>© Nguyen Restaurant 2025</div>
        <div className="max-w-xs text-right hidden md:block">
          This site runs Nguyen Clarity for behavioral insights. By using this site, you consent to the collection and use of your data.
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
    <div className="min-h-screen bg-mai-cream font-sans text-mai-dark selection:bg-mai-peach selection:text-white">
      <MaiHeader />
      <main>
        <MaiHero />
        <StickyScrollSection />
        <SustainabilitySection />
        <MenuGrid products={products} loading={loading} />
        <ReservationsSection />
        <StoriesSection />
      </main>
      <MaiFooter />
    </div>
  );
}
