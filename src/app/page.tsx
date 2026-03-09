import Link from "next/link";
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
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-sage-500 animate-breathe" />
            <span className="font-serif text-xl font-bold text-sage-800">CertiRecicla</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-sage-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-sage-600 transition-colors">Planes</a>
            <a href="#methodology" className="hover:text-sage-600 transition-colors">Metodologia</a>
          </nav>
          <Link href="/login">
            <Button>Iniciar sesion</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 pt-20 pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-sage-50 border border-sage-200 px-4 py-1.5 mb-6">
              <Shield className="h-4 w-4 text-sage-500" />
              <span className="text-sm text-sage-600 font-medium">Metodologia GHG Protocol + ISO 14064</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold text-sage-900 md:text-5xl lg:text-6xl leading-tight">
              Certificados de CO&#x2082; evitado para tus clientes generadores
            </h1>
            <p className="mb-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              La plataforma SaaS para gestoras de reciclaje en Chile.
              Emite certificados profesionales, calcula el CO&#x2082; evitado con metodologia verificable
              y gestiona tus clientes — todo desde una sola herramienta.
            </p>
            <p className="mb-10 text-sm text-sage-400">
              Reemplaza Excel + Word + WhatsApp. En minutos, no en horas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6 btn-scale">
                  Prueba gratis 30 dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Ver planes
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta de credito. Plan Profesional completo durante el trial.
            </p>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="border-y border-border/50 bg-sand-50 py-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-sage-800">500+</p>
                <p className="text-xs text-muted-foreground mt-1">Gestoras PyME target en Chile</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-800">GHG Protocol</p>
                <p className="text-xs text-muted-foreground mt-1">Metodologia internacional</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-800">NCG 519</p>
                <p className="text-xs text-muted-foreground mt-1">Preparado para compliance ESG 2026</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-800">Ley REP</p>
                <p className="text-xs text-muted-foreground mt-1">Compatible con SINADER</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem statement */}
        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold text-sage-900 mb-4">
              El 90% de las gestoras PyME todavia usa Excel
            </h2>
            <p className="text-muted-foreground">
              Certificados manuales en Word, seguimiento en planillas, comunicacion por WhatsApp.
              10-20 horas al mes en trabajo administrativo que no genera valor.
              CertiRecicla automatiza todo eso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-red-800 mb-4">Sin CertiRecicla</h3>
              <ul className="space-y-3 text-sm text-red-700/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  Certificados manuales en Word (1-2 hrs cada uno)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  Calculo de CO&#x2082; con formulas Excel propias (sin respaldo)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  Sin portal para que el cliente vea su impacto
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  No cumple exigencias de ReSimple/GRANSIC
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  Declaracion SINADER manual cada mes
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-sage-200 bg-sage-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-sage-800 mb-4">Con CertiRecicla</h3>
              <ul className="space-y-3 text-sm text-sage-700/80">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Certificados PDF profesionales en 2 clics
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  CO&#x2082; calculado con GHG Protocol + ISO 14064
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Portal de impacto para tus clientes generadores
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Datos listos para GRANSIC y auditorias
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Exportacion compatible con SINADER
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-sand-50 border-y border-border/50 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-sage-900 mb-4">
                Todo lo que necesita tu gestora
              </h2>
              <p className="text-muted-foreground">
                Diseñado especificamente para gestoras de reciclaje PyME.
                No para generadores, no para grandes corporaciones — para ti.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="rounded-xl border bg-card p-6 card-hover">
                <FileCheck className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Certificados CO&#x2082;</h3>
                <p className="text-sm text-muted-foreground">
                  Genera certificados PDF profesionales con calculo automatico de CO&#x2082; evitado.
                  Metodologia GHG Protocol verificable.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Users className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Gestion de clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Administra tus clientes generadores, sus retiros, materiales
                  y todo su historial de reciclaje en un solo lugar.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <BarChart3 className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Dashboard analitico</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza tu impacto: kg reciclados, CO&#x2082; evitado,
                  materiales, tendencias mensuales y equivalencias ecologicas.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Globe className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Portal de clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Tus clientes generadores ven su impacto ambiental en un portal
                  personalizado. Profesionaliza tu servicio.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Upload className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Importacion Excel</h3>
                <p className="text-sm text-muted-foreground">
                  Sube tus datos existentes desde Excel. Deteccion de duplicados,
                  creacion automatica de clientes y calculo de CO&#x2082;.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Zap className="mb-4 h-10 w-10 text-sage-500" />
                <h3 className="mb-2 font-serif text-lg font-bold">Chatbot IA</h3>
                <p className="text-sm text-muted-foreground">
                  Emite certificados conversando con inteligencia artificial.
                  Flujo guiado que simplifica el proceso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why gestoras */}
        <section id="methodology" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-sage-900 mb-4">
                Metodologia con respaldo internacional
              </h2>
              <p className="text-muted-foreground">
                Certificados que tus clientes pueden presentar con confianza
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-sage-500" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">GHG Protocol</h3>
                <p className="text-sm text-muted-foreground">
                  Factores de emision basados en el estandar internacional mas usado
                  para contabilidad de gases de efecto invernadero.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-sage-500" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">ISO 14064</h3>
                <p className="text-sm text-muted-foreground">
                  Estructura de reporte alineada con la norma ISO para cuantificacion
                  y verificacion de emisiones de GEI.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-sage-500" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">NCG 519 Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Preparado para la normativa ESG de la CMF (dic 2026).
                  Tus clientes corporativos necesitaran estos certificados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-sand-50 border-y border-border/50 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-sage-900 mb-4">
                Planes simples, sin sorpresas
              </h2>
              <p className="text-muted-foreground">
                Precio por rango de clientes gestionados. No por usuario, no por certificado.
              </p>
              <div className="inline-flex items-center gap-2 mt-4 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5">
                <span className="text-sm text-amber-700 font-medium">
                  Early adopter: 50% descuento por 6 meses para las primeras 20 gestoras
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="rounded-xl border bg-card p-8 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Starter</h3>
                <p className="text-sm text-muted-foreground mb-6">Para gestoras que empiezan a digitalizar</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-sage-900">$29</span>
                  <span className="text-muted-foreground">/mes USD</span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
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
                    Dashboard analitico
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Portal de clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Importacion Excel
                  </li>
                </ul>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">Comenzar trial</Button>
                </Link>
              </div>

              {/* Profesional - ANCHOR */}
              <div className="rounded-xl border-2 border-sage-500 bg-card p-8 card-hover relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Mas popular
                </div>
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Profesional</h3>
                <p className="text-sm text-muted-foreground mb-6">Para gestoras PyME con operacion activa</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-sage-900">$69</span>
                  <span className="text-muted-foreground">/mes USD</span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
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
                    Chatbot IA para certificados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Envio de certificados por email
                  </li>
                </ul>
                <Link href="/login" className="block">
                  <Button className="w-full">Comenzar trial</Button>
                </Link>
              </div>

              {/* Business */}
              <div className="rounded-xl border bg-card p-8 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Business</h3>
                <p className="text-sm text-muted-foreground mb-6">Para gestoras medianas con alto volumen</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-sage-900">$149</span>
                  <span className="text-muted-foreground">/mes USD</span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
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
                    Multi-usuario
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Exportacion SINADER
                  </li>
                </ul>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">Comenzar trial</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive positioning */}
        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-sage-900 mb-4">
                La unica plataforma gestora-first en Chile
              </h2>
              <p className="text-muted-foreground">
                No somos un marketplace. No vendemos a generadores.
                CertiRecicla esta hecho para la gestora de reciclaje.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Funcionalidad</th>
                    <th className="text-center py-3 px-4 font-bold text-sage-800">CertiRecicla</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Excel + Word</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Otros SaaS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4">Gestora como usuario principal</td>
                    <td className="py-3 px-4 text-center text-sage-500 font-bold">Si</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">N/A</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Certificados CO&#x2082; con GHG Protocol</td>
                    <td className="py-3 px-4 text-center text-sage-500 font-bold">Si</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Precio accesible PyME (&lt;$100/mes)</td>
                    <td className="py-3 px-4 text-center text-sage-500 font-bold">$29-149</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">Gratis</td>
                    <td className="py-3 px-4 text-center text-red-400">$5.000+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Portal de impacto para clientes</td>
                    <td className="py-3 px-4 text-center text-sage-500 font-bold">Si</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">Parcial</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Exportacion SINADER</td>
                    <td className="py-3 px-4 text-center text-sage-500 font-bold">Si</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                    <td className="py-3 px-4 text-center text-red-400">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Regulatory context */}
        <section className="bg-sage-50/50 border-y border-sage-200/50 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-sage-900 mb-4">
                La regulacion empuja. Tu gestora debe estar lista.
              </h2>
              <p className="text-muted-foreground mb-12">
                Chile avanza hacia mas exigencias ambientales. Las gestoras que se digitalicen primero tendran ventaja.
              </p>

              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="rounded-xl bg-card border p-6">
                  <p className="text-xs font-medium text-sage-500 mb-2">Ley 20.920</p>
                  <h3 className="font-serif font-bold mb-2">Ley REP</h3>
                  <p className="text-sm text-muted-foreground">
                    Metas de reciclaje crecientes 2025-2030.
                    Las gestoras deben demostrar trazabilidad y resultados.
                  </p>
                </div>
                <div className="rounded-xl bg-card border p-6">
                  <p className="text-xs font-medium text-sage-500 mb-2">CMF Chile</p>
                  <h3 className="font-serif font-bold mb-2">NCG 519</h3>
                  <p className="text-sm text-muted-foreground">
                    Desde dic 2026, empresas reguladas deben reportar emisiones Scope 3.
                    Tus clientes corporativos van a necesitar tus certificados.
                  </p>
                </div>
                <div className="rounded-xl bg-card border p-6">
                  <p className="text-xs font-medium text-sage-500 mb-2">Chile NDC 3.0</p>
                  <h3 className="font-serif font-bold mb-2">Meta 40% reciclaje</h3>
                  <p className="text-sm text-muted-foreground">
                    Chile se comprometio a reciclar el 40% de sus residuos al 2030.
                    Duplicar la capacidad actual requiere mas gestoras formalizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-sage-900 mb-4">
              Digitaliza tu gestora hoy
            </h2>
            <p className="text-muted-foreground mb-8">
              30 dias gratis con el plan Profesional completo.
              Sin tarjeta de credito. Onboarding personalizado incluido.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6 btn-scale">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-sage-500" />
              <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Plataforma SaaS para gestoras de reciclaje en Chile.
              Metodologia GHG Protocol + ISO 14064.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CertiRecicla
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
