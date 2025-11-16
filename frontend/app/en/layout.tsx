import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://nguyenrestaurant.de"),
  title: {
    default: "Nguyen Vietnam Restaurant Munich | English",
    template: "%s | Nguyen Vietnam Restaurant"
  },
  description:
    "Discover Nguyen Vietnam Restaurant in Munich-Schwabing. Experience authentic Vietnamese cuisine with English-friendly staff, handmade noodles, aromatic broths and vegan-friendly dishes.",
  keywords: [
    "Nguyen Restaurant Munich",
    "Vietnamese restaurant Munich",
    "authentic Vietnamese food Germany",
    "Pho Munich Schwabing",
    "Vietnamese menu",
    "Vietnam restaurant Munich English"
  ],
  category: "Restaurant",
  authors: [{ name: "Nguyen Vietnam Restaurant" }],
  creator: "Nguyen Vietnam Restaurant",
  publisher: "Nguyen Vietnam Restaurant",
  alternates: {
    canonical: "https://nguyenrestaurant.de/en",
    languages: {
      "de-DE": "https://nguyenrestaurant.de/",
      en: "https://nguyenrestaurant.de/en",
      vi: "https://nguyenrestaurant.de/vi",
      "x-default": "https://nguyenrestaurant.de/"
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["de_DE", "vi_VN"],
    url: "https://nguyenrestaurant.de/en",
    siteName: "Nguyen Vietnam Restaurant Munich",
    title: "Nguyen Vietnam Restaurant | Authentic Vietnamese Cuisine in Munich",
    description:
      "Reserve your table at Nguyen Vietnam Restaurant in Munich-Schwabing – authentic Vietnamese cuisine for guests from Germany, Europe and Vietnam.",
    images: [
      {
        url: "/images/view-2.jpg",
        width: 663,
        height: 510,
        alt: "Nguyen Vietnam Restaurant Munich-Schwabing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@nguyenrestaurent",
    title: "Nguyen Vietnam Restaurant Munich",
    description:
      "Authentic Vietnamese cuisine in the heart of Munich-Schwabing – welcome to Nguyen Vietnam Restaurant.",
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
    title: "Nguyen Vietnam Restaurant"
  },
  formatDetection: {
    telephone: false
  },
  manifest: "/site.webmanifest",
  other: {
    "geo.position": "48.1598;11.5812",
    "geo.placename": "Munich",
    "geo.region": "DE-BY",
    "msapplication-TileColor": "#A0644E",
    "msapplication-config": "/browserconfig.xml"
  }
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
