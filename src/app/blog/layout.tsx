import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — CertiRecicla",
  description:
    "Artículos sobre reciclaje, gestión de residuos, Ley REP, huella de carbono y sustentabilidad empresarial en Chile. Recursos para gestoras y empresas.",
  keywords: [
    "blog reciclaje Chile",
    "gestión de residuos artículos",
    "Ley REP blog",
    "certificado reciclaje",
    "sustentabilidad empresarial",
    "economía circular Chile",
  ],
  alternates: { canonical: "https://certirecicla.cl/blog" },
  openGraph: {
    title: "Blog — CertiRecicla",
    description: "Artículos sobre reciclaje, gestión de residuos, Ley REP y sustentabilidad empresarial en Chile.",
    url: "https://certirecicla.cl/blog",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CertiRecicla Blog" }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
