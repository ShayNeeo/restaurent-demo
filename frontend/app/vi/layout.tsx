import "../globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Preloader } from "@/components/Preloader";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"]
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-forum",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nguyenrestaurant.de"),
  title: {
    default: "Nhà hàng Nguyễn München | Tiếng Việt",
    template: "%s | Nhà hàng Nguyễn"
  },
  description:
    "Thưởng thức ẩm thực Việt Nam chính hiệu tại Nhà hàng Nguyễn ở quận Schwabing, München. Thực đơn truyền thống, không gian ấm áp và dịch vụ đặt bàn nhanh.",
  keywords: [
    "Nhà hàng Nguyễn",
    "nhà hàng Việt Nam München",
    "ẩm thực Việt chính hiệu",
    "Phở München Schwabing",
    "thực đơn Việt Nam",
    "nhà hàng Việt Nam Đức"
  ],
  category: "Restaurant",
  authors: [{ name: "Nhà hàng Nguyễn" }],
  creator: "Nhà hàng Nguyễn",
  publisher: "Nhà hàng Nguyễn",
  alternates: {
    canonical: "https://nguyenrestaurant.de/vi",
    languages: {
      "de-DE": "https://nguyenrestaurant.de/",
      en: "https://nguyenrestaurant.de/en",
      vi: "https://nguyenrestaurant.de/vi",
      "x-default": "https://nguyenrestaurant.de/"
    }
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    alternateLocale: ["de_DE", "en_US"],
    url: "https://nguyenrestaurant.de/vi",
    siteName: "Nhà hàng Nguyễn München",
    title: "Nhà hàng Nguyễn | Ẩm thực Việt Nam chính hiệu tại München",
    description:
      "Đặt bàn tại Nhà hàng Nguyễn ở München-Schwabing – ẩm thực Việt Nam chính hiệu cho khách từ Đức, Châu Âu và Việt Nam.",
    images: [
      {
        url: "/images/view-2.jpg",
        width: 663,
        height: 510,
        alt: "Nhà hàng Nguyễn München-Schwabing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@nguyenrestaurent",
    title: "Nhà hàng Nguyễn München",
    description:
      "Ẩm thực Việt Nam chính hiệu tại trung tâm quận Schwabing, München – chào mừng đến Nhà hàng Nguyễn.",
    images: ["/images/view-2.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nhà hàng Nguyễn"
  },
  formatDetection: {
    telephone: false
  },
  manifest: "/site.webmanifest",
  other: {
    "geo.position": "48.1598;11.5812",
    "geo.placename": "München",
    "geo.region": "DE-BY",
    "msapplication-TileColor": "#A0644E",
    "msapplication-config": "/browserconfig.xml"
  }
};

export default function VietnameseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} bg-brand-light text-slate-900 antialiased`}
      >
        <CartProvider>
          <Preloader />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
