import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal de impacto ambiental",
  description:
    "Consulta tu impacto ambiental: kg reciclados, CO₂ evitado y certificados de valorización.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
