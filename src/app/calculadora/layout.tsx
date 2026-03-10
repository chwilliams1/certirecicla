import type { Metadata } from "next";

const url = "https://certirecicla.cl/calculadora";

export const metadata: Metadata = {
  title: "Calculadora de CO₂ evitado por reciclaje — CertiRecicla",
  description:
    "Calcula gratis cuánto CO₂ evita tu empresa al reciclar. Ingresa tus materiales y obtén un reporte de impacto ambiental con equivalencias verificables (GHG Protocol).",
  keywords: [
    "calculadora CO2 reciclaje",
    "calcular huella de carbono reciclaje",
    "CO2 evitado por reciclar",
    "calculadora impacto ambiental",
    "huella de carbono empresa Chile",
    "GHG Protocol reciclaje",
    "calculadora reciclaje gratis",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Calculadora de CO₂ evitado por reciclaje",
    description:
      "Calcula gratis cuánto CO₂ evita tu empresa al reciclar. Reporte de impacto ambiental con equivalencias verificables.",
    url,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Calculadora CO₂ CertiRecicla" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de CO₂ evitado por reciclaje — CertiRecicla",
    description: "Calcula gratis cuánto CO₂ evita tu empresa al reciclar.",
  },
};

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
