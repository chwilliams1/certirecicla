import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  FileCheck,
  BarChart3,
  Shield,
  Upload,
  Users,
  Globe,
  ArrowRight,
  Check,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Mail,
  FileSpreadsheet,
  Calculator,
  X,
  TreePine,
  Car,
  Smartphone,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InteractiveDemo from "@/components/landing/interactive-demo";
import FaqSection from "@/components/landing/faq-section";
import ScrollFadeIn from "@/components/landing/scroll-fade-in";
import PublicHeader from "@/components/public-header";

export const metadata: Metadata = {
  title: "CertiRecicla — Certificados de reciclaje con CO₂ verificable para gestoras en Chile",
  description:
    "Tu competencia ya genera certificados verificables en 2 minutos. CertiRecicla: certificados con CO₂ (GHG Protocol), verificación QR y exportación SINADER. Prueba gratis 14 días.",
  alternates: { canonical: "https://certirecicla.cl" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "CertiRecicla",
      url: "https://certirecicla.cl",
      description:
        "Plataforma de certificados de valorización de residuos para gestoras de reciclaje en Chile.",
      foundingDate: "2025",
      areaServed: { "@type": "Country", name: "Chile" },
    },
    {
      "@type": "SoftwareApplication",
      name: "CertiRecicla",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://certirecicla.cl",
      description:
        "Genera certificados de reciclaje con cálculo de CO₂ evitado bajo GHG Protocol. Gestiona clientes generadores y exporta datos a SINADER.",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "19900",
          priceCurrency: "CLP",
          description: "Hasta 15 clientes, 30 certificados/mes",
        },
        {
          "@type": "Offer",
          name: "Profesional",
          price: "49900",
          priceCurrency: "CLP",
          description: "Hasta 60 clientes, certificados ilimitados",
        },
        {
          "@type": "Offer",
          name: "Business",
          price: "99900",
          priceCurrency: "CLP",
          description: "Hasta 200 clientes, multi-usuario, SINADER",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Funciona con mi Excel actual?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. CertiRecicla detecta automáticamente las columnas de tu planilla (cliente, material, kg, fecha) y las importa sin reformatear.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo calculan el CO₂ evitado?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Usamos factores de emisión de EPA WARM v16, FEVE y DEFRA, siguiendo la metodología GHG Protocol. Cada material tiene un factor específico.",
          },
        },
        {
          "@type": "Question",
          name: "¿Es compatible con SINADER?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. CertiRecicla exporta tus datos en el formato que necesita SINADER. Disponible en planes Profesional y Business.",
          },
        },
      ],
    },
  ],
};

const VALORIZACION_METAS = [
  { material: "Vidrio", meta2025: "19%", meta2026: "22%" },
  { material: "Papel / Cartón", meta2025: "14%", meta2026: "18%" },
  { material: "Metal", meta2025: "12%", meta2026: "15%" },
  { material: "Plástico", meta2025: "8%", meta2026: "11%" },
  { material: "Cartón para líquidos", meta2025: "11%", meta2026: "15%" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-4xl text-center hero-stagger">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 mb-6">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-amber-700 font-medium">Dic 2026: tus clientes corporativos van a exigir certificados Scope 3. ¿Estás listo?</span>
            </div>
            <h1 className="mb-6 font-serif text-3xl font-bold text-sage-900 sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.15]">
              Mientras tú armas certificados en Word,<br className="hidden sm:block" />
              tu competencia ya los genera en 2 clics.
            </h1>
            <p className="mb-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Las gestoras que se digitalizaron entregan certificados verificables con CO&#x2082; calculado
              en segundos. Las que no, pierden clientes. ¿De qué lado quieres estar?
            </p>
            <p className="mb-8 sm:mb-10 text-sm text-sage-500 font-medium">
              Certificados con GHG Protocol + verificación QR + exportación SINADER. Setup en 2 minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 btn-scale">
                  Empezar mi prueba gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 gap-2">
                  <Calculator className="h-5 w-5" />
                  Ver cómo funciona
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta de crédito. Acceso completo al plan Profesional durante el trial.
            </p>

            {/* Social proof stats */}
            <div className="mt-10 sm:mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-sage-800">2 min</p>
                <p className="text-xs text-muted-foreground mt-0.5">por certificado</p>
              </div>
              <div className="border-x border-border">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-sage-800">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">GHG Protocol</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-sage-800">0</p>
                <p className="text-xs text-muted-foreground mt-0.5">datos a mano</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-border/50 bg-sand-50 py-6">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-sm font-bold text-sage-800">GHG Protocol</p>
                <p className="text-xs text-muted-foreground mt-0.5">Metodología internacional CO&#x2082;</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sage-800">Ley REP</p>
                <p className="text-xs text-muted-foreground mt-0.5">Trazabilidad compatible</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sage-800">SINADER</p>
                <p className="text-xs text-muted-foreground mt-0.5">Exportación de datos lista</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sage-800">NCG 519</p>
                <p className="text-xs text-muted-foreground mt-0.5">Preparado para ESG dic 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="problema" className="container mx-auto px-6 py-16 md:py-20">
          <ScrollFadeIn className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
              Cada certificado manual es una oportunidad para que tu cliente elija a otra gestora
            </h2>
            <p className="text-muted-foreground">
              Mientras tú pasas 2 horas armando un certificado en Word — sin verificación, sin CO&#x2082; auditable, sin trazabilidad —
              hay otra gestora que se lo entrega por email en 2 minutos. Con QR. Con GHG Protocol. Con marca propia.
            </p>
          </ScrollFadeIn>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-400" />
                Lo que ven tus clientes hoy
              </h3>
              <ul className="space-y-3 text-sm text-red-700/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Un certificado Word genérico que nadie puede verificar
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  CO&#x2082; &quot;calculado&quot; con fórmulas que ningún auditor acepta
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Días de espera por un documento que debería ser inmediato
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Datos para SINADER que no coinciden con los certificados
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Cero trazabilidad cuando llega una auditoría o licitación
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-sage-200 bg-sage-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-sage-500" />
                Lo que ven con CertiRecicla
              </h3>
              <ul className="space-y-3 text-sm text-sage-700/80">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  PDF profesional con tu marca, verificable con código QR
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  CO&#x2082; con GHG Protocol — el mismo estándar que usan las multinacionales
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Certificado listo en 2 clics, enviado por email desde la plataforma
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Exportación SINADER directa — datos que cuadran siempre
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Trazabilidad completa que resiste cualquier auditoría
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="py-16 md:py-20">
          <div className="container mx-auto px-6">
            <ScrollFadeIn className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Las herramientas que las gestoras profesionales ya están usando
              </h2>
              <p className="text-muted-foreground">
                Cada funcionalidad fue diseñada para resolver un problema real
                que te cuesta clientes, tiempo o dinero.
              </p>
            </ScrollFadeIn>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="rounded-xl border bg-card p-6 card-hover">
                <FileCheck className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Certificados que impresionan, no que avergüenzan</h3>
                <p className="text-sm text-muted-foreground">
                  PDF profesional con tu logo, CO&#x2082; automático, ecoequivalencias
                  (árboles, km, smartphones, agua) y código QR verificable.
                  El certificado que tus clientes esperan recibir.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Users className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Clientes y sucursales</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona generadores con sus sucursales, RUT, contacto y
                  todo el historial de retiros y materiales valorizados.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <BarChart3 className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Dashboard de impacto</h3>
                <p className="text-sm text-muted-foreground">
                  KPIs en tiempo real: kg reciclados, CO&#x2082; evitado, tendencias mensuales,
                  ranking de materiales y equivalencias ecológicas.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Upload className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Importación inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Sube tu Excel actual y la plataforma detecta columnas, crea clientes
                  automáticamente y calcula el CO&#x2082;. Sin reformatear nada.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Globe className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Que tu cliente presuma tu trabajo</h3>
                <p className="text-sm text-muted-foreground">
                  Cada certificado tiene una página pública de verificación con código QR.
                  Tu cliente la comparte con su directorio, auditores e inversionistas. Tu marca aparece ahí.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <FileSpreadsheet className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">SINADER en un clic, no en un día</h3>
                <p className="text-sm text-muted-foreground">
                  Los datos salen de la plataforma directo al formato SINADER.
                  Sin transcribir, sin errores, sin el estrés del último día de plazo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <ScrollFadeIn className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Así se ve por dentro
              </h2>
              <p className="text-muted-foreground">
                Dashboard, certificados y gestión de clientes — todo en un mismo lugar.
              </p>
            </ScrollFadeIn>
            <div className="mx-auto max-w-5xl">
              {/* Browser mockup */}
              <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md border px-3 py-1 text-xs text-muted-foreground max-w-xs mx-auto text-center">
                      app.certirecicla.cl/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Leaf className="h-5 w-5 text-sage-500" />
                    <span className="font-serif text-sm font-bold text-sage-800">CertiRecicla</span>
                    <span className="text-xs text-muted-foreground ml-2">/ Dashboard</span>
                  </div>
                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] text-muted-foreground">Total reciclado</p>
                      <p className="text-lg font-bold text-sage-800">24.580 kg</p>
                      <p className="text-[10px] text-sage-500">+12% vs mes anterior</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] text-muted-foreground">CO&#x2082; evitado</p>
                      <p className="text-lg font-bold text-sage-800">18.435 kg</p>
                      <p className="text-[10px] text-sage-500">GHG Protocol</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] text-muted-foreground">Clientes activos</p>
                      <p className="text-lg font-bold text-sage-800">38</p>
                      <p className="text-[10px] text-sage-500">3 nuevos este mes</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] text-muted-foreground">Certificados emitidos</p>
                      <p className="text-lg font-bold text-sage-800">142</p>
                      <p className="text-[10px] text-sage-500">Marzo 2026</p>
                    </div>
                  </div>
                  {/* Mini table */}
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-sage-50 px-4 py-2 border-b">
                      <p className="text-xs font-medium text-sage-700">Últimos certificados</p>
                    </div>
                    <div className="divide-y text-xs">
                      {[
                        { client: "Supermercados del Sur", date: "08 mar", kg: "1.200", status: "Enviado" },
                        { client: "Hotel Patagonia", date: "07 mar", kg: "340", status: "Publicado" },
                        { client: "Restaurant La Leña", date: "05 mar", kg: "180", status: "Borrador" },
                      ].map((row) => (
                        <div key={row.client} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sage-700 font-medium">{row.client}</span>
                          <span className="text-muted-foreground hidden sm:inline">{row.date}</span>
                          <span className="text-muted-foreground">{row.kg} kg</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            row.status === "Enviado" ? "bg-blue-50 text-blue-700" :
                            row.status === "Publicado" ? "bg-sage-50 text-sage-700" :
                            "bg-amber-50 text-amber-700"
                          }`}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
              De Excel a certificado profesional en 3 pasos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-sage-500 text-white flex items-center justify-center mb-4 text-lg font-bold">1</div>
              <h3 className="font-serif font-bold mb-2">Sube tus datos</h3>
              <p className="text-sm text-muted-foreground">
                Importa tu Excel actual o registra retiros manualmente. La plataforma detecta materiales, clientes y calcula CO&#x2082;.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-sage-500 text-white flex items-center justify-center mb-4 text-lg font-bold">2</div>
              <h3 className="font-serif font-bold mb-2">Genera certificados</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona clientes y período. CertiRecicla genera certificados PDF con CO&#x2082; evitado, materiales y equivalencias.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-sage-500 text-white flex items-center justify-center mb-4 text-lg font-bold">3</div>
              <h3 className="font-serif font-bold mb-2">Envía y verifica</h3>
              <p className="text-sm text-muted-foreground">
                Envía los certificados por email directo. Cada uno tiene un código único con página de verificación pública.
              </p>
            </div>
          </div>
        </section>

        {/* Eco-equivalencias */}
        <section className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <ScrollFadeIn className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                CO&#x2082; evitado, traducido a impacto real
              </h2>
              <p className="text-muted-foreground">
                Cada certificado incluye ecoequivalencias verificadas (EPA, nov 2024) que transforman
                toneladas de CO&#x2082; en algo que tu cliente entiende y puede mostrar a su directorio.
              </p>
            </ScrollFadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="rounded-xl border bg-card p-5 text-center">
                <TreePine className="mx-auto mb-3 h-8 w-8 text-green-600" />
                <p className="font-serif font-bold text-sage-900 text-sm">Árboles equivalentes</p>
                <p className="text-xs text-muted-foreground mt-1">Absorción anual de CO&#x2082; por árbol urbano</p>
              </div>
              <div className="rounded-xl border bg-card p-5 text-center">
                <Car className="mx-auto mb-3 h-8 w-8 text-blue-600" />
                <p className="font-serif font-bold text-sage-900 text-sm">Km no recorridos</p>
                <p className="text-xs text-muted-foreground mt-1">Distancia equivalente que un auto deja de contaminar</p>
              </div>
              <div className="rounded-xl border bg-card p-5 text-center">
                <Smartphone className="mx-auto mb-3 h-8 w-8 text-purple-600" />
                <p className="font-serif font-bold text-sage-900 text-sm">Smartphones cargados</p>
                <p className="text-xs text-muted-foreground mt-1">Energía equivalente ahorrada en cargas completas</p>
              </div>
              <div className="rounded-xl border bg-card p-5 text-center">
                <Droplets className="mx-auto mb-3 h-8 w-8 text-cyan-600" />
                <p className="font-serif font-bold text-sage-900 text-sm">Litros de agua ahorrados</p>
                <p className="text-xs text-muted-foreground mt-1">Agua que no se usa al reciclar vs. producir virgen</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <InteractiveDemo />

        {/* Comparison table */}
        <section className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Lo que tu competencia ya tiene vs lo que tú sigues haciendo
              </h2>
              <p className="text-muted-foreground">
                Esto es lo que pasa cuando tu cliente recibe un certificado de cada gestora y decide con quién seguir.
              </p>
            </div>
            <div className="mx-auto max-w-3xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-sage-200">
                    <th className="text-left py-3 px-4 font-serif font-bold text-sage-800 w-1/3"></th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground w-1/3">
                      <span className="flex items-center justify-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Tu gestora hoy
                      </span>
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-sage-800 w-1/3">
                      <span className="flex items-center justify-center gap-1.5">
                        <Leaf className="h-4 w-4 text-sage-500" />
                        CertiRecicla
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: "Tiempo por certificado", old: "1-2 horas", new: "2 minutos" },
                    { feature: "Cálculo CO₂", old: "Fórmula manual sin fuente", new: "GHG Protocol automático" },
                    { feature: "Verificación online", old: "No existe", new: "Código único + página pública" },
                    { feature: "Reporte SINADER", old: "Copiar datos a mano", new: "Exportación directa" },
                    { feature: "Historial de retiros", old: "Planilla desordenada", new: "Trazabilidad completa" },
                    { feature: "Envío a clientes", old: "WhatsApp / email manual", new: "Envío directo desde la plataforma" },
                    { feature: "Branding propio", old: "Logo pegado en Word", new: "Logo, colores y firma personalizados" },
                    { feature: "Auditorías", old: "Buscar en carpetas", new: "Todo centralizado y exportable" },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className="py-3 px-4 font-medium text-sage-700">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{row.old}</td>
                      <td className="py-3 px-4 text-center font-medium text-sage-700">{row.new}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="metodologia" className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                  Certificados con respaldo metodológico real
                </h2>
                <p className="text-muted-foreground">
                  No son números inventados. Cada gramo de CO&#x2082; está calculado con estándares internacionales.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">GHG Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Factores de emisión EPA WARM, FEVE y DEFRA. El estándar más usado
                    para contabilidad de gases de efecto invernadero.
                  </p>
                </div>
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <Target className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">ISO 14064</h3>
                  <p className="text-sm text-muted-foreground">
                    Estructura alineada con la norma ISO para cuantificación
                    y verificación de emisiones de GEI.
                  </p>
                </div>
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <TrendingUp className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">NCG 519 Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Desde diciembre 2026, empresas reguladas deben reportar Scope 3.
                    Tus clientes corporativos necesitarán estos certificados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory urgency */}
        <section id="regulacion" className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Las reglas del juego cambiaron. ¿Y tu operación?
              </h2>
              <p className="text-muted-foreground">
                La Ley REP sube las metas cada año. La NCG 519 exigirá Scope 3 desde diciembre 2026.
                Las gestoras que operen con planillas van a quedar fuera de las licitaciones corporativas.
              </p>
            </div>

            {/* Metas table */}
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-sm max-w-lg mx-auto">
                <thead>
                  <tr className="border-b-2 border-sage-200">
                    <th className="text-left py-3 px-4 font-serif font-bold text-sage-800">Material</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Meta 2025</th>
                    <th className="text-center py-3 px-4 font-bold text-sage-800">Meta 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {VALORIZACION_METAS.map((row) => (
                    <tr key={row.material}>
                      <td className="py-3 px-4 text-sage-700">{row.material}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{row.meta2025}</td>
                      <td className="py-3 px-4 text-center font-bold text-sage-800">{row.meta2026}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
              <div className="rounded-xl bg-sage-50/50 border border-sage-200/50 p-5">
                <p className="text-xs font-medium text-sage-500 mb-1">Ley 20.920</p>
                <h3 className="font-serif font-bold mb-2">Ley REP</h3>
                <p className="text-sm text-muted-foreground">
                  Metas crecientes hasta 2030. Las gestoras deben demostrar
                  trazabilidad y resultados de valorización.
                </p>
              </div>
              <div className="rounded-xl bg-sage-50/50 border border-sage-200/50 p-5">
                <p className="text-xs font-medium text-sage-500 mb-1">SMA</p>
                <h3 className="font-serif font-bold mb-2">SISREP</h3>
                <p className="text-sm text-muted-foreground">
                  Desde enero 2025, reporte mensual obligatorio dentro de los
                  primeros 10 días de cada mes.
                </p>
              </div>
              <div className="rounded-xl bg-sage-50/50 border border-sage-200/50 p-5">
                <p className="text-xs font-medium text-sage-500 mb-1">CMF</p>
                <h3 className="font-serif font-bold mb-2">NCG 519</h3>
                <p className="text-sm text-muted-foreground">
                  Desde dic 2026, empresas reguladas reportan Scope 3.
                  Tus clientes van a exigir certificados con respaldo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Para quien es */}
        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-3xl font-bold text-sage-900 text-center mb-10">
              Si emites certificados de reciclaje en Chile, esto se hizo para ti
            </h2>
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="grid md:grid-cols-5">
                {/* Para ti */}
                <div className="md:col-span-3 p-6 md:p-8">
                  <p className="text-xs font-medium text-sage-500 uppercase tracking-wider mb-3">Es para ti si</p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {[
                      "Eres gestora de reciclaje en Chile",
                      "Emites certificados a generadores",
                      "Necesitas reportar a SINADER",
                      "Tienes entre 5 y 200 clientes",
                      "Quieres dejar Excel + Word",
                      "Necesitas cumplir con Ley REP",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-sage-700">
                        <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {/* No es para ti */}
                <div className="md:col-span-2 p-6 md:p-8 bg-sand-50 border-t md:border-t-0 md:border-l">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">No es para ti si</p>
                  <div className="space-y-2.5">
                    {[
                      "Eres generador buscando dónde reciclar",
                      "Necesitas un marketplace",
                      "Buscas un ERP con facturación",
                      "Operas fuera de Chile",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="h-3.5 w-3.5 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planes" className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Menos de lo que te cuesta un día de trabajo administrativo
              </h2>
              <p className="text-muted-foreground">
                Piensa cuántas horas gastas al mes en certificados y planillas.
                CertiRecicla se paga solo desde el primer mes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-6 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="rounded-xl border bg-card p-7 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Starter</h3>
                <p className="text-sm text-muted-foreground mb-5">Para decirle adiós a Word este mes</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-sage-900">$19.900</span>
                  <span className="text-muted-foreground text-sm">/mes CLP</span>
                </div>
                <ul className="space-y-2.5 text-sm mb-7">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Hasta 15 clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    30 certificados/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Dashboard de impacto
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Importación Excel
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Verificación pública
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Envío de certificados por email
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">Empezar gratis</Button>
                </Link>
              </div>

              {/* Profesional */}
              <div className="rounded-xl border-2 border-sage-500 bg-card p-7 card-hover relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recomendado
                </div>
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Profesional</h3>
                <p className="text-sm text-muted-foreground mb-5">Para gestoras que quieren competir en serio</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-sage-900">$49.900</span>
                  <span className="text-muted-foreground text-sm">/mes CLP</span>
                </div>
                <ul className="space-y-2.5 text-sm mb-7">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Hasta 60 clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Certificados ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Todo lo de Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Portal de impacto para clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Multi-usuario (hasta 5)
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button className="w-full">Digitalizar mi gestora ahora</Button>
                </Link>
              </div>

              {/* Business */}
              <div className="rounded-xl border bg-card p-7 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Business</h3>
                <p className="text-sm text-muted-foreground mb-5">Para gestoras que ya dominan su mercado</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-sage-900">$99.900</span>
                  <span className="text-muted-foreground text-sm">/mes CLP</span>
                </div>
                <ul className="space-y-2.5 text-sm mb-7">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Hasta 200 clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Certificados ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Todo lo de Profesional
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Usuarios ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Exportación SINADER
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Branding propio en certificados
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">Escalar mi operación</Button>
                </Link>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-sage-800 py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(90,125,94,0.3)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(196,182,156,0.15)_0%,_transparent_60%)]" />
          <ScrollFadeIn className="container mx-auto px-6 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
                Cada día con Excel es un día que tu competencia te saca ventaja
              </h2>
              <p className="text-sage-300 mb-10 max-w-xl mx-auto leading-relaxed">
                Las metas REP suben. Las auditorías llegan. Tus clientes corporativos ya están comparando certificados.
                La gestora que se digitalice primero se queda con el mercado. La que no... bueno, ya sabes.
              </p>
              <p className="text-sage-400 text-sm mb-6">2 minutos de setup. 14 días gratis. Sin tarjeta.</p>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-10 py-6 bg-white text-sage-800 hover:bg-sand-100 btn-scale font-semibold">
                  Empezar mi prueba gratis ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="mt-5 text-xs text-sage-400">
                Sin tarjeta de crédito. Setup en 2 minutos. Cancela cuando quieras.
              </p>
            </div>
          </ScrollFadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-sand-50 py-10 md:py-14">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.png" alt="CertiRecicla" width={28} height={28} />
                <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Plataforma para gestoras de reciclaje en Chile. Certificados de valorización con cálculo de CO&#x2082; verificable bajo metodología GHG Protocol + ISO 14064.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-sage-800 uppercase tracking-wider mb-3">Producto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-sage-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#demo" className="hover:text-sage-600 transition-colors">Demo</a></li>
                <li><Link href="/precios" className="hover:text-sage-600 transition-colors">Planes y precios</Link></li>
                <li><a href="#faq" className="hover:text-sage-600 transition-colors">Preguntas frecuentes</a></li>
                <li><Link href="/calculadora" className="hover:text-sage-600 transition-colors">Calculadora CO&#x2082;</Link></li>
                <li><Link href="/blog" className="hover:text-sage-600 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-sage-800 uppercase tracking-wider mb-3">Normativa</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#regulacion" className="hover:text-sage-600 transition-colors">Ley REP</a></li>
                <li><a href="#metodologia" className="hover:text-sage-600 transition-colors">Metodología CO&#x2082;</a></li>
                <li><a href="#regulacion" className="hover:text-sage-600 transition-colors">SINADER</a></li>
                <li><a href="#regulacion" className="hover:text-sage-600 transition-colors">NCG 519</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CertiRecicla. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="mailto:hola@certirecicla.cl" className="hover:text-sage-600 transition-colors">hola@certirecicla.cl</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
