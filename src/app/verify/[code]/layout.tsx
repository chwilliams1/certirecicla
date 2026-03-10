import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar certificado de reciclaje",
  description:
    "Verifica la autenticidad de un certificado de valorización de residuos emitido a través de CertiRecicla.",
  robots: { index: true, follow: false },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
