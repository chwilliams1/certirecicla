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
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Mail,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const VALORIZACION_METAS = [
  { material: "Vidrio", meta2025: "19%", meta2026: "22%" },
  { material: "Papel / Carton", meta2025: "14%", meta2026: "18%" },
  { material: "Metal", meta2025: "12%", meta2026: "15%" },
  { material: "Plastico", meta2025: "8%", meta2026: "11%" },
  { material: "Carton para liquidos", meta2025: "11%", meta2026: "15%" },
];

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
            <a href="#problema" className="hover:text-sage-600 transition-colors">El problema</a>
            <a href="#funcionalidades" className="hover:text-sage-600 transition-colors">Funcionalidades</a>
            <a href="#planes" className="hover:text-sage-600 transition-colors">Planes</a>
            <a href="#regulacion" className="hover:text-sage-600 transition-colors">Regulacion</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Iniciar sesion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Prueba gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 mb-6">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-amber-700 font-medium">Metas Ley REP 2026: plastico 11%, vidrio 22%, papel 18%</span>
            </div>
            <h1 className="mb-6 font-serif text-3xl font-bold text-sage-900 sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.15]">
              Deja de hacer certificados en Word.<br className="hidden sm:block" />
              Tu gestora merece algo mejor.
            </h1>
            <p className="mb-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CertiRecicla genera certificados de valorizacion con calculo de CO&#x2082; verificable,
              gestiona tus clientes generadores y te prepara para SINADER — todo en una plataforma
              hecha para gestoras de reciclaje en Chile.
            </p>
            <p className="mb-8 sm:mb-10 text-sm text-sage-500 font-medium">
              Reemplaza Excel + Word + WhatsApp. En minutos, no en horas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 btn-scale">
                  Comenzar gratis por 14 dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#planes" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                  Ver planes desde $19.900/mes
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta de credito. Acceso completo al plan Profesional durante el trial.
            </p>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-border/50 bg-sand-50 py-6">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-sm font-bold text-sage-800">GHG Protocol</p>
                <p className="text-xs text-muted-foreground mt-0.5">Metodologia internacional CO&#x2082;</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sage-800">Ley REP</p>
                <p className="text-xs text-muted-foreground mt-0.5">Trazabilidad compatible</p>
              </div>
              <div>
                <p className="text-sm font-bold text-sage-800">SINADER</p>
                <p className="text-xs text-muted-foreground mt-0.5">Exportacion de datos lista</p>
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
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
              Cada mes pierdes horas en trabajo que no genera valor
            </h2>
            <p className="text-muted-foreground">
              Certificados a mano en Word, seguimiento en planillas, declaraciones SINADER copiando datos uno por uno.
              Mientras tanto, las metas de valorizacion de la Ley REP suben cada año.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-400" />
                Tu dia a dia hoy
              </h3>
              <ul className="space-y-3 text-sm text-red-700/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Certificados manuales en Word — 1 a 2 horas cada uno
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  CO&#x2082; calculado con formulas Excel sin respaldo metodologico
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  SINADER completado a mano, copiando datos uno por uno
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Tus clientes no pueden verificar sus certificados online
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#10005;</span>
                  Sin trazabilidad real cuando llega una auditoria
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-sage-200 bg-sage-50/30 p-6">
              <h3 className="font-serif text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-sage-500" />
                Con CertiRecicla
              </h3>
              <ul className="space-y-3 text-sm text-sage-700/80">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Certificados PDF profesionales en 2 clics para todos tus clientes
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  CO&#x2082; evitado con GHG Protocol — verificable y auditable
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Datos listos para exportar a SINADER sin copiar nada
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Cada certificado verificable online con codigo unico
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Trazabilidad completa: retiro → material → certificado
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Todo lo que necesita tu gestora en un solo lugar
              </h2>
              <p className="text-muted-foreground">
                Diseñado para gestoras de reciclaje PyME en Chile.
                No es un marketplace. No es para generadores. Es tu herramienta.
              </p>
            </div>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="rounded-xl border bg-card p-6 card-hover">
                <FileCheck className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Certificados de valorizacion</h3>
                <p className="text-sm text-muted-foreground">
                  Genera certificados PDF con calculo automatico de CO&#x2082; evitado.
                  Selecciona clientes, periodo, y listo. Envialos por email directo.
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
                  ranking de materiales y equivalencias ecologicas.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Upload className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Importacion inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Sube tu Excel actual y la plataforma detecta columnas, crea clientes
                  automaticamente y calcula el CO&#x2082;. Sin reformatear nada.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <Globe className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Verificacion publica</h3>
                <p className="text-sm text-muted-foreground">
                  Cada certificado tiene un codigo unico y una pagina publica de verificacion.
                  Tus clientes lo comparten con sus stakeholders.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 card-hover">
                <FileSpreadsheet className="mb-4 h-9 w-9 text-sage-500" />
                <h3 className="mb-2 font-serif text-base font-bold">Exportacion SINADER</h3>
                <p className="text-sm text-muted-foreground">
                  Exporta tus datos en formato compatible con SINADER.
                  Sin copiar a mano, sin errores de transcripcion.
                </p>
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
                Selecciona clientes y periodo. CertiRecicla genera certificados PDF con CO&#x2082; evitado, materiales y equivalencias.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-sage-500 text-white flex items-center justify-center mb-4 text-lg font-bold">3</div>
              <h3 className="font-serif font-bold mb-2">Envia y verifica</h3>
              <p className="text-sm text-muted-foreground">
                Envia los certificados por email directo. Cada uno tiene un codigo unico con pagina de verificacion publica.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="metodologia" className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                  Certificados con respaldo metodologico real
                </h2>
                <p className="text-muted-foreground">
                  No son numeros inventados. Cada gramo de CO&#x2082; esta calculado con estandares internacionales.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">GHG Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Factores de emision EPA WARM, FEVE y DEFRA. El estandar mas usado
                    para contabilidad de gases de efecto invernadero.
                  </p>
                </div>
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <Target className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">ISO 14064</h3>
                  <p className="text-sm text-muted-foreground">
                    Estructura alineada con la norma ISO para cuantificacion
                    y verificacion de emisiones de GEI.
                  </p>
                </div>
                <div className="text-center rounded-xl bg-card border p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mb-4">
                    <TrendingUp className="h-7 w-7 text-sage-500" />
                  </div>
                  <h3 className="font-serif font-bold mb-2">NCG 519 Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Desde diciembre 2026, empresas reguladas deben reportar Scope 3.
                    Tus clientes corporativos necesitaran estos certificados.
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
                Las metas de la Ley REP suben cada año
              </h2>
              <p className="text-muted-foreground">
                Metas de valorizacion de envases y embalajes (Decreto Supremo).
                Las gestoras que no demuestren trazabilidad quedaran fuera.
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
                  trazabilidad y resultados de valorizacion.
                </p>
              </div>
              <div className="rounded-xl bg-sage-50/50 border border-sage-200/50 p-5">
                <p className="text-xs font-medium text-sage-500 mb-1">SMA</p>
                <h3 className="font-serif font-bold mb-2">SISREP</h3>
                <p className="text-sm text-muted-foreground">
                  Desde enero 2025, reporte mensual obligatorio dentro de los
                  primeros 10 dias de cada mes.
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

        {/* Pricing */}
        <section id="planes" className="bg-sand-50 border-y border-border/50 py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
                Planes pensados para gestoras PyME
              </h2>
              <p className="text-muted-foreground">
                Precio por rango de clientes. Sin cobro por certificado, sin cobro por usuario.
              </p>
              <div className="inline-flex items-center gap-2 mt-4 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5">
                <span className="text-sm text-amber-700 font-medium">
                  Early adopter: 50% off por 6 meses para las primeras 20 gestoras
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-6 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="rounded-xl border bg-card p-7 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Starter</h3>
                <p className="text-sm text-muted-foreground mb-5">Para empezar a digitalizar</p>
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
                    Importacion Excel
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Verificacion publica
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">Probar 14 dias gratis</Button>
                </Link>
              </div>

              {/* Profesional */}
              <div className="rounded-xl border-2 border-sage-500 bg-card p-7 card-hover relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recomendado
                </div>
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Profesional</h3>
                <p className="text-sm text-muted-foreground mb-5">Para gestoras con operacion activa</p>
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
                    Envio de certificados por email
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Portal de impacto para clientes
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button className="w-full">Probar 14 dias gratis</Button>
                </Link>
              </div>

              {/* Business */}
              <div className="rounded-xl border bg-card p-7 card-hover">
                <h3 className="font-serif text-xl font-bold text-sage-800 mb-1">Business</h3>
                <p className="text-sm text-muted-foreground mb-5">Para gestoras con alto volumen</p>
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
                    Multi-usuario con roles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-500 flex-shrink-0" />
                    Exportacion SINADER
                  </li>
                </ul>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">Probar 14 dias gratis</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
              Tu gestora no puede seguir con Excel
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Las metas suben, las auditorias llegan, y tus clientes corporativos van a exigir certificados con respaldo.
              Empieza hoy — 14 dias gratis, sin tarjeta de credito.
            </p>
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 btn-scale">
                Crear cuenta gratis
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
              Plataforma para gestoras de reciclaje en Chile. Metodologia GHG Protocol + ISO 14064.
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
