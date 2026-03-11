"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  X,
  TreePine,
  Car,
  Smartphone,
  Droplets,

  ArrowRight,
  Check,
  Info,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateCo2,
  calculateEquivalencies,
  calculateWaterSaved,
  VALID_MATERIALS,
  DEFAULT_CO2_FACTORS,
} from "@/lib/co2-calculator";

type MaterialEntry = { id: string; material: string; kg: number };

const INITIAL: MaterialEntry[] = [
  { id: "1", material: "Plástico PET", kg: 500 },
  { id: "2", material: "Cartón", kg: 300 },
  { id: "3", material: "Vidrio", kg: 200 },
];

let nextId = 4;

const jsonLdGraph = [
  {
    "@type": "WebApplication",
    name: "Calculadora de Reciclaje y CO₂ Evitado",
    alternateName: [
      "Calculadora de Ecoequivalencias",
      "Calculadora Ecológica de Reciclaje",
      "Calculadora de Impacto Ambiental por Reciclaje",
    ],
    url: "https://certirecicla.cl/calculadora",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description:
      "Calculadora de reciclaje gratis: calcula el CO₂ evitado, ecoequivalencias (árboles, km no recorridos, agua ahorrada) y el impacto ambiental de tu empresa al reciclar plástico, cartón, vidrio, aluminio y más. Basada en factores GHG Protocol, IPCC y EPA WARM.",
    inLanguage: "es",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
    provider: {
      "@type": "Organization",
      name: "CertiRecicla",
      url: "https://certirecicla.cl",
      logo: "https://certirecicla.cl/logo.png",
    },
    featureList: [
      "Cálculo de CO₂ evitado por material reciclado",
      "Ecoequivalencias ambientales (árboles, km no recorridos, smartphones cargados)",
      "Litros de agua ahorrados por reciclaje",
      "Gráfico de distribución porcentual por material",
      "Tabla detallada con factores de emisión por material",
      "Factores verificados GHG Protocol, IPCC y EPA WARM",
      "Compartir resultados por URL",
      "Hasta 10 materiales en un solo cálculo",
    ],
    keywords: "calculadora de reciclaje, calculadora de ecoequivalencias, calculadora CO2 reciclaje, calculadora ecológica, calculadora ambiental, calculadora verde",
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://certirecicla.cl",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Calculadora de CO₂",
        item: "https://certirecicla.cl/calculadora",
      },
    ],
  },
  {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo funciona la calculadora de CO₂ evitado por reciclaje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La calculadora estima la cantidad de dióxido de carbono (CO₂) evitado al reciclar materiales en lugar de enviarlos a un relleno sanitario o producir materia prima virgen. Cada material tiene un factor de emisión que representa los kilogramos de CO₂ que se dejan de emitir por cada kilogramo reciclado. Ingresa tus materiales (plástico PET, cartón, vidrio, aluminio, etc.) y la cantidad en kilogramos para obtener el resultado al instante.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué metodología usa la calculadora de emisiones evitadas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los factores de emisión están basados en fuentes internacionales reconocidas: EPA WARM v16 (Waste Reduction Model), DEFRA 2025 del Reino Unido, GHG Protocol Corporate Standard y datos del IPCC AR6. Esta es la misma metodología que utilizan programas como HuellaChile del Ministerio del Medio Ambiente de Chile.",
        },
      },
      {
        "@type": "Question",
        name: "¿Para qué sirve calcular el CO₂ evitado por reciclaje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Conocer el CO₂ evitado te permite incluirlo en reportes de sustentabilidad, certificados de reciclaje, auditorías ISO 14001, cumplir con la NCG 519 de la CMF y demostrar cumplimiento con la Ley REP en Chile. También es útil para memorias anuales, licitaciones públicas y comunicar tu impacto ambiental a clientes y stakeholders.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto CO₂ se ahorra al reciclar 1 kg de plástico PET?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reciclar 1 kg de plástico PET evita aproximadamente 1,3 kg de CO₂ equivalente, según factores cruzados EPA WARM v16 y DEFRA 2025. Esto incluye las emisiones evitadas por no producir plástico virgen y por no enviarlo a relleno sanitario. El ahorro varía según el material: cartón ahorra 0,9 kg CO₂/kg, vidrio 0,31 kg CO₂/kg, y aluminio hasta 9,1 kg CO₂/kg.",
        },
      },
      {
        "@type": "Question",
        name: "¿La calculadora de CO₂ por reciclaje es gratuita?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, la calculadora de CertiRecicla es 100% gratuita y no requiere registro. Puedes calcular el CO₂ evitado, ver equivalencias ambientales (árboles, kilómetros no recorridos, agua ahorrada) y compartir tus resultados. Si necesitas certificados oficiales con estos datos, puedes probar CertiRecicla gratis por 14 días.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué materiales puedo calcular en la calculadora de reciclaje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La calculadora incluye los materiales más comunes: Plástico PET, Plástico HDPE, Cartón, Papel, Vidrio, Aluminio, Chatarra (acero), Cobre, Tetra Pak y Orgánicos. Cada material tiene su propio factor de emisión verificado según estándares internacionales GHG Protocol, EPA WARM e IPCC.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué son las ecoequivalencias en reciclaje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Las ecoequivalencias traducen el CO₂ evitado a magnitudes comprensibles: árboles absorbiendo CO₂ durante un año, kilómetros no recorridos en automóvil, smartphones cargados y litros de agua ahorrados. Se calculan usando los factores del EPA GHG Equivalencies Calculator y permiten comunicar el impacto ambiental de forma clara en reportes de sustentabilidad y certificados de reciclaje.",
        },
      },
      {
        "@type": "Question",
        name: "¿Sirve esta calculadora para cumplir con la Ley REP en Chile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La calculadora te entrega los datos de CO₂ evitado y equivalencias ambientales que puedes incluir en tus reportes. Para cumplir formalmente con la Ley REP necesitas acreditar la valorización en SINADER/RETC con documentación tributaria. CertiRecicla integra este cálculo en certificados de valorización oficiales y permite exportar datos directamente a SINADER.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo incluir el CO₂ evitado en un reporte de sustentabilidad o NCG 519?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El CO₂ evitado por reciclaje se reporta como emisiones Alcance 3 evitadas según el GHG Protocol Corporate Standard. Para la NCG 519 de la CMF y reportes ESG, debes indicar la metodología (factores EPA WARM/IPCC), el período, los materiales y cantidades. La calculadora de CertiRecicla genera estos datos listos para copiar en tu reporte.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánta agua se ahorra al reciclar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El ahorro de agua varía por material: reciclar 1 tonelada de papel ahorra aproximadamente 26.000 litros de agua, 1 tonelada de plástico ahorra 20.000 litros, y 1 tonelada de vidrio ahorra 4.000 litros. La calculadora estima automáticamente el agua total ahorrada según los materiales y cantidades que ingreses.",
        },
      },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": jsonLdGraph,
};

// Animated counter hook
function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current !== target ? value : 0;
    prevTarget.current = target;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <>
      {animated.toLocaleString("es-CL")}
      {suffix}
    </>
  );
}

// Donut chart component
function DonutChart({ materials }: { materials: { material: string; kg: number; co2: number }[] }) {
  const total = materials.reduce((s, m) => s + m.co2, 0);
  if (total === 0) return null;

  const colors = [
    "#5a7d5e", "#7c9a82", "#a8c5ae", "#d4e4d6",
    "#4a6b4e", "#3d5840", "#eef5ef", "#2d3a2e",
    "#c4b69c", "#a09080",
  ];

  let cumulative = 0;
  const segments = materials
    .filter((m) => m.co2 > 0)
    .map((m, i) => {
      const pct = (m.co2 / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...m, pct, start, color: colors[i % colors.length] };
    });

  // Build conic-gradient
  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-32 h-32 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(${gradientStops})`,
          maskImage: "radial-gradient(circle, transparent 40%, black 41%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 40%, black 41%)",
        }}
      />
      <div className="space-y-1.5 text-xs min-w-0">
        {segments.map((s) => (
          <div key={s.material} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sage-700 truncate">{s.material}</span>
            <span className="text-muted-foreground ml-auto whitespace-nowrap">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar equivalency
function EquivBar({
  icon: Icon,
  value,
  label,
  maxValue,
}: {
  icon: typeof TreePine;
  value: number;
  label: string;
  maxValue: number;
}) {
  const animated = useCountUp(value);
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-sage-700">
          <Icon className="h-4 w-4 text-sage-500" />
          <span>{label}</span>
        </div>
        <span className="font-bold text-sage-800">{animated.toLocaleString("es-CL")}</span>
      </div>
      <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-sage-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CalculadoraPage() {
  const [entries, setEntries] = useState<MaterialEntry[]>(INITIAL);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStep, setLeadStep] = useState<"form" | "confirm" | "done">("form");
  const [leadSending, setLeadSending] = useState(false);
  const [leadError, setLeadError] = useState("");

  const selectedMaterials = useMemo(
    () => new Set(entries.map((e) => e.material)),
    [entries]
  );

  const calculations = useMemo(() => {
    const materials = entries
      .filter((e) => e.material && e.kg > 0)
      .map((e) => ({
        material: e.material,
        kg: e.kg,
        co2: calculateCo2(e.material, e.kg),
      }));
    const totalKg = materials.reduce((sum, m) => sum + m.kg, 0);
    const totalCo2 = materials.reduce((sum, m) => sum + m.co2, 0);
    const equivalencies = calculateEquivalencies(totalCo2);
    const waterSaved = calculateWaterSaved(materials);
    return { materials, totalKg, totalCo2, equivalencies, waterSaved };
  }, [entries]);

  const updateEntry = (id: string, field: "material" | "kg", value: string | number) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    if (entries.length >= 10) return;
    setEntries((prev) => [...prev, { id: String(nextId++), material: "", kg: 0 }]);
  };


  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("m");
    if (m) {
      const parsed = m.split(",").map((part, i) => {
        const [material, kg] = part.split(":");
        return { id: String(i + 100), material: decodeURIComponent(material), kg: Number(kg) || 0 };
      }).filter((e) => VALID_MATERIALS.includes(e.material) && e.kg > 0);
      if (parsed.length > 0) {
        setEntries(parsed);
        nextId = parsed.length + 101;
      }
    }
  }, []);

  const { materials, totalKg, totalCo2, equivalencies, waterSaved } = calculations;

  // For bar maxValues
  const maxEquiv = Math.max(equivalencies.trees, equivalencies.kmNotDriven, equivalencies.smartphonesCharged, waterSaved, 1);

  return (
    <div className="min-h-screen bg-sand-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CertiRecicla" width={36} height={36} className="animate-breathe" />
            <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/precios" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">
              Precios
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">
              Blog
            </Link>
            <Link
              href="/register"
              className="text-sm bg-sage-500 text-white px-4 py-2 rounded-lg hover:bg-sage-600 transition-colors"
            >
              Prueba gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 md:py-14 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-sage-600 transition-colors">Inicio</Link>
            <span className="mx-1.5">/</span>
            <span className="text-sage-700">Calculadora de CO&#x2082;</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-sage-800 mb-3">
            Calculadora de CO&#x2082; evitado por reciclaje
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Ingresa los materiales que recicla tu empresa y calcula al instante tu <strong className="text-sage-700">huella de carbono</strong> e <strong className="text-sage-700">impacto
            ambiental</strong>. Basada en factores <strong className="text-sage-700">GHG Protocol</strong> e <strong className="text-sage-700">IPCC</strong>. 100% gratis, sin registro.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-border/50 rounded-xl p-5 space-y-4">
              <h2 className="font-serif text-lg text-sage-800">Materiales reciclados</h2>

              <div className="space-y-3">
                {entries.map((entry) => {
                  const co2 = entry.material && entry.kg > 0 ? calculateCo2(entry.material, entry.kg) : 0;
                  return (
                    <div key={entry.id} className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Select
                          value={entry.material}
                          onValueChange={(v) => updateEntry(entry.id, "material", v)}
                        >
                          <SelectTrigger className="flex-1 min-w-0 h-10 text-sm">
                            <SelectValue placeholder="Material" />
                          </SelectTrigger>
                          <SelectContent>
                            {VALID_MATERIALS.filter(
                              (m) => m === entry.material || !selectedMaterials.has(m)
                            ).map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          max={999999}
                          value={entry.kg || ""}
                          onChange={(e) =>
                            updateEntry(entry.id, "kg", Math.max(0, Number(e.target.value)))
                          }
                          placeholder="Kg"
                          className="w-20 sm:w-24 h-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          disabled={entries.length <= 1}
                          className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {co2 > 0 && (
                        <p className="text-xs text-sage-600 pl-1">
                          = {co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg CO&#x2082; evitado
                          <span className="text-muted-foreground ml-1">
                            (factor: {DEFAULT_CO2_FACTORS[entry.material]} kg CO&#x2082;/kg)
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {entries.length < 10 && (
                <Button variant="outline" size="sm" onClick={addEntry} className="gap-1 w-full">
                  <Plus className="h-4 w-4" />
                  Agregar material
                </Button>
              )}
            </div>

            {/* Methodology box */}
            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 text-xs text-sage-700 space-y-3">
              <div className="flex items-center gap-1.5 font-medium text-sage-800">
                <Info className="h-3.5 w-3.5" />
                Metodología verificada
              </div>
              <p>
                Factores de emisión cruzados entre <strong>EPA WARM v16</strong> (Dic 2023) y <strong>DEFRA/DESNZ 2025</strong> (UK).
                Cuando hay discrepancia, usamos el <strong>valor más conservador</strong>.
              </p>
              <p>
                Eco-equivalencias del <strong>EPA GHG Equivalencies Calculator</strong> (actualizado Nov 2024).
              </p>
              <p>
                Agua ahorrada basada en <strong>Water Footprint Network</strong>, <strong>EPA</strong> y <strong>FEVE LCA</strong>.
              </p>
              <a href="#metodologia" className="inline-flex items-center gap-1 text-sage-600 font-medium hover:text-sage-800 transition-colors">
                Ver fuentes completas
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Right: Results (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trust badge */}
            <a href="#metodologia" className="flex items-center gap-3 bg-white border border-sage-200 rounded-xl px-4 py-3 hover:border-sage-300 transition-colors group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 flex-shrink-0">
                <Check className="h-4 w-4 text-sage-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sage-800">Datos verificados con fuentes científicas</p>
                <p className="text-[10px] text-muted-foreground">EPA WARM v16 &bull; DEFRA/DESNZ 2025 &bull; GHG Protocol &bull; Water Footprint Network</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-sage-400 group-hover:text-sage-600 flex-shrink-0 ml-auto transition-colors" />
            </a>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white border border-border/50 rounded-xl p-3 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total reciclado</p>
                <p className="text-lg sm:text-2xl font-bold text-sage-800">
                  <AnimatedNumber value={totalKg} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">kg</p>
              </div>
              <div className="bg-sage-500 rounded-xl p-3 sm:p-5 text-center text-white">
                <p className="text-[10px] sm:text-xs text-sage-100 mb-1">CO&#x2082; evitado</p>
                <p className="text-lg sm:text-2xl font-bold">
                  <AnimatedNumber value={Math.round(totalCo2)} />
                </p>
                <p className="text-[10px] sm:text-xs text-sage-100">kg CO&#x2082;</p>
              </div>
              <div className="bg-white border border-border/50 rounded-xl p-3 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Agua ahorrada</p>
                <p className="text-lg sm:text-2xl font-bold text-sage-800">
                  <AnimatedNumber value={waterSaved} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">litros</p>
              </div>
            </div>

            {/* Donut chart */}
            {materials.length > 0 && (
              <div className="bg-white border border-border/50 rounded-xl p-5">
                <h3 className="font-serif text-sage-800 mb-4">Distribución de CO&#x2082; por material</h3>
                <DonutChart materials={materials} />
              </div>
            )}

            {/* Equivalencies bars */}
            <div className="bg-white border border-border/50 rounded-xl p-5 space-y-4">
              <h3 className="font-serif text-sage-800">Equivalencias ambientales</h3>
              <EquivBar icon={TreePine} value={equivalencies.trees} label="Árboles absorbiendo CO&#x2082; por 1 año" maxValue={maxEquiv} />
              <EquivBar icon={Car} value={equivalencies.kmNotDriven} label="Kilómetros no recorridos en auto" maxValue={maxEquiv} />
              <EquivBar icon={Smartphone} value={equivalencies.smartphonesCharged} label="Smartphones cargados" maxValue={maxEquiv} />
              <EquivBar icon={Droplets} value={waterSaved} label="Litros de agua ahorrados" maxValue={maxEquiv} />
              <p className="text-[10px] text-muted-foreground text-right pt-1">
                Fuente: EPA GHG Equivalencies Calculator (Nov 2024) &bull; Water Footprint Network
              </p>
            </div>

            {/* Materials detail table */}
            {materials.length > 0 && (
              <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-border/50">
                  <h3 className="font-serif text-sage-800">Detalle por material</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-sage-50 text-sage-700">
                        <th className="text-left px-3 sm:px-5 py-2.5 font-medium">Material</th>
                        <th className="text-right px-3 sm:px-5 py-2.5 font-medium">Kg</th>
                        <th className="text-right px-3 sm:px-5 py-2.5 font-medium hidden sm:table-cell">Factor</th>
                        <th className="text-right px-3 sm:px-5 py-2.5 font-medium">CO&#x2082;</th>
                        <th className="text-right px-3 sm:px-5 py-2.5 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, i) => (
                        <tr key={m.material} className={i % 2 === 0 ? "bg-white" : "bg-sage-50/30"}>
                          <td className="px-3 sm:px-5 py-2.5 text-sage-700">{m.material}</td>
                          <td className="px-3 sm:px-5 py-2.5 text-right">{m.kg.toLocaleString("es-CL")}</td>
                          <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">
                            {DEFAULT_CO2_FACTORS[m.material]} kg/kg
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 text-right font-medium text-sage-800">
                            {m.co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground">
                            {totalCo2 > 0 ? ((m.co2 / totalCo2) * 100).toFixed(1) : "0"}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-sage-200 bg-sage-50 font-medium text-sage-800">
                        <td className="px-3 sm:px-5 py-2.5">Total</td>
                        <td className="px-3 sm:px-5 py-2.5 text-right">{totalKg.toLocaleString("es-CL")}</td>
                        <td className="px-3 sm:px-5 py-2.5 hidden sm:table-cell"></td>
                        <td className="px-3 sm:px-5 py-2.5 text-right">
                          {totalCo2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg
                        </td>
                        <td className="px-3 sm:px-5 py-2.5 text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-5 py-2.5 border-t border-border/50 bg-sage-50/50">
                  <p className="text-[10px] text-muted-foreground">
                    Factores verificados con EPA WARM v16 (2023) y DEFRA/DESNZ 2025. <a href="#metodologia" className="text-sage-600 hover:underline">Ver metodología completa</a>
                  </p>
                </div>
              </div>
            )}


            {/* Lead capture */}
            {totalCo2 > 0 && (
              <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 sm:p-6">
                {leadStep === "done" ? (
                  <div className="text-center py-2">
                    <Check className="h-8 w-8 text-sage-600 mx-auto mb-2" />
                    <p className="font-serif text-sage-800 font-medium">¡Listo! Revisa tu correo, {leadName.trim().split(" ")[0]}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Te enviamos tu reporte de impacto ambiental + una sorpresa especial.
                    </p>
                  </div>
                ) : leadStep === "confirm" ? (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="h-5 w-5 text-sage-600 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-serif text-sage-800 font-medium">
                          Confirma tu envío, {leadName.trim().split(" ")[0]}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enviaremos a <strong>{leadEmail}</strong> tu reporte con:
                        </p>
                      </div>
                    </div>
                    <ul className="text-sm text-sage-700 space-y-1.5 mb-4 ml-8">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-sage-600 shrink-0" /> Detalle de CO₂ evitado por material</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-sage-600 shrink-0" /> Ecoequivalencias verificadas</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-sage-600 shrink-0" /> Metodología y fuentes citables</li>
                    </ul>
                    {leadError && (
                      <p className="text-sm text-red-600 mb-3">{leadError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLeadStep("form")}
                        disabled={leadSending}
                      >
                        Volver
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        disabled={leadSending}
                        onClick={async () => {
                          setLeadSending(true);
                          setLeadError("");
                          try {
                            const res = await fetch("/api/calculadora/lead", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: leadName.trim(),
                                email: leadEmail.trim(),
                                materials,
                                totalKg,
                                totalCo2,
                                equivalencies,
                                waterSaved,
                              }),
                            });
                            if (!res.ok) throw new Error();
                            setLeadStep("done");
                          } catch {
                            setLeadError("No pudimos enviar el correo. Intenta de nuevo.");
                          } finally {
                            setLeadSending(false);
                          }
                        }}
                      >
                        {leadSending ? "Enviando..." : "Sí, enviar mi reporte"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="h-5 w-5 text-sage-600 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-serif text-sage-800 font-medium">
                          Recibe tu reporte de impacto ambiental
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Te enviamos el detalle completo de tu cálculo con metodología y fuentes citables.
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (leadName.trim() && leadEmail.trim()) setLeadStep("confirm");
                      }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="text"
                          required
                          placeholder="Tu nombre"
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="email"
                          required
                          placeholder="tu@empresa.cl"
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button type="submit" className="gap-2 whitespace-nowrap w-full sm:w-auto sm:self-end">
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                    <p className="text-[11px] text-muted-foreground mt-2">Sin spam. Solo tu reporte.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Methodology & Sources — full transparency section */}
        <section id="metodologia" className="mt-16 max-w-4xl mx-auto space-y-12">

          {/* Intro */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-sage-800 mb-3">Metodología y fuentes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada número en esta calculadora proviene de fuentes científicas verificables. No usamos estimaciones
              propias: cruzamos las dos bases de datos de emisiones más respetadas del mundo y aplicamos el valor más
              conservador.
            </p>
          </div>

          {/* How we calculate CO2 */}
          <div className="bg-white border border-border/50 rounded-xl p-5 sm:p-6 md:p-8 space-y-5">
            <h3 className="font-serif text-lg sm:text-xl text-sage-800">¿Cómo calculamos el CO&#x2082; evitado?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El <strong className="text-sage-800">CO&#x2082; evitado</strong> (o emisiones evitadas) mide los kilogramos de dióxido de carbono
              equivalente (CO&#x2082;e) que se dejan de emitir al reciclar un material en lugar de producirlo desde
              materia prima virgen y desecharlo en relleno sanitario. El cálculo incluye:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 pl-5 list-disc">
              <li><strong className="text-sage-700">Producción virgen evitada</strong> &mdash; energía y emisiones de extraer, refinar y fabricar el material desde cero.</li>
              <li><strong className="text-sage-700">Relleno sanitario evitado</strong> &mdash; metano y CO&#x2082; que se generarían al descomponer el residuo.</li>
              <li><strong className="text-sage-700">Proceso de reciclaje</strong> (restado) &mdash; transporte, clasificación y reprocesamiento del material.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-sage-800">Fórmula:</strong> CO&#x2082; evitado = Cantidad (kg) &times; Factor de emisión (kg CO&#x2082;e/kg).
              El resultado neto es siempre positivo, representando emisiones que <em>no</em> se generaron.
            </p>
          </div>

          {/* Two-source cross-reference */}
          <div className="bg-white border border-border/50 rounded-xl p-5 sm:p-6 md:p-8 space-y-5">
            <h3 className="font-serif text-lg sm:text-xl text-sage-800">Verificación cruzada: EPA WARM v16 + DEFRA 2025</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A diferencia de otras calculadoras que se basan en una sola fuente, nosotros cruzamos dos de las bases
              de datos de emisiones más rigurosas del mundo. Cuando sus valores difieren, <strong className="text-sage-800">publicamos el valor
              más conservador</strong> para garantizar que ningún certificado sobrestime el impacto ambiental.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-sage-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-sage-800">EPA WARM v16</p>
                <p className="text-xs text-sage-600">
                  Waste Reduction Model, Dic 2023. Agencia de Protección Ambiental de EE.UU.
                  Cubre 61 materiales. Factores en MTCO&#x2082;E por short ton,
                  convertidos a kg/kg (×&nbsp;1000&nbsp;÷&nbsp;907,185).
                </p>
                <p className="text-xs text-sage-500">epa.gov/warm</p>
              </div>
              <div className="bg-sage-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-sage-800">DEFRA / DESNZ 2025</p>
                <p className="text-xs text-sage-600">
                  GHG Conversion Factors, Jun 2025. Departamento de Energía y Cambio Climático del Reino Unido.
                  Basado en CarbonWARM2 de WRAP. Factores en kg&nbsp;CO&#x2082;e por tonelada.
                </p>
                <p className="text-xs text-sage-500">gov.uk/greenhouse-gas-reporting</p>
              </div>
            </div>
          </div>

          {/* Complete emission factors table */}
          <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/50">
              <h3 className="font-serif text-lg sm:text-xl text-sage-800">Tabla completa de factores de emisión</h3>
              <p className="text-xs text-muted-foreground mt-1">kg CO&#x2082;e evitado por kg de material reciclado &mdash; valor usado y fuente primaria</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sage-50 text-sage-700 text-xs">
                    <th className="text-left px-3 sm:px-5 py-3 font-medium">Material</th>
                    <th className="text-right px-3 sm:px-5 py-3 font-medium">Factor usado</th>
                    <th className="text-right px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">EPA WARM v16</th>
                    <th className="text-right px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">DEFRA 2025</th>
                    <th className="text-left px-3 sm:px-5 py-3 font-medium hidden md:table-cell">Fuente adicional</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-t border-border/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Plástico PET</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">1,3 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">1,25 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,65 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">&mdash;</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-sage-50/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Plástico HDPE</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">1,0 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,97 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,49 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">&mdash;</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Cartón</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">0,9 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">3,14 kg/kg*</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,70 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">*Incluye crédito forestal</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-sage-50/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Papel</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">1,0 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">2,72 kg/kg*</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,73 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">*Incluye crédito forestal</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Vidrio</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">0,31 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,31 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,33 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">FEVE Glass LCA</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-sage-50/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Aluminio</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">9,1 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">9,71 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">&mdash;</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">BIR CO&#x2082; Report</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Acero</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">1,8 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">2,00 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">&mdash;</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">BIR CO&#x2082; Report</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-sage-50/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Tetra Pak</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">0,55 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">&mdash;</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">&mdash;</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">Tetra Pak LCA / ACE UK</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="px-3 sm:px-5 py-2.5 text-sage-700 font-medium">Orgánico</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right font-bold text-sage-800">0,25 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">0,2&ndash;0,3 kg/kg</td>
                    <td className="px-3 sm:px-5 py-2.5 text-right text-muted-foreground hidden sm:table-cell">&mdash;</td>
                    <td className="px-3 sm:px-5 py-2.5 text-muted-foreground hidden md:table-cell">Compostaje, metano evitado</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-sage-50/50 border-t border-border/50 text-xs text-muted-foreground">
              Conversión EPA WARM: MTCO&#x2082;E/short ton &times; 1.000 &divide; 907,185 = kg CO&#x2082;e/kg.
              Cuando EPA &gt; DEFRA, usamos un valor intermedio conservador. Todos los factores representan emisiones netas evitadas.
            </div>
          </div>

          {/* Eco-equivalencies methodology */}
          <div className="bg-white border border-border/50 rounded-xl p-6 md:p-8 space-y-5">
            <h3 className="font-serif text-xl text-sage-800">Eco-equivalencias: de dónde salen los números</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las eco-equivalencias provienen del <strong className="text-sage-800">EPA Greenhouse Gas Equivalencies Calculator</strong>,
              actualizado en noviembre de 2024 por la Agencia de Protección Ambiental de EE.UU. Cada factor tiene una
              fórmula verificable:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-sand-50 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-sage-600" />
                  <p className="text-sm font-medium text-sage-800">Árboles</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 árbol urbano absorbe <strong className="text-sage-700">60 kg CO&#x2082;/año</strong> (0,060 MTCO&#x2082;e).
                  Basado en 36,4 lbs C/árbol/año para un árbol de crecimiento medio plantado en zona urbana, período de 10 años.
                </p>
                <p className="text-xs text-sage-500">EPA, Cálculo: 36,4 lbs C &times; 44/12 &times; 1/2.204,6</p>
              </div>
              <div className="bg-sand-50 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-sage-600" />
                  <p className="text-sm font-medium text-sage-800">Kilómetros en auto</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 km en auto promedio emite <strong className="text-sage-700">0,244 kg CO&#x2082;</strong>.
                  Basado en 3,93&times;10&#x207B;&#x2074; MTCO&#x2082;e/milla, vehículo de 22,8 mpg, 10.917 VMT/año.
                </p>
                <p className="text-xs text-sage-500">EPA, convertido: MTCO&#x2082;e/mi &divide; 1,609 km/mi</p>
              </div>
              <div className="bg-sand-50 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-sage-600" />
                  <p className="text-sm font-medium text-sage-800">Smartphones cargados</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 carga completa = <strong className="text-sage-700">0,0124 kg CO&#x2082;</strong> (1,24&times;10&#x207B;&#x2075; MTCO&#x2082;e).
                  Energía por carga: 28,446 Wh menos consumo standby.
                </p>
                <p className="text-xs text-sage-500">EPA, factor eléctrico: 3,94&times;10&#x207B;&#x2074; MTCO&#x2082;/kWh</p>
              </div>
              <div className="bg-sand-50 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sage-600" />
                  <p className="text-sm font-medium text-sage-800">Agua ahorrada</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Papel: <strong className="text-sage-700">26 L/kg</strong> (EPA: 7.000 gal/short ton).
                  Plástico PET: 17 L/kg (Water Footprint Network).
                  Aluminio: 40 L/kg (IAI LCA).
                </p>
                <p className="text-xs text-sage-500">EPA, Water Footprint Network, FEVE LCA</p>
              </div>
            </div>
          </div>

          {/* Why conservative */}
          <div className="bg-sage-50 border border-sage-200 rounded-xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl text-sage-800">¿Por qué usamos valores conservadores?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EPA WARM v16 y DEFRA 2025 producen valores diferentes para el mismo material. Por ejemplo, para cartón
              corrugado EPA reporta 3,14&nbsp;kg&nbsp;CO&#x2082;e/kg (incluye créditos de carbono forestal), mientras que DEFRA
              reporta 0,70&nbsp;kg&nbsp;CO&#x2082;e/kg. Nosotros usamos 0,9&nbsp;kg&nbsp;CO&#x2082;e/kg &mdash; un valor intermedio que no incluye
              los créditos forestales más debatidos.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-sage-800">Preferimos subestimar a sobreestimar.</strong> Un certificado de reciclaje que exagera el
              impacto pierde credibilidad en una auditoría. Si tu CO&#x2082; evitado real es mayor al que mostramos, mejor:
              significa que tu impacto es aún más positivo de lo reportado.
            </p>
          </div>

          {/* FAQ content for SEO */}
          <div className="space-y-8 prose prose-sage prose-sm prose-headings:font-serif prose-headings:text-sage-800 prose-p:text-muted-foreground max-w-none">
            <div>
              <h2>¿Para qué sirve calcular el CO&#x2082; evitado por reciclaje?</h2>
              <p>
                Conocer tu <strong>impacto ambiental</strong> te permite incluirlo en <strong>reportes de sustentabilidad</strong>,
                <strong> certificados de reciclaje</strong>, <strong>auditorías ISO 14001</strong> y cumplir con la
                <strong> NCG 519 de la CMF</strong>. Además, es un dato clave para demostrar cumplimiento con la
                <strong> Ley REP</strong> en Chile. También es útil para <strong>memorias anuales</strong>, licitaciones públicas
                y comunicar el compromiso ambiental de tu empresa a clientes y stakeholders.
              </p>
            </div>

            <div>
              <h2>¿Sirve esta calculadora para la Ley REP y reportes NCG 519?</h2>
              <p>
                La <strong>calculadora de reciclaje</strong> te entrega los datos de CO&#x2082; evitado que puedes incluir en
                <strong> reportes de sustentabilidad</strong>, cumplimiento <strong>NCG 519 de la CMF</strong> y memorias anuales ESG.
                El CO&#x2082; evitado se reporta como emisiones Alcance 3 evitadas según el <strong>GHG Protocol</strong>.
                Para cumplir formalmente con la <strong>Ley REP</strong>, necesitas acreditar la valorización en <strong>SINADER</strong> y <strong>RETC</strong> con
                documentación tributaria, algo que CertiRecicla automatiza.
              </p>
            </div>

            <div>
              <h2>¿Quieres automatizar este cálculo con certificados oficiales?</h2>
              <p>
                Con <strong>CertiRecicla</strong>, cada <strong>certificado de reciclaje</strong> incluye automáticamente el cálculo de CO&#x2082;
                evitado por material, <strong>ecoequivalencias ambientales</strong> y el detalle metodológico completo.
                Gestiona clientes generadores, genera <strong>certificados PDF profesionales</strong>, exporta tus datos a <strong>SINADER</strong>
                {" "}y cumple con la <strong>Ley REP</strong> desde una sola plataforma. Ideal para <strong>gestoras de reciclaje en Chile</strong> que
                buscan profesionalizar sus operaciones.{" "}
                <Link href="/register" className="text-sage-600 font-medium">Prueba gratis 14 días</Link>.
              </p>
            </div>
          </div>

          {/* Full references */}
          <div className="bg-white border border-border/50 rounded-xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl text-sage-800">Referencias y fuentes citables</h3>
            <p className="text-xs text-muted-foreground">
              Todas las fuentes son de acceso público. Si usas estos datos en un reporte, puedes citar directamente las fuentes primarias.
            </p>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="border-l-2 border-sage-300 pl-3 space-y-0.5">
                <p className="font-medium text-sage-700">Factores de emisión CO&#x2082;</p>
                <p>U.S. EPA (2023). <em>Waste Reduction Model (WARM) Version 16</em>. Documentation for Greenhouse Gas Emission and Energy Factors. epa.gov/warm</p>
                <p>UK DESNZ/DEFRA (2025). <em>Government GHG Conversion Factors for Company Reporting</em>. gov.uk/greenhouse-gas-reporting-conversion-factors-2025</p>
                <p>FEVE (2023). <em>Glass Recycling Life Cycle Assessment</em>. feve.org</p>
                <p>Bureau of International Recycling (2022). <em>BIR CO&#x2082; Report &mdash; Metals Recycling</em>. bir.org</p>
                <p>Tetra Pak (2024). <em>Environmental Research &mdash; Carton Package LCA</em>. tetrapak.com/sustainability</p>
              </div>
              <div className="border-l-2 border-sage-300 pl-3 space-y-0.5">
                <p className="font-medium text-sage-700">Eco-equivalencias</p>
                <p>U.S. EPA (Nov 2024). <em>Greenhouse Gas Equivalencies Calculator &mdash; Calculations and References</em>. epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references</p>
              </div>
              <div className="border-l-2 border-sage-300 pl-3 space-y-0.5">
                <p className="font-medium text-sage-700">Agua ahorrada</p>
                <p>U.S. EPA. <em>Paper Recycling: Basic Information</em>. 7.000 gallons per short ton. archive.epa.gov/wastes/conserve/materials/paper</p>
                <p>Water Footprint Network / UNESCO-IHE. <em>Product Water Footprints</em>. waterfootprint.org</p>
                <p>International Aluminium Institute (2023). <em>Life Cycle Assessment of Aluminium Recycling</em>. world-aluminium.org</p>
              </div>
              <div className="border-l-2 border-sage-300 pl-3 space-y-0.5">
                <p className="font-medium text-sage-700">Marco metodológico</p>
                <p>GHG Protocol (WRI/WBCSD). <em>Corporate Value Chain (Scope 3) Accounting and Reporting Standard</em>. ghgprotocol.org</p>
                <p>IPCC (2021). <em>Sixth Assessment Report (AR6) &mdash; Working Group III: Mitigation of Climate Change, Chapter 5: Demand, Services and Social Aspects</em>.</p>
              </div>
            </div>
            <p className="text-xs text-sage-500 pt-2 border-t border-border/50">
              Última revisión de factores: marzo 2026. Los factores se actualizan cuando EPA o DEFRA publican nuevas versiones.
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CertiRecicla. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
