import type { Metadata } from "next";

const url = "https://certirecicla.cl/calculadora";

export const metadata: Metadata = {
  title: "Calculadora de CO₂ Evitado por Reciclaje — Gratis, por Material | CertiRecicla",
  description:
    "Calcula cuánto CO₂ evitas al reciclar plástico, cartón, vidrio y aluminio. Tabla de factores de emisión por material, ecoequivalencias (árboles, km, agua ahorrada) y metodología EPA WARM + DEFRA. Gratis, sin registro. Ideal para gestoras, Ley REP y reportes de sustentabilidad en Chile.",
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
    "calculadora emisiones evitadas reciclaje gratis",
    // --- Acción (buscan calcular/medir) ---
    "calcular CO2 evitado reciclaje",
    "cuánto CO2 se ahorra al reciclar",
    "cuánto CO2 ahorro reciclando",
    "calcular huella de carbono reciclaje gratis",
    "medir impacto ambiental reciclaje",
    "calcular emisiones evitadas",
    "calcular beneficios ambientales reciclaje",
    // --- Long-tail por material (preguntas específicas) ---
    "CO2 evitado reciclaje plástico",
    "CO2 evitado reciclaje cartón",
    "CO2 evitado reciclaje vidrio",
    "CO2 evitado reciclaje aluminio",
    "factor emisión reciclaje por material",
    "kg CO2 evitado por material reciclado",
    "cuánto CO2 se ahorra al reciclar 1 kg de plástico",
    "cuánto CO2 se ahorra al reciclar una tonelada de cartón",
    "factor de emisión plástico PET reciclaje",
    "factor de emisión aluminio reciclaje",
    "tabla factores emisión reciclaje por material",
    "tabla CO2 evitado por material reciclado",
    // --- Long-tail ecoequivalencias ---
    "cuántos árboles equivale reciclar",
    "equivalencias ambientales CO2 árboles reciclaje",
    "cuánta agua se ahorra al reciclar papel",
    "cuánta agua se ahorra al reciclar plástico",
    "litros de agua ahorrados reciclaje",
    "huella hídrica reciclaje por material",
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
    "cómo reportar emisiones evitadas reciclaje",
    "alcance 3 emisiones evitadas reciclaje",
    // --- Metodología ---
    "GHG Protocol reciclaje",
    "IPCC factores emisión reciclaje",
    "EPA WARM reciclaje",
    "EPA WARM factores emisión español",
    "DEFRA factores emisión",
    "DEFRA factores emisión reciclaje 2025",
    "equivalencias gases efecto invernadero",
    "por qué varían factores emisión entre fuentes",
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
    "calculadora reciclaje Chile",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Calculadora de CO₂ Evitado por Reciclaje — Gratis, por Material",
    description:
      "Calcula cuánto CO₂ evitas al reciclar plástico, cartón, vidrio y aluminio. Factores EPA WARM + DEFRA verificados. Ecoequivalencias y agua ahorrada. Gratis, sin registro.",
    url,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Calculadora de reciclaje y CO₂ evitado — CertiRecicla" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de CO₂ Evitado por Reciclaje — Gratis, por Material",
    description:
      "Calcula cuánto CO₂ evitas al reciclar plástico, cartón, vidrio y aluminio. Ecoequivalencias, agua ahorrada y factores verificados.",
  },
};

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
