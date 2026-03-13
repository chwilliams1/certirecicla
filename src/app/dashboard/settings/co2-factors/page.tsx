"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, RotateCcw, ExternalLink, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_CO2_FACTORS } from "@/lib/co2-calculator";

const CO2_SOURCES: Record<string, string> = {
  "Plástico PET": "EPA WARM v16 — PET recycling",
  "Plástico HDPE": "EPA WARM v16 — HDPE recycling",
  "Plástico LDPE": "EPA WARM v16 — LDPE film recycling",
  "Plástico PP": "EPA WARM v16 — PP recycling",
  "Plástico PS": "EPA WARM v16 — Polystyrene",
  "Cartón": "EPA WARM v16 — Corrugated cardboard",
  "Papel": "EPA WARM v16 — Mixed paper",
  "Vidrio": "FEVE / British Glass LCA report",
  "Aluminio": "EPA WARM v16 — Aluminum cans",
  "Acero": "BIR CO₂ Report / EPA WARM v16",
  "Madera": "DEFRA Emission Factors",
  "Electrónicos": "EPA WARM v16 — E-waste",
  "RAE": "EPA WARM v16 — E-waste",
  "TetraPak": "Tetra Pak LCA / ACE UK",
  "Textil": "PMC/ScienceDirect — Textile mechanical recycling",
  "Aceite vegetal": "EPA WARM v16 — Cooking oil to biodiesel",
  "Orgánico": "EPA WARM v16 — Food waste composting",
  "Neumáticos": "EPA WARM v16 — Tire recycling",
  "Baterías": "DEFRA / EU Battery Directive LCA",
  "Escombros": "EPA WARM v16 — Concrete/asphalt recycling",
};

export default function Co2FactorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [factors, setFactors] = useState<Array<{ material: string; factor: number }>>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.co2Factors && data.co2Factors.length > 0) {
          setFactors(data.co2Factors.map((f: { material: string; factor: number }) => ({ material: f.material, factor: f.factor })));
        } else {
          setFactors(Object.entries(DEFAULT_CO2_FACTORS).map(([material, factor]) => ({ material, factor })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ co2Factors: factors }),
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

  const hasModified = factors.some((f) => f.factor !== (DEFAULT_CO2_FACTORS[f.material] ?? f.factor));

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
        <h1 className="font-serif text-2xl text-sage-800">Factores de CO₂</h1>
        <p className="text-sm text-sage-800/40">Kilogramos de CO₂ evitados por cada kilogramo de material reciclado</p>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs text-emerald-800 font-medium">Metodología de cálculo</p>
            <p className="text-xs text-emerald-800">
              Cada factor representa los <strong>kg de CO₂ equivalente evitados</strong> por cada kg de material reciclado,
              comparado con producirlo desde materia prima virgen y/o enviarlo a relleno sanitario.
            </p>
            <p className="text-xs text-emerald-800">
              Los valores predeterminados se obtienen cruzando dos fuentes internacionales. Cuando difieren,
              aplicamos el <strong>valor más conservador</strong> para evitar sobreestimaciones en certificados y auditorías:
            </p>
            <ul className="text-xs text-emerald-800 space-y-1 pl-4 list-disc">
              <li>
                <a href="https://www.epa.gov/warm" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">
                  EPA WARM v16 <ExternalLink className="h-3 w-3" />
                </a>{" "}(Dic 2023) — Waste Reduction Model de la EPA de EE.UU. Cubre extracción evitada + manufactura + relleno sanitario.
              </li>
              <li>
                <a href="https://ghgprotocol.org/Third-Party-Databases/Defra" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">
                  DEFRA/DESNZ 2025 <ExternalLink className="h-3 w-3" />
                </a>{" "}— GHG Conversion Factors del Reino Unido. Basado en CarbonWARM2 de WRAP.
              </li>
              <li>
                <a href="https://feve.org" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">
                  FEVE <ExternalLink className="h-3 w-3" />
                </a>{" "}— Para vidrio, basado en análisis de ciclo de vida de la industria europea.
              </li>
            </ul>
            <p className="text-xs text-emerald-700">
              Si tu organización requiere factores locales específicos o auditados por un tercero, puedes modificar los valores a continuación.
              Los valores originales siempre se pueden restablecer.
            </p>
          </div>
        </div>
      </div>

      {hasModified && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFactors(factors.map((f) => ({ ...f, factor: DEFAULT_CO2_FACTORS[f.material] ?? f.factor })))}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer recomendados
          </Button>
        </div>
      )}

      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
        {factors.map((f, i) => {
          const defaultVal = DEFAULT_CO2_FACTORS[f.material];
          const isModified = defaultVal !== undefined && f.factor !== defaultVal;
          return (
            <div key={f.material} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">{f.material}</Label>
                {isModified && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">
                    Modificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  step="0.01"
                  value={f.factor}
                  onChange={(e) => {
                    const updated = [...factors];
                    updated[i] = { ...f, factor: parseFloat(e.target.value) || 0 };
                    setFactors(updated);
                  }}
                  className="w-32"
                />
                <span className="text-xs text-sage-800/40">kg CO₂ / kg</span>
              </div>
              <p className="text-[11px] text-sage-800/30">
                Fuente: {CO2_SOURCES[f.material] || "—"}{defaultVal !== undefined && ` — Predeterminado: ${defaultVal}`}
              </p>
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
        Guardar factores
      </Button>
    </div>
  );
}
