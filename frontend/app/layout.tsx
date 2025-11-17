import "./globals.css";

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
    default: "NGUYEN Vietnam Restaurant | München-Schwabing",
    template: "%s | NGUYEN Vietnam Restaurant"
  },
  description:
    "Nguyen Vietnam Restaurant in München-Schwabing serviert authentische vietnamesische Küche für deutsch-, englisch- und vietnamesischsprachige Gäste. Reservierungen unter +49 89 28803451.",
  keywords: [
    "Nguyen Restaurant",
    "vietnamesisches restaurant münchen",
    "authentic vietnamese food germany",
    "pho münchen schwabing",
    "vietnamesische speisekarte",
    "vietnamesisches restaurant vietnamese restaurant munich"
  ],
  category: "Restaurant",
  authors: [{ name: "Nguyen Vietnam Restaurant" }],
  creator: "Nguyen Vietnam Restaurant",
  publisher: "Nguyen Vietnam Restaurant",
  alternates: {
    canonical: "https://nguyenrestaurant.de/",
    languages: {
      "de-DE": "https://nguyenrestaurant.de/",
      en: "https://nguyenrestaurant.de/en",
      vi: "https://nguyenrestaurant.de/vi",
      "x-default": "https://nguyenrestaurant.de/"
    }
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US", "vi_VN"],
    url: "https://nguyenrestaurant.de/",
    siteName: "Nguyen Vietnam Restaurant München",
    title: "Nguyen Vietnam Restaurant | Authentische vietnamesische Küche in München",
    description:
      "Reservieren Sie Ihren Tisch bei Nguyen Vietnam Restaurant in München-Schwabing – authentische vietnamesische Küche für Gäste aus Deutschland, Europa und Vietnam.",
    images: [
      {
        url: "/images/view-2.jpg",
        width: 663,
        height: 510,
        alt: "Nguyen Vietnam Restaurant München-Schwabing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@nguyenrestaurent",
    title: "Nguyen Vietnam Restaurant München",
    description:
      "Authentische vietnamesische Küche im Herzen von München-Schwabing – willkommen bei Nguyen Vietnam Restaurant.",
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
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nguyen Vietnam Restaurant"
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
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

