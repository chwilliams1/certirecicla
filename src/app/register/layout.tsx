import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta gratis",
  description:
    "Regístrate en CertiRecicla y empieza a generar certificados de reciclaje con CO₂ verificable. 14 días gratis, sin tarjeta de crédito.",
  alternates: { canonical: "https://certirecicla.cl/register" },
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
