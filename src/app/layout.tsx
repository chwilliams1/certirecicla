import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CertiRecicla — Certificados de CO₂ evitado para gestoras de reciclaje",
  description: "Plataforma SaaS para gestoras de reciclaje en Chile. Emite certificados de CO₂ evitado con metodología GHG Protocol + ISO 14064, gestiona clientes generadores y exporta datos SINADER.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
