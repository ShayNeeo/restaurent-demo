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

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "LocalBusiness", "FoodEstablishment"],
  name: "NGUYEN Vietnam Restaurant",
  alternateName: "Nguyen Restaurant München",
  description: "Authentische vietnamesische Küche in München-Schwabing seit 1996. Familiengeführtes Restaurant mit frisch zubereiteten Gerichten.",
  image: [
    "https://nguyenrestaurant.de/images/view-1.jpg",
    "https://nguyenrestaurant.de/images/view-2.jpg",
    "https://nguyenrestaurant.de/images/view-3.jpg",
    "https://nguyenrestaurant.de/images/view-4.jpg",
    "https://nguyenrestaurant.de/images/pho-chay.jpg",
    "https://nguyenrestaurant.de/images/goi-cuon.jpg"
  ],
  url: "https://nguyenrestaurant.de",
  telephone: "+49 89 28803451",
  priceRange: "€€",
  servesCuisine: ["Vietnamese", "Asian Fusion", "Vegetarian Options"],
  acceptsReservations: "True",
  hasMenu: "https://nguyenrestaurant.de/menu",
  menu: "https://nguyenrestaurant.de/menu",
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
    "https://nguyenrestaurant.de",
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

function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const carouselImages = [
    { src: "/images/view-1.jpg", alt: "Restaurant View 1" },
    { src: "/images/view-2.jpg", alt: "Restaurant View 2" },
    { src: "/images/view-3.jpg", alt: "Restaurant View 3" },
    { src: "/images/view-4.jpg", alt: "Restaurant View 4" },
    { src: "/images/view-5.jpg", alt: "Restaurant View 5" }
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const getPrevIndex = () => (currentIndex - 1 + carouselImages.length) % carouselImages.length;
  const getNextIndex = () => (currentIndex + 1) % carouselImages.length;

  return (
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
              Unsere Speisen-Galerie
            </p>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-brand-dark space-y-4">
              <span className="block">Wir sind ein Kollektiv von</span>
              <span className="block text-brand">Köchinnen, Denkern und</span>
              <span className="block">Kreativen, die Geschmack gestalten,</span>
              <span className="block">Vertrauen verdienen und Momente veredeln.</span>
            </div>
            <p className="text-lg text-brand-dark/70 max-w-xl">
              Jede Komposition entsteht aus frischen Kräutern, aromatischen Brühen und saisonalen Zutaten,
              liebevoll arrangiert, um unsere Gäste zu berühren. Diese Galerie zeigt eine Auswahl unserer
              Lieblingskreationen – statisch festgehalten, doch voller lebendiger Geschichten.
            </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#speisekarte" className="btn-primary">
                    Speisekarte entdecken
                  </a>
                  <a 
                    href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-light"
                  >
                    Tisch reservieren
                  </a>
                </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative h-[520px] sm:h-[640px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-brand-light/80 to-brand-accent/30 blur-3xl" />
              
              {/* Carousel Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Left blurred image */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 opacity-40">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30">
                    <Image
                      src={carouselImages[getPrevIndex()].src}
                      alt={carouselImages[getPrevIndex()].alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Center main image */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-full cursor-pointer z-20">
                  <div 
                    className="relative w-full h-full rounded-[36px] overflow-hidden border-2 border-brand-light/40 shadow-2xl bg-brand-light/30 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl"
                    onClick={nextImage}
                  >
                    <Image
                      src={carouselImages[currentIndex].src}
                      alt={carouselImages[currentIndex].alt}
                      fill
                      className="object-cover transition-all duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <p className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-full">
                        Click to next
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right blurred image */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 opacity-40">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-lg blur-sm border border-brand-light/30">
                    <Image
                      src={carouselImages[getNextIndex()].src}
                      alt={carouselImages[getNextIndex()].alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      index === currentIndex
                        ? "bg-brand w-8"
                        : "bg-white/40 w-2.5 hover:bg-white/60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
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
          </ScrollReveal>
        </div>
      </div>
    </section>
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

  // Auto-advance carousel every 5 seconds
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
      <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/80 to-amber-100/60 blur-3xl" />
      
      {/* Carousel Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left blurred image - ANIMATED */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 z-10 pointer-events-none">
          {/* Current left image */}
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
          
          {/* Next left image */}
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

        {/* Center main image - SLIDING */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1/2 h-full z-20">
          {/* Current center image */}
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

          {/* Next center image coming in */}
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

        {/* Right blurred image - ANIMATED */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 z-10 pointer-events-none">
          {/* Current right image */}
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

          {/* Next right image */}
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

      {/* Navigation Dots with Auto-play indicator */}
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
                : "bg-white/40 w-2.5 hover:bg-white/60"
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

      {/* Navigation Arrows */}
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

export default function HomePage() {
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
        console.error("Fehler beim Laden der Produkte:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (amount: number, currency?: string) =>
    (amount / 100).toLocaleString("de-DE", {
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
      alt: "Frische Sommerrollen mit Kräutern auf einem Teller",
      style: { top: "0%", left: "5%", width: "32%", aspectRatio: "4 / 5" },
      zIndex: 5
    },
    {
      src: "/images/bo-kho-goi-cuon.jpg",
      alt: "Bò Kho in einer Schale mit Dip",
      style: { bottom: "-6%", left: "15%", width: "38%", aspectRatio: "5 / 6" },
      zIndex: 3
    },
    {
      src: "/images/fried-gyoza.jpg",
      alt: "Knusprige Gyoza in Gusseisenpfanne",
      style: { top: "10%", right: "-12%", width: "45%", aspectRatio: "3 / 2" },
      zIndex: 4
    },
    {
      src: "/images/bun-thit-xao.jpg",
      alt: "Bún Thịt Xào mit frischem Gemüse",
      style: { bottom: "-12%", right: "0%", width: "40%", aspectRatio: "4 / 5" },
      zIndex: 2
    },
    {
      src: "/images/curry.jpg",
      alt: "Duftender vietnamesischer Curry in Keramikschale",
      style: { top: "42%", left: "-10%", width: "36%", aspectRatio: "4 / 5" },
      zIndex: 1
    },
    {
      src: "/images/steamed-gyoza.jpg",
      alt: "Gedämpfte Gyoza mit Dip-Schälchen",
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
      <Script id="restaurant-schema-de" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(restaurantSchema)}
      </Script>
      <Script id="breadcrumb-schema-de" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Startseite",
              item: "https://nguyenrestaurant.de/"
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
                  Familiengeführt seit 1996
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-brand-dark leading-tight">
                NGUYEN<br /><span className="text-brand">Vietnam Restaurant</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-brand-dark/80 max-w-2xl mx-auto leading-relaxed font-light">
                Herzlich willkommen im Herzen von München-Schwabing. Erleben Sie die unverwechselbar leichte vietnamesische Küche in gastfreundlicher Atmosphäre mit aufmerksamen Service und frisch zubereiteten Köstlichkeiten.
              </p>


              <div className="flex gap-4 justify-center pt-8 flex-wrap">
                <a href="#speisekarte" className="btn-primary">
                  Speisekarte erkunden
                </a>
                <a 
                  href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-light"
                >
                  Tisch reservieren
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
                    Unsere Geschichte
                  </h2>
                  <p className="text-lg text-brand-dark/80 leading-relaxed">
                    Im NGUYEN bereiten wir unsere Speisen von Hand und mit größter Sorgfalt zu. Die vietnamesische Küche ist geprägt von Tradition und Leichtigkeit. Entdecken Sie eine Vielfalt an milden bis aromatisch-würzigen Gerichten und lassen Sie sich auf Wunsch einen Hauch vietnamesisches Feuer servieren.
                  </p>
                  <p className="text-lg text-brand-dark/80 leading-relaxed">
                    Reis begleitet uns in jeder Variation: als Reispapier, Reisnudeln oder duftender Jasminreis. Probieren Sie Pho Bò, Goi Cuon oder unser vegetarisches Bun – jede Spezialität erzählt eine Geschichte aus Saigon.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">1996</p>
                      <p className="text-sm text-brand-dark/70">Gründungsjahr</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">∞</p>
                      <p className="text-sm text-brand-dark/70">Familiengeführt</p>
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
                Was uns auszeichnet
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Qualität, Authentizität und Leidenschaft in jedem Gericht
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌿",
                  title: "Frische Zutaten",
                  description: "Wir wählen Zutaten täglich frisch aus und bereiten jedes Gericht unmittelbar zu. Ohne Kompromisse, mit viel Liebe."
                },
                {
                  icon: "👨‍🍳",
                  title: "Traditionelle Rezepte",
                  description: "Authentische Rezepte aus Saigon, zubereitet mit Leidenschaft und Erfahrung über Generationen hinweg."
                },
                {
                  icon: "🎭",
                  title: "Warme Atmosphäre",
                  description: "Warme Farben, sorgfältig arrangierte Details und ein Service, der aufmerksam und herzlich ist."
                }
              ].map((item, index) => (
                <ScrollReveal key={index}>
                  <div className="group rounded-2xl bg-brand-light p-8 shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
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
                Unsere <span className="text-brand-accent">Speisekarte</span>
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Sorgfältig ausgewählte Gerichte, die die Seele Vietnams einfangen
              </p>
            </ScrollReveal>

            {/* Show random selection info */}
            <ScrollReveal className="mb-16">
              <p className="text-center text-white/80 text-sm">
                Eine zufällige Auswahl unserer Spezialitäten
              </p>
            </ScrollReveal>

            {/* Products Grid - 4 rows x 3 columns = 12 spots (11 products + 1 view all card) */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-white/70">Produkte werden geladen...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => {
                  const meta = productMeta[product.id.toLowerCase()];
                  const imageUrl = product.image_url || meta?.image || "/images/view-4.jpg";
                  const category = product.category || meta?.category || "Gericht";
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
                {/* View All Menus Card - 12th spot */}
                <ScrollReveal>
                  <a
                    href="/menu"
                    className="group h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand/90 to-brand-dark/90 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 min-h-[400px]"
                  >
                    <div className="p-6 text-center text-white">
                      <div className="text-5xl mb-4">📋</div>
                      <h3 className="text-2xl font-display font-bold mb-3">
                        Alle Speisen
                      </h3>
                      <p className="text-sm leading-relaxed text-white/90 mb-6">
                        Entdecken Sie unsere vollständige Speisekarte mit allen Gerichten
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-brand-light/20 px-6 py-3 font-semibold text-white transition-all duration-300 group-hover:bg-brand-light/30 group-hover:scale-105">
                        <span>Alle anzeigen</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                </ScrollReveal>
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

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
            <div className="grid items-center gap-8 sm:gap-12 lg:gap-16 lg:grid-cols-[0.9fr,1.1fr]">
              <ScrollReveal className="space-y-8">
                <p className="text-xs uppercase tracking-[0.35rem] font-semibold text-brand/70">
                  Unsere Speisen-Galerie
                </p>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-brand-dark space-y-4">
                  <span className="block">Wir sind ein Kollektiv von</span>
                  <span className="block text-brand">Köchinnen, Denkern und</span>
                  <span className="block">Kreativen, die Geschmack gestalten,</span>
                  <span className="block">Vertrauen verdienen und Momente veredeln.</span>
                </div>
                <p className="text-lg text-brand-dark/70 max-w-xl">
                  Jede Komposition entsteht aus frischen Kräutern, aromatischen Brühen und saisonalen Zutaten,
                  liebevoll arrangiert, um unsere Gäste zu berühren. Diese Galerie zeigt eine Auswahl unserer
                  Lieblingskreationen – statisch festgehalten, doch voller lebendiger Geschichten.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#speisekarte" className="btn-primary">
                    Speisekarte entdecken
                  </a>
                  <a 
                    href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-light"
                  >
                    Tisch reservieren
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
                  <p>Wir sind eine Familie von</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>Köchen, Denkern und</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>leidenschaftlichen Menschen</p>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-brand-dark/80 leading-relaxed max-w-2xl mx-auto">
                die authentische Speisen zubereiten, die das Vertrauen verdienen, menschliches Potenzial entfalten und das Leben bedeutungsvoll bereichern.
              </p>

              <div className="flex gap-4 pt-4 flex-wrap justify-center">
                <a 
                  href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Jetzt Reservieren
                </a>
                <a 
                  href="#gallery"
                  className="btn-light"
                >
                  Galerie anschauen
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
                Unser Restaurant
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Atmosphäre, die Erinnerungen schafft – Buddhistische Klarheit und Idylle
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
        <section className="py-20 sm:py-32 bg-gradient-to-r from-amber-50 to-white">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark mb-4">
                Geschenk-Gutscheine
              </h2>
              <p className="text-lg text-brand-dark/70 max-w-xl mx-auto">
                Schenken Sie ein kulinarisches Abenteuer. Mit unseren Geschenk-Gutscheinen können Sie Ihre Liebsten zu einem unvergesslichen Gaumenfreude einladen.
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex justify-center">
              <a 
                href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen/gift-cards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-accent text-white px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Gutscheinkarte anschauen
              </a>
            </ScrollReveal>
          </div>
        </section>

        {/* Info & Hours Section */}
        <section className="py-20 sm:py-32 bg-amber-50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal>
                <div className="bg-brand-light rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Adresse</h3>
                  <p className="text-brand-dark/80 leading-relaxed">
                    Georgenstraße 67<br />
                    80799 München-Schwabing
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-brand-light rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Öffnungszeiten</h3>
                  <p className="text-sm text-brand-dark/80 space-y-2">
                    <span className="block"><strong>Mo–Fr & So:</strong> 12:00–15:00 & 17:30–22:30</span>
                    <span className="block"><strong>Sa:</strong> 17:30–22:30</span>
                    <span className="block text-xs text-brand-dark/70 pt-2">Warme Küche: Mo-Fr bis 21:00 Uhr</span>
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-gradient-to-br from-brand to-brand-accent rounded-2xl p-8 shadow-soft text-white">
                  <h3 className="text-2xl font-display font-bold mb-4">Reservierungen</h3>
                  <p className="text-lg font-semibold mb-3">089 28803451</p>
                  <a 
                    href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-brand-light text-brand font-bold rounded-full hover:bg-brand-accent/20 transition-colors duration-300"
                  >
                    Jetzt reservieren
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
                  Bereit für ein kulinarisches Abenteuer?
                </h2>
                <p className="text-lg text-white/90 max-w-xl mx-auto">
                  Reservieren Sie Ihren Tisch und erleben Sie die Magie authentischer vietnamesischer Küche in herzlicher Atmosphäre.
                </p>
                <div className="flex gap-4 justify-center pt-4 flex-wrap">
                  <a 
                    href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-amber-100 text-brand px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Reservieren
                  </a>
                  <a href="#speisekarte" className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-3 font-semibold hover:bg-white/10 transition-all duration-300">
                    Speisekarte anschauen
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

