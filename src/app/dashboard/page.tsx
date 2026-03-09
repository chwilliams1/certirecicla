"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  Leaf,
  Users,
  FileCheck,
  Upload,
  Truck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calculateEquivalencies } from "@/lib/co2-calculator";
import { CountUp } from "@/components/count-up";
import { RotatingEquivalence } from "@/components/rotating-equivalence";
import { TrialBanner } from "@/components/trial-banner";

interface RecentPickup {
  key: string;
  clientName: string;
  date: string;
  location: string | null;
  materials: Array<{ material: string; quantityKg: number; co2Saved: number }>;
  totalKg: number;
  totalCo2: number;
}

interface DashboardData {
  kpis: { totalCo2: number; totalKg: number; activeClients: number; certificatesCount: number; totalPickups: number; prevYearKg: number };
  monthlyco2: Array<{ month: string; co2: number }>;
  materialDistribution: Array<{ name: string; value: number }>;
  monthlyMaterials: Array<Record<string, unknown>>;
  recentPickups: RecentPickup[];
  kgPerClient: Array<{ name: string; kg: number }>;
}

const CHART_COLORS = ["#6889b0", "#b8a05a", "#6a9a82", "#b88a5a", "#8a80a8", "#a87a90", "#5f9aa8", "#737f8c"];

// Colores centralizados en src/lib/material-colors.ts

const MATERIAL_EMOJI: Record<string, string> = {
  "Plástico PET": "🧴", "Plástico HDPE": "🧴", "Plástico LDPE": "🧴", "Plástico PP": "🧴",
  "Cartón": "📦", "Vidrio": "🍶", "Aluminio": "🥫", "Papel": "📄",
  "Madera": "🪵", "Electrónicos": "💻", "RAE": "🔌",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function formatMonth(m: string) {
  const parts = m.split("-");
  const month = MONTH_NAMES[parts[1]] || parts[1];
  const year = parts[0].slice(2);
  return `${month} ${year}`;
}

type ChartPeriod = "12m" | "6m" | "3m" | "year";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "year", label: "Año actual" },
  { value: "12m", label: "12 meses" },
  { value: "6m", label: "6 meses" },
  { value: "3m", label: "3 meses" },
];

function filterByPeriod<T extends { month: string }>(items: T[], period: ChartPeriod): T[] {
  const now = new Date();
  if (period === "year") {
    const yearPrefix = `${now.getFullYear()}-`;
    return items.filter((d) => d.month.startsWith(yearPrefix));
  }
  const monthsBack = period === "6m" ? 6 : period === "3m" ? 3 : 12;
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - (monthsBack - 1));
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}`;
  return items.filter((d) => d.month >= cutoffKey);
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("12m");

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="skeleton h-48 w-full rounded-[14px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
              <div className="skeleton h-4 w-24 rounded mb-3" />
              <div className="skeleton h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!data) return null;

  const equivalencies = calculateEquivalencies(data.kpis.totalCo2 * 1000);
  const filteredCo2 = filterByPeriod(data.monthlyco2, chartPeriod);
  const monthlyChartData = filteredCo2.map((d) => ({ ...d, name: formatMonth(d.month) }));
  const prevYearKg = data.kpis.prevYearKg;
  const yoyPercent = prevYearKg > 0 ? Math.round(((data.kpis.totalKg - prevYearKg) / prevYearKg) * 100) : 0;
  const yoyUp = yoyPercent >= 0;
  // Count consecutive growing months
  const co2Values = filteredCo2.map((d) => d.co2);
  let consecutiveGrowth = 0;
  for (let i = co2Values.length - 1; i > 0; i--) {
    if (co2Values[i] >= co2Values[i - 1]) consecutiveGrowth++;
    else break;
  }

  // Filter monthly materials by period and aggregate
  const filteredMonthlyMats = filterByPeriod(
    data.monthlyMaterials.map((m) => ({ ...m, month: m.month as string })),
    chartPeriod
  );
  const filteredMaterialDist: Record<string, number> = {};
  for (const entry of filteredMonthlyMats) {
    for (const [key, val] of Object.entries(entry)) {
      if (key === "month") continue;
      filteredMaterialDist[key] = (filteredMaterialDist[key] || 0) + Number(val);
    }
  }

  // Build consistent material → color mapping from distribution order
  const materialColorMap: Record<string, string> = {};
  data.materialDistribution.forEach((m, i) => {
    materialColorMap[m.name] = CHART_COLORS[i % CHART_COLORS.length];
  });

  // Sort materials by value for ranked bars
  const sortedMaterials = Object.entries(filteredMaterialDist)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
  const maxMaterialValue = sortedMaterials[0]?.value || 1;

  const equivItems = [
    { emoji: "🌳", value: equivalencies.trees.toLocaleString("es-CL"), label: "árboles que siguen en pie" },
    { emoji: "🚗", value: equivalencies.kmNotDriven.toLocaleString("es-CL"), label: "km que un auto no recorrió" },
    { emoji: "🏠", value: equivalencies.homesEnergized.toString(), label: "hogares con energía limpia por un día" },
    { emoji: "📱", value: equivalencies.smartphonesCharged.toLocaleString("es-CL"), label: "smartphones cargados" },
  ];

  return (
    <div className="space-y-6 page-fade-in">
      <TrialBanner />
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-sage-800">
          Buen día, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-sage-800/40 mt-0.5">Resumen de tu impacto ambiental {new Date().getFullYear()}</p>
      </div>

      {/* Impacto compacto + acciones rápidas */}
      <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="text-center sm:text-left flex-shrink-0">
          <p className="font-serif text-2xl sm:text-3xl text-sage-800">
            <CountUp end={data.kpis.totalKg} decimals={0} suffix=" kg" />
          </p>
          <p className="text-xs text-sage-500">reciclados en {new Date().getFullYear()}</p>
        </div>
        {prevYearKg > 0 && yoyPercent !== 0 && (
          <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${yoyUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {yoyUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {yoyUp ? "+" : ""}{yoyPercent}% vs {new Date().getFullYear() - 1}
          </div>
        )}
        <div className="hidden sm:block w-px h-10 bg-sage-200 flex-shrink-0" />
        <div className="flex-shrink-0 hidden sm:block">
          <RotatingEquivalence equivalences={equivItems} />
        </div>
        <div className="hidden sm:block flex-1" />
        <div data-tour="quick-actions" className="flex gap-2 flex-shrink-0 flex-wrap justify-center sm:justify-end">
          {[
            { href: "/dashboard/upload", icon: Upload, label: "Subir datos" },
            { href: "/dashboard/certificates/new", icon: FileCheck, label: "Crear certificado" },
            { href: "/dashboard/pickups/new", icon: Truck, label: "Registrar retiro" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <button className="inline-flex items-center gap-1.5 text-xs font-medium text-sage-600 bg-white/60 border border-sage-200 rounded-[10px] px-3 py-2.5 min-h-[44px] hover:bg-white/90 transition-colors btn-scale">
                <action.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "CO₂ evitado", end: data.kpis.totalCo2, decimals: 1, suffix: " ton", icon: Leaf, color: "text-sage-500" },
          { label: "Retiros", end: data.kpis.totalPickups, decimals: 0, suffix: "", icon: Truck, color: "text-sage-400" },
          { label: "Clientes activos", end: data.kpis.activeClients, decimals: 0, suffix: "", icon: Users, color: "text-sand-500" },
          { label: "Certificados emitidos", end: data.kpis.certificatesCount, decimals: 0, suffix: "", icon: FileCheck, color: "text-sand-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 sm:p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-sage-800/40">{kpi.label}</p>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-2xl text-sage-800">
              <CountUp end={kpi.end} decimals={kpi.decimals} suffix={kpi.suffix} />
            </p>
          </div>
        ))}
      </div>

      {/* Filtro de período */}
      <div className="flex items-center gap-1 bg-sand-100 border border-sand-300 rounded-[10px] p-1 w-fit">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setChartPeriod(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-[8px] transition-colors ${
              chartPeriod === opt.value
                ? "bg-white text-sage-800 shadow-sm font-medium"
                : "text-sage-500 hover:text-sage-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* CO₂ evitado por mes */}
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-sage-800">CO₂ evitado por mes</h3>
            {consecutiveGrowth >= 2 && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                📈 {consecutiveGrowth} meses consecutivos creciendo
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a7d5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5a7d5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
              <XAxis dataKey="name" stroke="#a0a89c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a0a89c" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#faf9f6", border: "1px solid #e8e4dc", borderRadius: "10px" }} />
              <Area type="monotone" dataKey="co2" stroke="#5a7d5e" strokeWidth={2.5} fill="url(#co2Gradient)" dot={{ fill: "#faf9f6", stroke: "#5a7d5e", strokeWidth: 2, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking de materiales */}
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
          <h3 className="font-serif text-lg text-sage-800 mb-6">Ranking de materiales</h3>
          <div className="space-y-3">
            {sortedMaterials.map((mat, i) => (
              <div key={mat.name} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{MATERIAL_EMOJI[mat.name] || "♻️"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-sage-800 truncate">{mat.name}</span>
                    <span className="text-xs text-sage-500 tabular-nums">{mat.value.toLocaleString("es-CL")} kg</span>
                  </div>
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(mat.value / maxMaterialValue) * 100}%`,
                        backgroundColor: materialColorMap[mat.name] || CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kg por cliente */}
      {data.kgPerClient && data.kgPerClient.length > 0 && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
          <h3 className="font-serif text-lg text-sage-800 mb-6">Reciclaje por cliente</h3>
          <div className="space-y-3">
            {data.kgPerClient.map((client, i) => (
              <div key={client.name} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-medium text-sage-500">{client.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-sage-800 truncate">{client.name}</span>
                    <span className="text-xs text-sage-500 tabular-nums">{client.kg.toLocaleString("es-CL")} kg</span>
                  </div>
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(client.kg / (data.kgPerClient[0]?.kg || 1)) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg text-sage-800">Retiros recientes</h3>
          <Link href="/dashboard/pickups" className="text-xs text-sage-500 hover:text-sage-700 transition-colors">
            Ver todos →
          </Link>
        </div>
        {data.recentPickups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🌱</p>
            <p className="text-sm text-sage-600">Aún no hay retiros registrados.</p>
            <p className="text-xs text-sage-800/40 mt-1">Cada retiro es material que no llega al vertedero.</p>
            <Link href="/dashboard/pickups/new">
              <button className="mt-4 text-xs text-sage-500 border border-sand-300 rounded-[8px] px-3 py-1.5 hover:bg-sand-100 transition-colors">
                Registrar primer retiro
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-300">
                  <th className="text-left py-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden md:table-cell">Materiales</th>
                  <th className="text-right py-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">kg</th>
                  <th className="text-right py-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">CO₂</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPickups.map((p) => (
                  <tr key={p.key} className="border-b border-sand-200 last:border-0 hover:bg-sage-50/30 transition-colors">
                    <td className="py-3 text-xs text-sage-800 whitespace-nowrap">
                      {new Date(p.date + "T12:00:00").toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-medium text-sage-500">{p.clientName.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-sage-800 truncate max-w-[140px]">{p.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.materials.map((m, i) => (
                          <span
                            key={i}
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}
                          >
                            {m.material}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-right text-xs font-medium text-sage-800 tabular-nums whitespace-nowrap">
                      {p.totalKg.toLocaleString("es-CL")} kg
                    </td>
                    <td className="py-3 text-right text-xs text-sage-500 tabular-nums whitespace-nowrap hidden sm:table-cell">
                      {p.totalCo2.toLocaleString("es-CL")} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
