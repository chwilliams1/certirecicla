import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materiales Reciclables en Chile |Guía Completa",
  description:
    "Guia completa de materiales reciclables en Chile: plastico PET, carton, vidrio, aluminio, papel, textil, electronicos y mas. Aprende como reciclar cada material, su impacto ambiental y donde llevarlos.",
  keywords: [
    "materiales reciclables Chile",
    "guia reciclaje materiales",
    "que se puede reciclar",
    "tipos de reciclaje",
    "plastico reciclable",
    "carton reciclable",
    "vidrio reciclable",
    "aluminio reciclable",
    "reciclaje Chile guia",
    "materiales reciclaje empresa",
    "Ley REP materiales",
    "punto limpio materiales",
  ],
  alternates: {
    canonical: "https://certirecicla.cl/materiales",
  },
  openGraph: {
    title: "Materiales Reciclables en Chile |Guia Completa",
    description:
      "Descubre como reciclar cada material: CO2 evitado, agua ahorrada, proceso de reciclaje y tips practicos para empresas y hogares.",
    url: "https://certirecicla.cl/materiales",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Guia de Materiales Reciclables" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Materiales Reciclables en Chile |Guia Completa",
    description:
      "Descubre como reciclar cada material: CO2 evitado, agua ahorrada, proceso de reciclaje y tips practicos.",
  },
};

export default function MaterialesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
