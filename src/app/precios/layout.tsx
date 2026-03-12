import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios — Certificados de Reciclaje",
  description:
    "Conoce los planes y precios de CertiRecicla, la plataforma de gestión de residuos y certificados de reciclaje para gestoras en Chile. Desde $19.900 CLP/mes. Prueba gratis 14 días, sin tarjeta de crédito.",
  keywords: [
    "precios certirecicla",
    "software reciclaje precios",
    "plataforma gestión residuos precio",
    "planes certirecicla",
    "certificados reciclaje precio",
    "software gestión residuos Chile",
    "Ley REP software precio",
    "SINADER software precio",
    "gestora reciclaje software",
    "certificado valorización precio",
    "plataforma reciclaje Chile",
    "software residuos industriales precio",
    "gestión residuos SaaS Chile",
    "precios software ambiental",
    "economía circular software precio",
  ],
  alternates: { canonical: "https://certirecicla.cl/precios" },
  openGraph: {
    title: "Planes y Precios — Certificados de Reciclaje | CertiRecicla",
    description:
      "Planes desde $19.900 CLP/mes. Certificados de reciclaje con CO₂ verificable, gestión de clientes y exportación SINADER. Prueba gratis 14 días.",
    url: "https://certirecicla.cl/precios",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Planes y Precios CertiRecicla — Software de reciclaje",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planes y Precios — Certificados de Reciclaje | CertiRecicla",
    description:
      "Planes desde $19.900 CLP/mes. Certificados de reciclaje con CO₂ verificable, gestión de clientes y exportación SINADER. Prueba gratis 14 días.",
  },
};

export default function PreciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
