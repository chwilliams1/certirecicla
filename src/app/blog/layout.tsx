import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog de Reciclaje y Gestión de Residuos en Chile — CertiRecicla",
  description:
    "Artículos y guías sobre reciclaje, Ley REP, SINADER, huella de carbono, economía circular, gestión de residuos y sustentabilidad empresarial en Chile. Recursos gratuitos para gestoras y empresas.",
  keywords: [
    // Blog genérico
    "blog reciclaje Chile",
    "blog gestión de residuos",
    "blog sustentabilidad empresarial Chile",
    "artículos reciclaje empresas",
    // Temas principales
    "reciclaje empresas Chile",
    "gestión de residuos Chile",
    "Ley REP Chile",
    "SINADER Chile",
    "RETC Chile",
    "economía circular Chile",
    "huella de carbono reciclaje",
    "certificado de reciclaje",
    "certificado de valorización",
    "sustentabilidad empresarial",
    "residuos industriales Chile",
    "RESPEL Chile",
    "ISO 14001 reciclaje",
    "trazabilidad residuos",
    // Long-tail
    "guía reciclaje empresas Chile",
    "cómo cumplir ley REP",
    "cómo declarar residuos SINADER",
    "plan gestión residuos empresa",
    "CO2 evitado por reciclar",
    // Nuevos pilares
    "multas ley REP Chile",
    "sanciones ambientales Chile",
    "reciclaje minería Chile",
    "reciclaje retail Chile",
    "reciclaje industria alimentaria Chile",
    "software gestión residuos Chile",
  ],
  alternates: { canonical: "https://certirecicla.cl/blog" },
  openGraph: {
    title: "Blog de Reciclaje y Gestión de Residuos — CertiRecicla",
    description:
      "Guías prácticas sobre reciclaje, Ley REP, SINADER, economía circular y sustentabilidad para empresas en Chile.",
    url: "https://certirecicla.cl/blog",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Blog CertiRecicla — Reciclaje y gestión de residuos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de Reciclaje y Gestión de Residuos — CertiRecicla",
    description:
      "Guías prácticas sobre reciclaje, Ley REP, SINADER, economía circular y sustentabilidad para empresas en Chile.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
