import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-functional",
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cielito Go | Destinos memorables",
    template: "%s | Cielito Go",
  },
  description:
    "Descubre destinos y comparte cómo imaginas tu próximo viaje con Cielito Go.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Cielito Go",
    title: "Cielito Go | Destinos memorables",
    description:
      "Descubre destinos y comparte cómo imaginas tu próximo viaje con Cielito Go.",
    images: [{ url: "/images/travel/hero-lagoon.png", width: 1792, height: 1024, alt: "Laguna tranquila entre acantilados" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cielito Go | Destinos memorables",
    description: "El mundo te espera. Hazlo memorable.",
    images: ["/images/travel/hero-lagoon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#004842",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
