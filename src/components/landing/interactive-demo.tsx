"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
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
} from "@/lib/co2-calculator";
import DemoImpactStats from "./demo-impact-stats";
import DemoCertificatePreview from "./demo-certificate-preview";

type MaterialEntry = { id: string; material: string; kg: number };

const INITIAL: MaterialEntry[] = [
  { id: "1", material: "Plástico PET", kg: 200 },
  { id: "2", material: "Cartón", kg: 150 },
];

let nextId = 3;

export default function InteractiveDemo() {
  const [entries, setEntries] = useState<MaterialEntry[]>(INITIAL);

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
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    if (entries.length >= 5) return;
    setEntries((prev) => [
      ...prev,
      { id: String(nextId++), material: "", kg: 0 },
    ]);
  };

  return (
    <section id="demo" className="container mx-auto px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
          Calcula tu impacto ahora
        </h2>
        <p className="text-muted-foreground">
          Ingresa los materiales que reciclas y ve en tiempo real cuanto CO&#x2082;
          evitas. Sin cuenta, sin compromiso.
        </p>
      </div>

      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Form + Stats */}
        <div className="space-y-6">
          {/* Material rows */}
          <div className="space-y-3">
            {entries.map((entry) => {
              const co2 = entry.material && entry.kg > 0
                ? calculateCo2(entry.material, entry.kg)
                : 0;
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  <Select
                    value={entry.material}
                    onValueChange={(v) => updateEntry(entry.id, "material", v)}
                  >
                    <SelectTrigger className="flex-1 min-w-0">
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
                      updateEntry(
                        entry.id,
                        "kg",
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    placeholder="Kg"
                    className="w-24"
                  />
                  {co2 > 0 && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                      = {co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg CO&#x2082;
                    </span>
                  )}
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
              );
            })}
          </div>

          {entries.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addEntry}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Agregar material
            </Button>
          )}

          {/* Impact stats */}
          <DemoImpactStats equivalencies={calculations.equivalencies} waterSaved={calculations.waterSaved} />
        </div>

        {/* Right: Certificate preview */}
        <div className="space-y-5">
          <DemoCertificatePreview
            materials={calculations.materials}
            totalKg={calculations.totalKg}
            totalCo2={calculations.totalCo2}
            equivalencies={calculations.equivalencies}
            waterSaved={calculations.waterSaved}
          />

          {/* Gate CTA */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/calculadora" className="flex-1">
                <Button className="w-full gap-2">
                  Probar calculadora completa
                </Button>
              </Link>
              <Link href="/register?ref=demo" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Calcula tu impacto con más detalle o empieza a generar certificados — 14 días sin costo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
