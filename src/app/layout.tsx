import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = "https://certirecicla.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CertiRecicla — Certificados de reciclaje con CO₂ verificable",
    template: "%s | CertiRecicla",
  },
  description:
    "Plataforma para gestoras de reciclaje en Chile. Genera certificados de valorización con cálculo de CO₂ (GHG Protocol), gestiona clientes generadores y exporta datos a SINADER.",
  keywords: [
    "certificados de reciclaje",
    "CO2 evitado",
    "gestora de reciclaje Chile",
    "Ley REP",
    "SINADER",
    "GHG Protocol",
    "valorización de residuos",
    "certificado de valorización",
    "reciclaje Chile",
    "economía circular",
  ],
  authors: [{ name: "CertiRecicla" }],
  creator: "CertiRecicla",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: "CertiRecicla",
    title: "CertiRecicla — Certificados de reciclaje con CO₂ verificable",
    description:
      "Genera certificados de valorización con cálculo de CO₂ verificable. Hecho para gestoras de reciclaje en Chile.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CertiRecicla — Plataforma de certificados de reciclaje",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CertiRecicla — Certificados de reciclaje con CO₂ verificable",
    description:
      "Genera certificados de valorización con cálculo de CO₂ verificable. Hecho para gestoras de reciclaje en Chile.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
