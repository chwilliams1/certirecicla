import type { Metadata } from "next";

const url = "https://certirecicla.cl/calculadora";

export const metadata: Metadata = {
  title: "Calculadora de Reciclaje y CO₂ Evitado — Gratis Online | CertiRecicla",
  description:
    "Calculadora de reciclaje gratis: calcula el CO₂ evitado, ecoequivalencias y agua ahorrada por tu empresa. Factores GHG Protocol, IPCC y EPA WARM. Ideal para Ley REP, reportes de sustentabilidad, NCG 519 e ISO 14001 en Chile.",
  keywords: [
    // --- Herramienta (buscan una calculadora) ---
    "calculadora de reciclaje",
    "calculadora de reciclaje online",
    "calculadora de reciclaje gratis",
    "calculadora CO2 reciclaje",
    "calculadora de ecoequivalencias",
    "calculadora de equivalencias ambientales",
    "calculadora ecológica reciclaje",
    "calculadora ambiental",
    "calculadora verde reciclaje",
    "calculadora de residuos",
    "calculadora impacto ambiental empresa",
    "calculadora huella de carbono reciclaje",
    "calculadora carbono reciclaje online",
    "calculadora de emisiones reciclaje",
    // --- Acción (buscan calcular/medir) ---
    "calcular CO2 evitado reciclaje",
    "cuánto CO2 se ahorra al reciclar",
    "cuánto CO2 ahorro reciclando",
    "calcular huella de carbono reciclaje gratis",
    "medir impacto ambiental reciclaje",
    "calcular emisiones evitadas",
    "calcular beneficios ambientales reciclaje",
    // --- Por material ---
    "CO2 evitado reciclaje plástico",
    "CO2 evitado reciclaje cartón",
    "CO2 evitado reciclaje vidrio",
    "CO2 evitado reciclaje aluminio",
    "factor emisión reciclaje por material",
    "kg CO2 evitado por material reciclado",
    // --- Normativo / compliance (decisores) ---
    "Ley REP calculadora reciclaje",
    "NCG 519 reporte ambiental",
    "SINADER declaración residuos",
    "RETC reciclaje Chile",
    "ISO 14001 reciclaje cálculo CO2",
    "reporte sustentabilidad reciclaje Chile",
    "certificado valorización CO2",
    "acreditación valorización residuos",
    "certificado de reciclaje Chile",
    // --- Metodología ---
    "GHG Protocol reciclaje",
    "IPCC factores emisión reciclaje",
    "EPA WARM reciclaje",
    "DEFRA factores emisión",
    "equivalencias gases efecto invernadero",
    // --- Beneficios / outcome ---
    "beneficios ambientales reciclaje empresa",
    "reducción emisiones reciclaje",
    "ahorro agua reciclaje",
    "árboles equivalentes CO2 reciclaje",
    // --- Chile / regional ---
    "gestora reciclaje Chile",
    "reciclaje empresas Chile",
    "huella de carbono empresa Chile",
    "economía circular Chile",
    "HuellaChile reciclaje",
    "valorización residuos Chile",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Calculadora de Reciclaje y CO₂ Evitado — Gratis Online",
    description:
      "Calculadora de reciclaje gratis: ingresa plástico, cartón, vidrio o aluminio y obtén CO₂ evitado, ecoequivalencias y agua ahorrada al instante. Factores GHG Protocol e IPCC.",
    url,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Calculadora de reciclaje y CO₂ evitado — CertiRecicla" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Reciclaje y CO₂ Evitado — Gratis Online",
    description:
      "Calcula cuánto CO₂ evita tu empresa al reciclar. Ecoequivalencias, agua ahorrada y factores GHG Protocol e IPCC.",
  },
};

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
