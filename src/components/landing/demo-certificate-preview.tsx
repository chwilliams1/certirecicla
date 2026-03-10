"use client";

import { TreePine, Car, Smartphone, Droplets } from "lucide-react";

type MaterialRow = { material: string; kg: number; co2: number };
type Equivalencies = {
  trees: number;
  kmNotDriven: number;
  smartphonesCharged: number;
  homesEnergized: number;
};

export default function DemoCertificatePreview({
  materials,
  totalKg,
  totalCo2,
  equivalencies,
  waterSaved,
}: {
  materials: MaterialRow[];
  totalKg: number;
  totalCo2: number;
  equivalencies: Equivalencies;
  waterSaved: number;
}) {
  const today = new Date();
  const month = today.toLocaleDateString("es-CL", { month: "long" });
  const year = today.getFullYear();
  const demoCode = `DEMO-${String(Math.abs(totalKg * 7 + totalCo2 * 3) % 100000).padStart(5, "0")}`;

  return (
    <div className="relative rounded-xl border bg-white shadow-sm overflow-hidden select-none">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <span
          className="text-[5rem] sm:text-[6rem] font-bold text-sage-500 tracking-widest"
          style={{ opacity: 0.08, transform: "rotate(-45deg)" }}
        >
          DEMO
        </span>
      </div>

      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-sage-500" />

      <div className="pl-6 pr-5 py-6 space-y-5 relative z-20">
        {/* Header */}
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-800">
            Certificado de Reciclaje
          </h3>
          <p className="text-xs text-muted-foreground">
            Impacto Ambiental Verificado
          </p>
        </div>

        {/* Company info */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-sage-700">Tu Gestora</p>
            <p>Ejemplo de empresa</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-sage-700">Periodo</p>
            <p className="capitalize">
              {month} {year}
            </p>
          </div>
        </div>

        {/* Materials table */}
        <div className="overflow-hidden rounded-lg border text-xs">
          <div className="grid grid-cols-3 bg-sage-500 text-white font-medium">
            <div className="px-3 py-2">Material</div>
            <div className="px-3 py-2 text-right">Kg</div>
            <div className="px-3 py-2 text-right">CO&#x2082; evitado</div>
          </div>
          {materials.map((m, i) => (
            <div
              key={m.material}
              className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-sage-50/50" : "bg-white"}`}
            >
              <div className="px-3 py-2 text-sage-700">{m.material}</div>
              <div className="px-3 py-2 text-right text-sage-600">
                {m.kg.toLocaleString("es-CL")} kg
              </div>
              <div className="px-3 py-2 text-right text-sage-600">
                {m.co2.toLocaleString("es-CL", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                kg
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="rounded-lg bg-sage-50 border border-sage-200 p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Total reciclado</p>
            <p className="text-lg font-bold text-sage-800">
              {totalKg.toLocaleString("es-CL")} kg
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">CO&#x2082; evitado</p>
            <p className="text-lg font-bold text-sage-800">
              {totalCo2.toLocaleString("es-CL", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{" "}
              kg
            </p>
          </div>
        </div>

        {/* Equivalencies */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          {[
            {
              icon: TreePine,
              val: equivalencies.trees,
              label: "Arboles",
            },
            {
              icon: Car,
              val: equivalencies.kmNotDriven,
              label: "Km evitados",
            },
            {
              icon: Smartphone,
              val: equivalencies.smartphonesCharged,
              label: "Cargas",
            },
            {
              icon: Droplets,
              val: waterSaved,
              label: "Lt agua",
            },
          ].map(({ icon: Icon, val, label }) => (
            <div
              key={label}
              className="rounded-lg border bg-white p-2"
            >
              <Icon className="mx-auto h-4 w-4 text-sage-500 mb-1" />
              <p className="font-bold text-sage-700">{val.toLocaleString("es-CL")}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-3">
          <span>Codigo: {demoCode}</span>
          <span>{today.toLocaleDateString("es-CL")}</span>
        </div>
      </div>
    </div>
  );
}
