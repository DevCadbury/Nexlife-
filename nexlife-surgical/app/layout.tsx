import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/context/CartContext";
import { SiteContextProvider } from "@/lib/context/SiteContext";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexlifeinternational.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nexlife International — Medical & Surgical Supplies",
    template: "%s | Nexlife International",
  },
  description:
    "FDA-registered, ISO 13485 certified medical disposables and surgical instruments — supplied to hospitals and distributors across 40+ countries.",
  keywords: [
    "surgical supplies",
    "medical disposables",
    "surgical instruments",
    "disposable gloves",
    "face masks",
    "syringes",
    "wound care",
    "ISO 13485",
    "FDA registered",
    "medical exporter India",
    "Nexlife International",
  ],
  authors: [{ name: "Nexlife International" }],
  creator: "Nexlife International",
  publisher: "Nexlife International",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Nexlife International",
    title: "Nexlife International — Medical & Surgical Supplies",
    description:
      "FDA-registered, ISO 13485 certified medical disposables and surgical instruments delivered worldwide.",
    images: [
      {
        url: "/images/nexlife-logo.png",
        width: 1200,
        height: 630,
        alt: "Nexlife International",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexlife International — Medical & Surgical Supplies",
    description:
      "FDA-registered, ISO 13485 certified medical disposables and surgical instruments delivered worldwide.",
    images: ["/images/nexlife-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "Medical Supplies",
};

// Organization structured data for rich search results
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nexlife International",
  url: SITE_URL,
  logo: `${SITE_URL}/images/nexlife-logo.png`,
  description:
    "FDA-registered, ISO 13485 certified medical disposables and surgical instruments supplier.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "S-223, Angel Business Center – 2, Mota Varachha",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "394101",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-96648-43790",
    contactType: "sales",
    email: "info@nexlifeinternational.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>
          <Suspense>
            <SiteContextProvider>
              <WelcomeDialog />
              <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </SiteContextProvider>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}

