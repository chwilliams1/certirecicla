"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, RotateCcw, ExternalLink, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_EQUIVALENCIES, type EcoEquivalencies } from "@/lib/co2-calculator";

const EQ_LABELS: Record<keyof EcoEquivalencies, { label: string; unit: string; source: string }> = {
  treesKgCo2PerYear: {
    label: "Árboles preservados",
    unit: "kg CO₂ absorbidos por árbol al año",
    source: "EPA GHG Equivalencies Calculator",
  },
  kmCo2PerKm: {
    label: "Kilómetros no recorridos",
    unit: "kg CO₂ emitidos por km en auto promedio",
    source: "EPA — 0.396 kg CO₂/mi convertido a km",
  },
  homesKgCo2PerYear: {
    label: "Días de hogar energizado",
    unit: "kg CO₂ emitidos por hogar al año",
    source: "EPA — 7.27 metric tons CO₂/home/year",
  },
  smartphoneKgCo2PerCharge: {
    label: "Smartphones cargados",
    unit: "kg CO₂ por carga completa de smartphone",
    source: "EPA GHG Equivalencies Calculator",
  },
};

export default function EcoEquivalenciasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [equivalencies, setEquivalencies] = useState<EcoEquivalencies>({ ...DEFAULT_EQUIVALENCIES });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.ecoEquivalencies) {
          try {
            setEquivalencies({ ...DEFAULT_EQUIVALENCIES, ...JSON.parse(data.ecoEquivalencies) });
          } catch { /* use defaults */ }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ecoEquivalencies: equivalencies }),
    });
    setSaving(false);
    router.push("/dashboard/settings");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  const hasModified = JSON.stringify(equivalencies) !== JSON.stringify(DEFAULT_EQUIVALENCIES);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-1.5 text-sm text-sage-800/50 hover:text-sage-800 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a configuración
        </button>
        <h1 className="font-serif text-2xl text-sage-800">Eco-equivalencias</h1>
        <p className="text-sm text-sage-800/40">Factores para convertir kg de CO₂ en equivalencias comprensibles</p>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 flex gap-2">
        <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-800">
          Los valores predeterminados provienen del{" "}
          <a href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">
            EPA GHG Equivalencies Calculator
            <ExternalLink className="h-3 w-3" />
          </a>.
          Recomendamos usar estos valores salvo que tu organización requiera factores locales específicos.
        </p>
      </div>

      {hasModified && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEquivalencies({ ...DEFAULT_EQUIVALENCIES })}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer recomendados
          </Button>
        </div>
      )}

      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
        {(Object.keys(EQ_LABELS) as Array<keyof EcoEquivalencies>).map((key) => {
          const meta = EQ_LABELS[key];
          const isModified = equivalencies[key] !== DEFAULT_EQUIVALENCIES[key];
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">{meta.label}</Label>
                {isModified && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">
                    Modificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  step="0.001"
                  value={equivalencies[key]}
                  onChange={(e) => {
                    setEquivalencies((prev) => ({
                      ...prev,
                      [key]: parseFloat(e.target.value) || 0,
                    }));
                  }}
                  className="w-32"
                />
                <span className="text-xs text-sage-800/40">{meta.unit}</span>
              </div>
              <p className="text-[11px] text-sage-800/30">
                Fuente: {meta.source} — Predeterminado: {DEFAULT_EQUIVALENCIES[key]}
              </p>
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
        Guardar equivalencias
      </Button>
    </div>
  );
}
