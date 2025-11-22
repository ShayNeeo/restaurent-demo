"use client";

import { useEffect, useState, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Script from "next/script";
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
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
};

type ProductMeta = {
  image: string;
  description: string;
  category: string;
};

const productMeta: Record<string, ProductMeta> = {
  lobster: {
    image: "/images/bo-kho-goi-cuon.jpg",
    description: "House-made pasta with lobster in aromatic bisque. A signature house dish.",
    category: "Specialties"
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
    category: "Appetizers"
  },
  curry: {
    image: "/images/curry.jpg",
    description: "Creamy curry with tender meat pieces, coconut milk, and aromatic spices.",
    category: "Main Courses"
  },
  bunthitxao: {
    image: "/images/bun-thit-xao.jpg",
    description: "Stir-fried noodles with tender meat, vegetables, and crispy fried onions.",
    category: "Noodle Dishes"
  },
  friedgyoza: {
    image: "/images/fried-gyoza.jpg",
    description: "Crispy fried dumplings with spicy dipping sauce.",
    category: "Appetizers"
  },
  goicuon: {
    image: "/images/goi-cuon.jpg",
    description: "Fresh rice paper rolls with shrimp, herbs, and creamy peanut dip.",
    category: "Appetizers"
  }
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "LocalBusiness", "FoodEstablishment"],
  name: "NGUYEN Vietnam Restaurant",
  alternateName: "Nguyen Restaurant Munich",
  description: "Authentic Vietnamese cuisine in Munich-Schwabing since 1996. Family-run restaurant with freshly prepared dishes.",
  image: [
    "https://nguyenrestaurant.de/images/view-1.jpg",
    "https://nguyenrestaurant.de/images/view-2.jpg",
    "https://nguyenrestaurant.de/images/view-3.jpg",
    "https://nguyenrestaurant.de/images/view-4.jpg",
    "https://nguyenrestaurant.de/images/pho-chay.jpg",
    "https://nguyenrestaurant.de/images/goi-cuon.jpg"
  ],
  url: "https://nguyenrestaurant.de/en",
  telephone: "+49 89 28803451",
  priceRange: "€€",
  servesCuisine: ["Vietnamese", "Asian Fusion", "Vegetarian Options"],
  acceptsReservations: "True",
  hasMenu: "https://nguyenrestaurant.de/en/menu",
  menu: "https://nguyenrestaurant.de/en/menu",
  availableLanguage: [
    { "@type": "Language", name: "Deutsch" },
    { "@type": "Language", name: "English" },
    { "@type": "Language", name: "Tiếng Việt" }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Georgenstraße 67",
    addressLocality: "München",
    addressRegion: "Bayern",
    postalCode: "80799",
    addressCountry: "DE"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.1598,
    longitude: 11.5812
  },
  areaServed: {
    "@type": "City",
    name: "München"
  },
  foundingDate: "1996",
  sameAs: [
    "https://nguyenrestaurant.de/en",
    "https://www.google.com/maps/place/Nguyen+Vietnam+Restaurant"
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "12:00",
      closes: "22:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "17:30",
      closes: "22:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "12:00",
      closes: "22:30"
    }
  ],
  paymentAccepted: "Cash, Credit Card, PayPal",
  currenciesAccepted: "EUR"
};

function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CarouselStory() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  
  const carouselImages = [
    { src: "/images/view-1.jpg", alt: "Restaurant View 1" },
    { src: "/images/view-2.jpg", alt: "Restaurant View 2" },
    { src: "/images/view-3.jpg", alt: "Restaurant View 3" },
    { src: "/images/view-4.jpg", alt: "Restaurant View 4" },
    { src: "/images/view-5.jpg", alt: "Restaurant View 5" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
        setSlideDirection(null);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      setSlideDirection(null);
    }, 500);
  };

  const prevImage = () => {
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      setSlideDirection(null);
    }, 500);
  };

  const getPrevIndex = () => (currentIndex - 1 + carouselImages.length) % carouselImages.length;
  const getNextIndex = () => (currentIndex + 1) % carouselImages.length;

  return (
    <div className="relative h-96 flex items-center justify-center w-full">
      <style>{`
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%);
            opacity: 0;
          }
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(50%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(50%);
            opacity: 0;
          }
        }
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOutLeft {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOutRight {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .slide-out-left {
          animation: slideOutLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .slide-in-from-right {
          animation: slideInFromRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .slide-out-right {
          animation: slideOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .slide-in-from-left {
          animation: slideInFromLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-out-left {
          animation: fadeOutLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-in-left {
          animation: fadeInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-out-right {
          animation: fadeOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-in-right {
          animation: fadeInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-brand-light/80 to-brand-accent/30 blur-3xl" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 z-10 pointer-events-none">
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-out-left' : 'fade-out-right') : ''
          }`}>
            <Image
              src={carouselImages[getPrevIndex()].src}
              alt={carouselImages[getPrevIndex()].alt}
              fill
              className="object-cover"
            />
          </div>
          
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-in-left' : 'fade-in-right') : 'opacity-0'
          }`}>
            <Image
              src={carouselImages[slideDirection === 'left' ? currentIndex : (getPrevIndex() - 1 + carouselImages.length) % carouselImages.length].src}
              alt={carouselImages[slideDirection === 'left' ? currentIndex : (getPrevIndex() - 1 + carouselImages.length) % carouselImages.length].alt}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1/2 h-full z-20">
          <div 
            className={`absolute inset-0 cursor-pointer rounded-[36px] overflow-hidden border-2 border-brand-light/40 shadow-2xl bg-brand-light/30 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300 ${
              slideDirection === 'left' ? 'slide-out-left' : slideDirection === 'right' ? 'slide-out-right' : ''
            }`}
            onClick={nextImage}
          >
            <Image
              src={carouselImages[currentIndex].src}
              alt={carouselImages[currentIndex].alt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <p className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-full">
                Click to next
              </p>
            </div>
          </div>

          {slideDirection && (
            <div 
              className={`absolute inset-0 rounded-[36px] overflow-hidden border-2 border-brand-light/40 shadow-2xl bg-brand-light/30 backdrop-blur-sm ${
                slideDirection === 'left' ? 'slide-in-from-right' : 'slide-in-from-left'
              }`}
            >
              <Image
                src={carouselImages[slideDirection === 'left' ? getNextIndex() : getPrevIndex()].src}
                alt={carouselImages[slideDirection === 'left' ? getNextIndex() : getPrevIndex()].alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 z-10 pointer-events-none">
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-out-right' : 'fade-out-left') : ''
          }`}>
            <Image
              src={carouselImages[getNextIndex()].src}
              alt={carouselImages[getNextIndex()].alt}
              fill
              className="object-cover"
            />
          </div>

          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-in-right' : 'fade-in-left') : 'opacity-0'
          }`}>
            <Image
              src={carouselImages[slideDirection === 'left' ? (getNextIndex() + 1) % carouselImages.length : (getNextIndex() - 1 + carouselImages.length) % carouselImages.length].src}
              alt={carouselImages[slideDirection === 'left' ? (getNextIndex() + 1) % carouselImages.length : (getNextIndex() - 1 + carouselImages.length) % carouselImages.length].alt}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index > currentIndex) {
                setSlideDirection('left');
              } else if (index < currentIndex) {
                setSlideDirection('right');
              }
              setTimeout(() => {
                setCurrentIndex(index);
                setSlideDirection(null);
              }, 500);
            }}
            className={`h-2.5 rounded-full transition-all duration-500 relative ${
              index === currentIndex
                ? "bg-brand w-8 shadow-lg"
                : "bg-brand-light/40 w-2.5 hover:bg-brand-light/60"
            }`}
            aria-label={`Go to image ${index + 1}`}
          >
            {index === currentIndex && (
              <style>{`
                @keyframes progress-bar {
                  from { width: 100%; }
                  to { width: 0; }
                }
                .progress-indicator {
                  animation: progress-bar 5s linear infinite;
                }
              `}</style>
            )}
            {index === currentIndex && (
              <div className="absolute inset-0 bg-brand/30 rounded-full progress-indicator" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-brand/80 hover:bg-brand text-white shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-brand/80 hover:bg-brand text-white shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function GalleryImages({ images }: { images: typeof galleryImages }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getSafePosition = (val: string | number | undefined): string | number | undefined => {
    if (!isMobile) return val;
    if (typeof val === 'string' && val.endsWith('%')) {
      const num = parseFloat(val);
      return num < 0 ? '2%' : val;
    }
    return val;
  };

  return (
    <div className="relative h-[400px] sm:h-[520px] lg:h-[640px] px-4 sm:px-0">
      <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-brand-light/80 to-brand-accent/30 blur-3xl" />
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className="group absolute overflow-hidden rounded-[36px] border border-brand-light/40 bg-brand-light/30 shadow-2xl backdrop-blur-sm transition-transform duration-700 ease-out hover:-translate-y-2 hover:rotate-[1deg]"
          style={{
            ...image.style,
            left: getSafePosition(image.style.left),
            right: getSafePosition(image.style.right),
            top: getSafePosition(image.style.top),
            bottom: getSafePosition(image.style.bottom),
            zIndex: image.zIndex,
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 60vw, (max-width: 1200px) 35vw, 30vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

export default function EnglishHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const response = await fetch(`${backendUrl}/api/products`);
        if (response.ok) {
          const data = (await response.json()) as ProductsResponse;
          // Shuffle and take 11 random products for homepage
          const shuffled = [...data.products].sort(() => Math.random() - 0.5);
          setProducts(shuffled.slice(0, 11));
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (amount: number, currency?: string) =>
    (amount / 100).toLocaleString("en-US", {
      style: "currency",
      currency: currency ?? "EUR"
    });

  const galleryImages: Array<{
    src: string;
    alt: string;
    style: CSSProperties;
    zIndex: number;
  }> = [
    {
      src: "/images/goi-cuon.jpg",
      alt: "Fresh summer rolls with herbs on a plate",
      style: { top: "0%", left: "5%", width: "32%", aspectRatio: "4 / 5" },
      zIndex: 5
    },
    {
      src: "/images/bo-kho-goi-cuon.jpg",
      alt: "Bò Kho in a bowl with dip",
      style: { bottom: "-6%", left: "15%", width: "38%", aspectRatio: "5 / 6" },
      zIndex: 3
    },
    {
      src: "/images/fried-gyoza.jpg",
      alt: "Crispy gyoza in cast iron pan",
      style: { top: "10%", right: "-12%", width: "45%", aspectRatio: "3 / 2" },
      zIndex: 4
    },
    {
      src: "/images/bun-thit-xao.jpg",
      alt: "Bún Thịt Xào with fresh vegetables",
      style: { bottom: "-12%", right: "0%", width: "40%", aspectRatio: "4 / 5" },
      zIndex: 2
    },
    {
      src: "/images/curry.jpg",
      alt: "Fragrant Vietnamese curry in ceramic bowl",
      style: { top: "42%", left: "-10%", width: "36%", aspectRatio: "4 / 5" },
      zIndex: 1
    },
    {
      src: "/images/steamed-gyoza.jpg",
      alt: "Steamed gyoza with dipping bowl",
      style: { top: "-18%", right: "15%", width: "28%", aspectRatio: "3 / 4" },
      zIndex: 6
    }
  ];

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
      `}</style>
      <Script id="restaurant-schema-en" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(restaurantSchema)}
      </Script>
      <Script id="breadcrumb-schema-en" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://nguyenrestaurant.de/en"
            }
          ]
        })}
      </Script>

      <NavBar />
      <main className="flex min-h-screen flex-col bg-brand-light">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand-accent/10 pointer-events-none" />
          
          <ScrollReveal className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-xs uppercase tracking-widest font-semibold text-brand/70 font-sans">
                  Family-owned since 1996
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-brand-dark leading-tight">
                NGUYEN<br /><span className="text-brand">Vietnam Restaurant</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-brand-dark/80 max-w-2xl mx-auto leading-relaxed font-light">
                Welcome to the heart of Munich-Schwabing. Experience authentic Vietnamese cuisine in a friendly atmosphere with attentive service and freshly prepared delicacies.
              </p>

              <div className="flex gap-4 justify-center pt-8 flex-wrap">
                <a href="#speisekarte" className="btn-primary">
                  Explore Menu
                </a>
                <a href="tel:+498928803451" className="btn-light">
                  089 28803451
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Story Section */}
        <section className="py-20 sm:py-32 bg-brand-light">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark">
                    Our Story
                  </h2>
                  <p className="text-lg text-brand-dark/80 leading-relaxed">
                    At NGUYEN, we prepare our dishes by hand with the utmost care. Vietnamese cuisine is characterized by tradition and lightness. Discover a variety of mild to aromatic-spicy dishes and let us serve you a touch of Vietnamese fire if you wish.
                  </p>
                  <p className="text-lg text-brand-dark/80 leading-relaxed">
                    Rice accompanies us in every variation: as rice paper, rice noodles, or fragrant jasmine rice. Try Pho Bò, Goi Cuon, or our vegetarian Bun – each specialty tells a story from Saigon.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">1996</p>
                      <p className="text-sm text-brand-dark/70">Founded</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">∞</p>
                      <p className="text-sm text-brand-dark/70">Family-run</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal>
                <CarouselStory />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* What Makes Us Special */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                What Makes Us Special
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Quality, authenticity, and passion in every dish
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌿",
                  title: "Fresh Ingredients",
                  description: "We source fresh ingredients daily and prepare each dish immediately. No compromises, with lots of love."
                },
                {
                  icon: "👨‍🍳",
                  title: "Traditional Recipes",
                  description: "Authentic recipes from Saigon, prepared with passion and experience passed down through generations."
                },
                {
                  icon: "🎭",
                  title: "Warm Atmosphere",
                  description: "Warm colors, carefully arranged details, and service that is attentive and hospitable."
                }
              ].map((item, index) => (
                <ScrollReveal key={index}>
                  <div className="group rounded-2xl bg-white p-8 shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold text-brand-dark mb-3">{item.title}</h3>
                    <p className="text-brand-dark/70 leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Preview Section */}
        <section id="speisekarte" className="py-20 sm:py-32 bg-gradient-to-r from-brand/90 to-brand-dark/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-brand-light/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-brand-light/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-6 relative z-10">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                Our <span className="text-brand-accent/20">Menu</span>
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Carefully selected dishes that capture the soul of Vietnam
              </p>
            </ScrollReveal>

            {/* Show random selection info */}
            <ScrollReveal className="mb-16">
              <p className="text-center text-white/80 text-sm">
                A random selection of our specialties
              </p>
            </ScrollReveal>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-white/70">Loading products...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const meta = productMeta[product.id.toLowerCase()];
                  const imageUrl = product.image_url || meta?.image || "/images/view-4.jpg";
                  const category = product.category || meta?.category || "Dish";
                  const description = product.description || meta?.description || "";
                  return (
                    <ScrollReveal key={product.id}>
                      <div className="group h-full overflow-hidden rounded-2xl bg-brand-light/95 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        {/* Image */}
                        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-brand-accent/20 to-brand-light">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <p className="text-xs font-bold uppercase tracking-widest text-brand/60 mb-2">
                            {category}
                          </p>
                          <h3 className="text-xl font-display font-bold text-brand-dark mb-3">
                            {product.name}
                          </h3>
                          {description && (
                            <p className="text-sm leading-relaxed text-brand-dark/70 mb-4">
                              {description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-brand-accent/20">
                            <span className="text-2xl font-bold text-brand">
                              {formatPrice(product.unit_amount, product.currency)}
                            </span>
                            <button className="rounded-full bg-gradient-to-r from-brand to-brand-accent px-5 py-2 font-semibold text-white shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
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

        {/* Food Showcase Gallery */}
        <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-brand-light via-brand-accent/10 to-brand-light">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-12 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
            <div className="absolute top-1/2 left-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-[0.9fr,1.1fr]">
              <ScrollReveal className="space-y-8">
                <p className="text-xs uppercase tracking-[0.35rem] font-semibold text-brand/70">
                  Our Food Gallery
                </p>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-brand-dark space-y-4">
                  <span className="block">We are a collective of</span>
                  <span className="block text-brand">chefs, thinkers and</span>
                  <span className="block">creatives who shape taste,</span>
                  <span className="block">earn trust and refine moments.</span>
                </div>
                <p className="text-lg text-brand-dark/70 max-w-xl">
                  Each composition is created from fresh herbs, aromatic broths and seasonal ingredients,
                  lovingly arranged to touch our guests. This gallery shows a selection of our
                  favorite creations – captured statically, yet full of living stories.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#speisekarte" className="btn-primary">
                    Discover Menu
                  </a>
                  <a 
                    href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-light"
                  >
                    Reserve Table
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <GalleryImages images={galleryImages} />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 sm:py-32 bg-brand-light">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal className="text-center space-y-8">
              <div className="text-5xl sm:text-6xl font-display font-bold leading-tight text-brand-dark">
                <div className="overflow-hidden mb-4">
                  <p>We are a family of</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>chefs, thinkers and</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>passionate people</p>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-brand-dark/80 leading-relaxed max-w-2xl mx-auto">
                who prepare authentic dishes that deserve trust, unfold human potential, and meaningfully enrich life.
              </p>

              <div className="flex gap-4 pt-4 flex-wrap justify-center">
                <a 
                  href="tel:+498928803451"
                  className="btn-primary"
                >
                  Book Now
                </a>
                <a 
                  href="#gallery"
                  className="btn-light"
                >
                  View Gallery
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Restaurant Gallery */}
        <section id="gallery" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                Our Restaurant
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Atmosphere that creates memories – Buddhist serenity and idyll
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <ScrollReveal key={index}>
                  <div className="group relative h-64 lg:h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-accent/30 to-brand-accent/20 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
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

        {/* Gift Cards Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-r from-brand-accent/10 to-white">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                Gift Cards
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Give a culinary adventure. With our gift cards, you can invite your loved ones to an unforgettable gastronomic experience.
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex justify-center">
              <a 
                href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen/gift-cards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-accent text-white px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                View Gift Cards
              </a>
            </ScrollReveal>
          </div>
        </section>

        {/* Info & Hours Section */}
        <section className="py-20 sm:py-32 bg-brand-accent/10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal>
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Address</h3>
                  <p className="text-brand-dark/80 leading-relaxed">
                    Georgenstraße 67<br />
                    80799 Munich-Schwabing
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Opening Hours</h3>
                  <p className="text-sm text-brand-dark/80 space-y-2">
                    <span className="block"><strong>Mon–Fri & Sun:</strong> 12:00–15:00 & 17:30–22:30</span>
                    <span className="block"><strong>Sat:</strong> 17:30–22:30</span>
                    <span className="block text-xs text-brand-dark/70 pt-2">Warm kitchen: Mon-Fri until 21:00</span>
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-gradient-to-br from-brand to-brand-accent rounded-2xl p-8 shadow-soft text-white">
                  <h3 className="text-2xl font-display font-bold mb-4">Reservations</h3>
                  <p className="text-lg font-semibold mb-3">089 28803451</p>
                  <a href="tel:+498928803451" className="inline-block px-6 py-2 bg-white text-brand font-bold rounded-full hover:bg-brand-accent/20 transition-colors duration-300">
                    Call Now
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-br from-brand/95 to-brand-dark/95 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <div className="space-y-8">
                <h2 className="text-4xl sm:text-5xl font-display font-bold">
                  Ready for a culinary adventure?
                </h2>
                <p className="text-lg text-white/90 max-w-xl mx-auto">
                  Reserve your table and experience the magic of authentic Vietnamese cuisine in a warm and welcoming atmosphere.
                </p>
                <div className="flex gap-4 justify-center pt-4 flex-wrap">
                  <a href="tel:+498928803451" className="inline-flex items-center justify-center rounded-full bg-brand-accent/20 text-brand px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Reserve
                  </a>
                  <a href="#speisekarte" className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-3 font-semibold hover:bg-brand-light/10 transition-all duration-300">
                    View Menu
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
