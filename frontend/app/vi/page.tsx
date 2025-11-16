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
};

type ProductMeta = {
  image: string;
  description: string;
  category: string;
};

const productMeta: Record<string, ProductMeta> = {
  lobster: {
    image: "/images/bo-kho-goi-cuon.jpg",
    description: "Mì nhà làm với tôm hùm trong nước sốt vị cua thơm ngon. Đặc sản nhà hàng.",
    category: "Đặc sản"
  },
  pho: {
    image: "/images/pho-chay.jpg",
    description: "Canh mì gạo thơm lừng với rau thơm tươi, chanh và nước dùng thanh.",
    category: "Canh"
  },
  bao: {
    image: "/images/khai-vi-starter.jpg",
    description: "Bánh bao mềm mặn nhân thịt hoặc đậu phụ, ướp trong nước sốt hoisin.",
    category: "Đồ ăn vỉa hè"
  },
  gyoza: {
    image: "/images/steamed-gyoza.jpg",
    description: "Bánh hoàng yến gói tay với nhân rau hoặc thịt, kèm nước tương.",
    category: "Khai vị"
  },
  curry: {
    image: "/images/curry.jpg",
    description: "Cà ri béo creamy với thịt mềm, nước cà chua dừa và gia vị thơm.",
    category: "Món chính"
  },
  bunthitxao: {
    image: "/images/bun-thit-xao.jpg",
    description: "Mì xào tươi với thịt mềm, rau tươi và hành nâu giòn.",
    category: "Các món mì"
  },
  friedgyoza: {
    image: "/images/fried-gyoza.jpg",
    description: "Bánh hoàng yến chiên giòn với nước sốt cay.",
    category: "Khai vị"
  },
  goicuon: {
    image: "/images/goi-cuon.jpg",
    description: "Cuốn tươi bánh tráng với tôm, rau thơm và nước sốt đậu phộng.",
    category: "Khai vị"
  }
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Nhà hàng Nguyễn",
  image: [
    "https://nguyenrestaurant.de/images/view-1.jpg",
    "https://nguyenrestaurant.de/images/goi-cuon.jpg"
  ],
  url: "https://nguyenrestaurant.de/vi",
  telephone: "+49 89 28803451",
  priceRange: "€€",
  servesCuisine: ["Vietnamese", "Asian Fusion", "Vegetarian Options"],
  acceptsReservations: "Yes",
  hasMenu: "https://nguyenrestaurant.de/vi/menu",
  availableLanguage: [
    { "@type": "Language", name: "Deutsch" },
    { "@type": "Language", name: "English" },
    { "@type": "Language", name: "Tiếng Việt" }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Georgenstraße 67",
    addressLocality: "München",
    postalCode: "80799",
    addressCountry: "DE"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "48.1598",
    longitude: "11.5812"
  },
  sameAs: [
    "https://nguyenrestaurant.de/vi",
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
  ]
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
    { src: "/images/view-1.jpg", alt: "Nhà hàng View 1" },
    { src: "/images/view-2.jpg", alt: "Nhà hàng View 2" },
    { src: "/images/view-3.jpg", alt: "Nhà hàng View 3" },
    { src: "/images/view-4.jpg", alt: "Nhà hàng View 4" },
    { src: "/images/view-5.jpg", alt: "Nhà hàng View 5" }
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
      <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/80 to-amber-100/60 blur-3xl" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-2/3 z-10 pointer-events-none">
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-white/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-out-left' : 'fade-out-right') : ''
          }`}>
            <Image
              src={carouselImages[getPrevIndex()].src}
              alt={carouselImages[getPrevIndex()].alt}
              fill
              className="object-cover"
            />
          </div>
          
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-white/30 ${
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
            className={`absolute inset-0 cursor-pointer rounded-[36px] overflow-hidden border-2 border-white/40 shadow-2xl bg-white/30 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300 ${
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
                Nhấp để xem tiếp
              </p>
            </div>
          </div>

          {slideDirection && (
            <div 
              className={`absolute inset-0 rounded-[36px] overflow-hidden border-2 border-white/40 shadow-2xl bg-white/30 backdrop-blur-sm ${
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
          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-white/30 ${
            slideDirection ? (slideDirection === 'left' ? 'fade-out-right' : 'fade-out-left') : ''
          }`}>
            <Image
              src={carouselImages[getNextIndex()].src}
              alt={carouselImages[getNextIndex()].alt}
              fill
              className="object-cover"
            />
          </div>

          <div className={`absolute inset-0 rounded-[24px] overflow-hidden shadow-lg blur-sm border border-white/30 ${
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
                : "bg-white/40 w-2.5 hover:bg-white/60"
            }`}
            aria-label={`Đi tới ảnh ${index + 1}`}
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
        aria-label="Ảnh trước"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-brand/80 hover:bg-brand text-white shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Ảnh tiếp"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function VietnameseHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");

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
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(products.map((p: Product) => productMeta[p.id.toLowerCase()]?.category || "Khác")))];

  const filteredProducts =
    activeCategory === "Tất cả"
      ? products
      : products.filter((p: Product) => productMeta[p.id.toLowerCase()]?.category === activeCategory);

  const formatPrice = (amount: number, currency?: string) =>
    (amount / 100).toLocaleString("vi-VN", {
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
      alt: "Cuốn tươi với rau thơm trên đĩa",
      style: { top: "0%", left: "5%", width: "32%", aspectRatio: "4 / 5" },
      zIndex: 5
    },
    {
      src: "/images/bo-kho-goi-cuon.jpg",
      alt: "Bò Kho trong tô với nước chấm",
      style: { bottom: "-6%", left: "15%", width: "38%", aspectRatio: "5 / 6" },
      zIndex: 3
    },
    {
      src: "/images/fried-gyoza.jpg",
      alt: "Bánh hoàng yến chiên trong chảo gang",
      style: { top: "10%", right: "-12%", width: "45%", aspectRatio: "3 / 2" },
      zIndex: 4
    },
    {
      src: "/images/bun-thit-xao.jpg",
      alt: "Bún Thịt Xào với rau tươi",
      style: { bottom: "-12%", right: "0%", width: "40%", aspectRatio: "4 / 5" },
      zIndex: 2
    },
    {
      src: "/images/curry.jpg",
      alt: "Cà ri Việt thơm ngon trong tô gốm",
      style: { top: "42%", left: "-10%", width: "36%", aspectRatio: "4 / 5" },
      zIndex: 1
    },
    {
      src: "/images/steamed-gyoza.jpg",
      alt: "Bánh hoàng yến hấp với bát nước chấm",
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
      <Script id="restaurant-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(restaurantSchema)}
      </Script>

      <NavBar />
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-white to-amber-50">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-amber-200/10 pointer-events-none" />
          
          <ScrollReveal className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-xs uppercase tracking-widest font-semibold text-brand/70 font-sans">
                  Gia đình thừa kế từ 1996
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-brand-dark leading-tight">
                NGUYỄN<br /><span className="text-brand">Nhà hàng Việt Nam</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-light">
                Chào mừng đến trung tâm quận Schwabing, München. Thưởng thức ẩm thực Việt Nam chính hiệu trong không gian thân thiện với dịch vụ chu đáo và những món ăn tươi ngon.
              </p>

              <div className="flex gap-4 justify-center pt-8 flex-wrap">
                <a href="#speisekarte" className="btn-primary">
                  Khám phá thực đơn
                </a>
                <a href="tel:+498928803451" className="btn-light">
                  089 28803451
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Story Section */}
        <section className="py-20 sm:py-32 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-brand-dark">
                    Câu chuyện của chúng tôi
                  </h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Tại NGUYỄN, chúng tôi nấu ăn bằng tay với tình yêu và chăm sóc tối đa. Ẩm thực Việt Nam được đặc trưng bởi truyền thống và sự nhẹ nhàng. Khám phá vô vàn những món ăn từ nhẹ đến cay nồn và cho phép chúng tôi phục vụ bạn một chút lửa Việt nếu muốn.
                  </p>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Cơm đồng hành với chúng tôi trong mọi hình thức: bánh tráng, mì gạo hoặc cơm hương lài thơm ngon. Hãy thử Phở Bò, Gỏi Cuốn hay Bún chay của chúng tôi – mỗi món đặc sản kể một câu chuyện từ Sài Gòn.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">1996</p>
                      <p className="text-sm text-slate-600">Năm thành lập</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-brand">∞</p>
                      <p className="text-sm text-slate-600">Gia đình thừa kế</p>
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
                Điều gì làm nên chúng tôi đặc biệt
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Chất lượng, tính xác thực và đam mê trong mỗi món ăn
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌿",
                  title: "Nguyên liệu tươi",
                  description: "Chúng tôi lựa chọn nguyên liệu tươi hàng ngày và nấu mỗi món ăn ngay lập tức. Không có lợp mặt, chỉ có tình yêu."
                },
                {
                  icon: "👨‍🍳",
                  title: "Công thức truyền thống",
                  description: "Các công thức xác thực từ Sài Gòn, nấu với đam mê và kinh nghiệm qua các thế hệ."
                },
                {
                  icon: "🎭",
                  title: "Không gian ấm áp",
                  description: "Màu sắc ấm áp, chi tiết được sắp xếp cẩn thận và dịch vụ chu đáo, thân thiện."
                }
              ].map((item, index) => (
                <ScrollReveal key={index}>
                  <div className="group rounded-2xl bg-white p-8 shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold text-brand-dark mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Preview Section */}
        <section id="speisekarte" className="py-20 sm:py-32 bg-gradient-to-r from-brand/90 to-brand-dark/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-6 relative z-10">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
                <span className="text-amber-100">Thực đơn</span> của chúng tôi
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Những món ăn được lựa chọn cẩn thận, nắm bắt tâm hồn Việt Nam
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
                        ? "bg-amber-100 text-brand shadow-lg scale-105"
                        : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
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
                <p className="text-white/70">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const meta = productMeta[product.id.toLowerCase()];
                  return (
                    <ScrollReveal key={product.id}>
                      <div className="group h-full overflow-hidden rounded-2xl bg-white/95 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        {/* Image */}
                        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50">
                          {meta?.image && (
                            <Image
                              src={meta.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <p className="text-xs font-bold uppercase tracking-widest text-brand/60 mb-2">
                            {meta?.category || "Món ăn"}
                          </p>
                          <h3 className="text-xl font-display font-bold text-brand-dark mb-3">
                            {product.name}
                          </h3>
                          <p className="text-sm leading-relaxed text-slate-600 mb-4">
                            {meta?.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-amber-100">
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

        {/* Mission Statement */}
        <section className="py-20 sm:py-32 bg-white">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal className="text-center space-y-8">
              <div className="text-5xl sm:text-6xl font-display font-bold leading-tight text-brand-dark">
                <div className="overflow-hidden mb-4">
                  <p>Chúng tôi là một gia đình</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>của những đầu bếp, người suy nghĩ</p>
                </div>
                <div className="overflow-hidden mb-4">
                  <p>và những người đam mê</p>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
                những người nấu những món ăn chính hiệu, xứng đáng được tin tưởng, phát triển tiềm năng con người và làm phong phú cuộc sống.
              </p>

              <div className="flex gap-4 pt-4 flex-wrap justify-center">
                <a 
                  href="tel:+498928803451"
                  className="btn-primary"
                >
                  Đặt bàn ngay
                </a>
                <a 
                  href="#gallery"
                  className="btn-light"
                >
                  Xem thư viện
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
                Nhà hàng của chúng tôi
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Không gian tạo nên kỷ niệm – Sự yên tĩnh Phật giáo và thanh bình
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <ScrollReveal key={index}>
                  <div className="group relative h-64 lg:h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-200 to-amber-100 shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Image
                      src={`/images/view-${index}.jpg`}
                      alt={`Nhà hàng View ${index}`}
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
                Thẻ quà tặng
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Tặng một cuộc phiêu lưu ẩm thực. Với thẻ quà tặng của chúng tôi, bạn có thể mời những người yêu thích của mình đến trải nghiệm ẩm thực không quên.
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex justify-center">
              <a 
                href="https://eat.allo.restaurant/restaurant/nguyen-vietnam-restaurant-munchen/gift-cards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-accent text-white px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Xem thẻ quà tặng
              </a>
            </ScrollReveal>
          </div>
        </section>

        {/* Info & Hours Section */}
        <section className="py-20 sm:py-32 bg-amber-50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal>
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Địa chỉ</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Georgenstraße 67<br />
                    80799 München-Schwabing
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Giờ mở cửa</h3>
                  <p className="text-sm text-slate-700 space-y-2">
                    <span className="block"><strong>Thứ 2–Thứ 6 & CN:</strong> 12:00–15:00 & 17:30–22:30</span>
                    <span className="block"><strong>Thứ 7:</strong> 17:30–22:30</span>
                    <span className="block text-xs text-slate-600 pt-2">Bếp nóng: Thứ 2-6 đến 21:00</span>
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-gradient-to-br from-brand to-brand-accent rounded-2xl p-8 shadow-soft text-white">
                  <h3 className="text-2xl font-display font-bold mb-4">Đặt bàn</h3>
                  <p className="text-lg font-semibold mb-3">089 28803451</p>
                  <a href="tel:+498928803451" className="inline-block px-6 py-2 bg-white text-brand font-bold rounded-full hover:bg-amber-100 transition-colors duration-300">
                    Gọi ngay
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
                  Sẵn sàng cho một cuộc phiêu lưu ẩm thực?
                </h2>
                <p className="text-lg text-white/90 max-w-xl mx-auto">
                  Đặt bàn của bạn và trải nghiệm phép màu của ẩm thực Việt Nam chính hiệu trong không gian ấm áp thân thiện.
                </p>
                <div className="flex gap-4 justify-center pt-4 flex-wrap">
                  <a href="tel:+498928803451" className="inline-flex items-center justify-center rounded-full bg-amber-100 text-brand px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Đặt bàn
                  </a>
                  <a href="#speisekarte" className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-3 font-semibold hover:bg-white/10 transition-all duration-300">
                    Xem thực đơn
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
