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
  Share2,
  ArrowRight,
  Check,
  Info,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculadora de CO₂ evitado por reciclaje",
  url: "https://certirecicla.cl/calculadora",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  description:
    "Calcula cuánto CO₂ evita tu empresa al reciclar. Basada en factores GHG Protocol e IPCC.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
  provider: {
    "@type": "Organization",
    name: "CertiRecicla",
    url: "https://certirecicla.cl",
  },
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
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    const params = entries
      .filter((e) => e.material && e.kg > 0)
      .map((e) => `${encodeURIComponent(e.material)}:${e.kg}`)
      .join(",");
    const url = `${window.location.origin}/calculadora?m=${params}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            <Image src="/logo.png" alt="CertiRecicla" width={28} height={28} />
            <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
          </Link>
          <nav className="flex items-center gap-4">
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
          <h1 className="text-3xl md:text-4xl font-serif text-sage-800 mb-3">
            Calculadora de CO&#x2082; evitado por reciclaje
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ingresa los materiales que recicla tu empresa y calcula al instante tu impacto
            ambiental. Basada en factores <strong className="text-sage-700">GHG Protocol</strong> e <strong className="text-sage-700">IPCC</strong>.
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
                      <div className="flex items-center gap-2">
                        <Select
                          value={entry.material}
                          onValueChange={(v) => updateEntry(entry.id, "material", v)}
                        >
                          <SelectTrigger className="flex-1 min-w-0 h-10">
                            <SelectValue placeholder="Seleccionar material" />
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
                          className="w-24 h-10"
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
            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 text-xs text-sage-700 space-y-2">
              <div className="flex items-center gap-1.5 font-medium">
                <Info className="h-3.5 w-3.5" />
                Metodología
              </div>
              <p>
                Los factores de emisión provienen de <strong>EPA WARM v16</strong>, <strong>DEFRA 2025</strong>,
                <strong> FEVE Glass LCA</strong> y <strong>BIR CO&#x2082; Report</strong>, alineados con el
                GHG Protocol Corporate Standard e IPCC AR6.
              </p>
              <p>
                Las eco-equivalencias se calculan usando factores del
                EPA GHG Equivalencies Calculator.
              </p>
            </div>
          </div>

          {/* Right: Results (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-border/50 rounded-xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total reciclado</p>
                <p className="text-2xl font-bold text-sage-800">
                  <AnimatedNumber value={totalKg} />
                </p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
              <div className="bg-sage-500 rounded-xl p-5 text-center text-white">
                <p className="text-xs text-sage-100 mb-1">CO&#x2082; evitado</p>
                <p className="text-2xl font-bold">
                  <AnimatedNumber value={Math.round(totalCo2)} />
                </p>
                <p className="text-xs text-sage-100">kg CO&#x2082;</p>
              </div>
              <div className="bg-white border border-border/50 rounded-xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Agua ahorrada</p>
                <p className="text-2xl font-bold text-sage-800">
                  <AnimatedNumber value={waterSaved} />
                </p>
                <p className="text-xs text-muted-foreground">litros</p>
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
              <EquivBar icon={TreePine} value={equivalencies.trees} label="Arboles absorbiendo CO&#x2082; por 1 año" maxValue={maxEquiv} />
              <EquivBar icon={Car} value={equivalencies.kmNotDriven} label="Kilómetros no recorridos en auto" maxValue={maxEquiv} />
              <EquivBar icon={Smartphone} value={equivalencies.smartphonesCharged} label="Smartphones cargados" maxValue={maxEquiv} />
              <EquivBar icon={Droplets} value={waterSaved} label="Litros de agua ahorrados" maxValue={maxEquiv} />
            </div>

            {/* Materials detail table */}
            {materials.length > 0 && (
              <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50">
                  <h3 className="font-serif text-sage-800">Detalle por material</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-sage-50 text-sage-700">
                        <th className="text-left px-5 py-2.5 font-medium">Material</th>
                        <th className="text-right px-5 py-2.5 font-medium">Kg</th>
                        <th className="text-right px-5 py-2.5 font-medium">Factor</th>
                        <th className="text-right px-5 py-2.5 font-medium">CO&#x2082; evitado</th>
                        <th className="text-right px-5 py-2.5 font-medium">% del total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, i) => (
                        <tr key={m.material} className={i % 2 === 0 ? "bg-white" : "bg-sage-50/30"}>
                          <td className="px-5 py-2.5 text-sage-700">{m.material}</td>
                          <td className="px-5 py-2.5 text-right">{m.kg.toLocaleString("es-CL")}</td>
                          <td className="px-5 py-2.5 text-right text-muted-foreground">
                            {DEFAULT_CO2_FACTORS[m.material]} kg/kg
                          </td>
                          <td className="px-5 py-2.5 text-right font-medium text-sage-800">
                            {m.co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg
                          </td>
                          <td className="px-5 py-2.5 text-right text-muted-foreground">
                            {totalCo2 > 0 ? ((m.co2 / totalCo2) * 100).toFixed(1) : "0"}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-sage-200 bg-sage-50 font-medium text-sage-800">
                        <td className="px-5 py-2.5">Total</td>
                        <td className="px-5 py-2.5 text-right">{totalKg.toLocaleString("es-CL")}</td>
                        <td className="px-5 py-2.5"></td>
                        <td className="px-5 py-2.5 text-right">
                          {totalCo2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg
                        </td>
                        <td className="px-5 py-2.5 text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={handleShare}
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Link copiado" : "Compartir resultados"}
              </Button>
              <Link href="/register?ref=calculadora" className="flex-1">
                <Button className="w-full gap-2">
                  Generar certificados reales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* SEO content section */}
        <section className="mt-16 max-w-3xl mx-auto prose prose-sage prose-sm prose-headings:font-serif prose-headings:text-sage-800 prose-p:text-muted-foreground">
          <h2>¿Cómo funciona la calculadora de CO&#x2082;?</h2>
          <p>
            Esta calculadora estima la cantidad de <strong>dióxido de carbono (CO&#x2082;) evitado</strong> al reciclar
            materiales en lugar de enviarlos a un relleno sanitario o producir materia prima virgen. Cada material tiene
            un <strong>factor de emisión</strong> que representa los kilogramos de CO&#x2082; que se dejan de emitir por
            cada kilogramo reciclado.
          </p>

          <h2>¿Qué metodología usamos?</h2>
          <p>
            Los factores de emisión están basados en fuentes internacionales reconocidas: <strong>EPA WARM v16</strong> (Waste
            Reduction Model), <strong>DEFRA 2025</strong> del Reino Unido, <strong>GHG Protocol Corporate Standard</strong> y
            datos del <strong>IPCC AR6</strong>. Esta es la misma metodología que utilizan programas como HuellaChile del
            Ministerio del Medio Ambiente.
          </p>

          <h2>¿Para qué sirve calcular el CO&#x2082; evitado?</h2>
          <p>
            Conocer tu impacto ambiental te permite incluirlo en <strong>reportes de sustentabilidad</strong>,
            <strong> certificados de reciclaje</strong>, <strong>auditorías ISO 14001</strong> y cumplir con la
            <strong> NCG 519 de la CMF</strong>. Además, es un dato clave para demostrar cumplimiento con la
            <strong> Ley REP</strong> en Chile.
          </p>

          <h2>¿Quieres automatizar este cálculo?</h2>
          <p>
            Con <strong>CertiRecicla</strong>, cada certificado de reciclaje incluye automáticamente el cálculo de CO&#x2082;
            evitado por material. Gestiona clientes, genera certificados PDF profesionales y exporta tus datos a SINADER
            desde una sola plataforma. <Link href="/register" className="text-sage-600 font-medium">Prueba gratis 14 días</Link>.
          </p>
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
