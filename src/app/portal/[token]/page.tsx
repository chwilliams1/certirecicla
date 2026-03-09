"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Leaf,
  Download,
  Recycle,
  TreePine,
  Car,
  Home,
  Smartphone,
  Package,
  BarChart3,
  Calendar,
  MapPin,
  FileCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PickupRecord {
  date: string;
  material: string;
  kg: number;
  co2: number;
  location: string | null;
}

interface PortalData {
  client: { id: string; name: string; rut: string | null };
  company: { name: string; logo: string | null };
  kpis: { totalKg: number; totalCo2: number; totalPickups: number };
  equivalencies: {
    trees: number;
    kmNotDriven: number;
    homesEnergized: number;
    smartphonesCharged: number;
  };
  materialDistribution: { name: string; value: number }[];
  monthlyCo2: { month: string; co2: number }[];
  certificates: {
    id: string;
    uniqueCode: string;
    name: string;
    totalKg: number;
    totalCo2: number;
    periodStart: string;
    periodEnd: string;
    status: string;
    createdAt: string;
  }[];
  pickups: PickupRecord[];
}

// Grouped pickup by date
interface PickupGroup {
  date: string;
  location: string | null;
  materials: { material: string; kg: number; co2: number }[];
  totalKg: number;
}

const MATERIAL_DOT_COLORS: Record<string, string> = {
  "Plástico PET": "bg-blue-500",
  "Plástico HDPE": "bg-blue-400",
  "Plástico LDPE": "bg-indigo-500",
  "Plástico PP": "bg-sky-500",
  "Plástico PS": "bg-blue-300",
  "Cartón": "bg-amber-500",
  "Vidrio": "bg-cyan-500",
  "Aluminio": "bg-slate-500",
  "Acero": "bg-gray-500",
  "Papel": "bg-yellow-500",
  "Madera": "bg-orange-500",
  "Electrónicos": "bg-purple-500",
  "RAE": "bg-violet-500",
  "TetraPak": "bg-teal-500",
  "Textil": "bg-pink-500",
  "Aceite vegetal": "bg-lime-500",
  "Orgánico": "bg-green-500",
  "Neumáticos": "bg-stone-500",
  "Baterías": "bg-red-500",
  "Escombros": "bg-neutral-500",
};

const MATERIAL_BADGE_COLORS: Record<string, string> = {
  "Plástico PET": "bg-blue-50 text-blue-700",
  "Plástico HDPE": "bg-blue-50 text-blue-600",
  "Plástico LDPE": "bg-indigo-50 text-indigo-700",
  "Plástico PP": "bg-sky-50 text-sky-700",
  "Plástico PS": "bg-blue-50 text-blue-500",
  "Cartón": "bg-amber-50 text-amber-700",
  "Vidrio": "bg-cyan-50 text-cyan-700",
  "Aluminio": "bg-slate-50 text-slate-700",
  "Acero": "bg-gray-50 text-gray-700",
  "Papel": "bg-yellow-50 text-yellow-700",
  "Madera": "bg-orange-50 text-orange-700",
  "Electrónicos": "bg-purple-50 text-purple-700",
  "RAE": "bg-violet-50 text-violet-700",
  "TetraPak": "bg-teal-50 text-teal-700",
  "Textil": "bg-pink-50 text-pink-700",
  "Aceite vegetal": "bg-lime-50 text-lime-700",
  "Orgánico": "bg-green-50 text-green-700",
  "Neumáticos": "bg-stone-50 text-stone-700",
  "Baterías": "bg-red-50 text-red-700",
  "Escombros": "bg-neutral-50 text-neutral-700",
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="h-56 bg-gradient-to-br from-[#3d6b4a] via-[#4a7c59] to-[#5a9a6b] animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 -mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-[#2c2c2c] mb-2">Enlace no disponible</h2>
        <p className="text-[#8a8a8a]">{message}</p>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("es-CL");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupPickups(pickups: PickupRecord[]): PickupGroup[] {
  const map = new Map<string, PickupGroup>();
  for (const p of pickups) {
    const dateKey = p.date.slice(0, 10);
    const key = `${dateKey}|${p.location || ""}`;
    if (!map.has(key)) {
      map.set(key, { date: p.date, location: p.location, materials: [], totalKg: 0 });
    }
    const group = map.get(key)!;
    const existing = group.materials.find((m) => m.material === p.material);
    if (existing) {
      existing.kg += p.kg;
      existing.co2 += p.co2;
    } else {
      group.materials.push({ material: p.material, kg: p.kg, co2: p.co2 });
    }
    group.totalKg += p.kg;
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default function PortalPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/portal/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Este enlace no es válido o ha expirado.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Error al cargar los datos. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) return <LoadingSkeleton />;
  if (error || !data) return <ErrorState message={error || "Error desconocido"} />;

  const { client, company, kpis, equivalencies, materialDistribution, monthlyCo2, certificates, pickups } = data;
  const pickupGroups = groupPickups(pickups || []);

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d5a3a] via-[#3d6b4a] to-[#4a8c5e]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative px-4 pt-10 pb-24 md:pt-14 md:pb-28">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt={company.name} className="h-11 w-11 rounded-xl bg-white/90 object-cover shadow-sm" />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-white/70 text-sm font-medium">{company.name}</span>
            </div>
            <h1 className="text-white text-2xl md:text-4xl font-bold tracking-tight mb-2">
              Portal de Impacto Ambiental
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                <p className="text-white/60 text-xs">Cliente</p>
                <p className="text-white font-semibold">{client.name}</p>
              </div>
              {client.rut && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                  <p className="text-white/60 text-xs">RUT</p>
                  <p className="text-white font-semibold">{client.rut}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-14 relative z-10 pb-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { icon: Package, label: "Total reciclado", value: formatNumber(Math.round(kpis.totalKg)), unit: "kilogramos", accent: "from-emerald-500 to-green-600" },
            { icon: Leaf, label: "CO₂ evitado", value: kpis.totalCo2.toFixed(2), unit: "toneladas de CO₂", accent: "from-teal-500 to-cyan-600" },
            { icon: Truck, label: "Retiros realizados", value: String(kpis.totalPickups), unit: "retiros totales", accent: "from-green-500 to-emerald-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6 border border-[#eae8e3]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.accent} flex items-center justify-center shadow-sm`}>
                  <kpi.icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <span className="text-sm text-[#8a8a8a]">{kpi.label}</span>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">{kpi.value}</p>
              <p className="text-sm text-[#a3a3a3] mt-0.5">{kpi.unit}</p>
            </div>
          ))}
        </div>

        {/* Eco-equivalencies */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eae8e3] p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-[#1a1a1a]">Tu impacto equivale a</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: TreePine, value: formatNumber(equivalencies.trees), label: "Árboles preservados", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Car, value: formatNumber(equivalencies.kmNotDriven), label: "Km no conducidos", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Home, value: String(equivalencies.homesEnergized), label: "Hogares energizados/año", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: Smartphone, value: formatNumber(equivalencies.smartphonesCharged), label: "Smartphones cargados", color: "text-purple-600", bg: "bg-purple-50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg}/50 rounded-xl p-4 text-center`}>
                <item.icon className={`w-7 h-7 ${item.color} mx-auto mb-2`} strokeWidth={1.5} />
                <p className="text-2xl font-bold text-[#1a1a1a]">{item.value}</p>
                <p className="text-xs text-[#8a8a8a] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Material Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#eae8e3] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#e8f0e9] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#4a7c59]" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a]">Materiales reciclados</h3>
            </div>
            {materialDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={materialDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "#8a8a8a" }} />
                  <Tooltip
                    formatter={(value) => [`${value} kg`, "Cantidad"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #eae8e3", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: "13px" }}
                  />
                  <Bar dataKey="value" fill="#4a7c59" radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[#a3a3a3] text-sm">Sin datos de materiales</div>
            )}
          </div>

          {/* Monthly CO2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#eae8e3] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#e8f0e9] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#4a7c59]" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a]">CO₂ evitado por mes (kg)</h3>
            </div>
            {monthlyCo2.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyCo2} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#8a8a8a" }}
                    tickFormatter={(v: string) => {
                      const [y, m] = v.split("-");
                      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                      return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#8a8a8a" }} />
                  <Tooltip
                    formatter={(value) => [`${value} kg CO₂`, "Evitado"]}
                    labelFormatter={(label) => {
                      const [y, m] = String(label).split("-");
                      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                      return `${months[parseInt(m) - 1]} ${y}`;
                    }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #eae8e3", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: "13px" }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#4a7c59" strokeWidth={2.5} fill="url(#co2Gradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[#a3a3a3] text-sm">Sin datos mensuales</div>
            )}
          </div>
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#eae8e3] p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#e8f0e9] flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-[#4a7c59]" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a]">Certificados disponibles</h3>
              <span className="ml-auto text-xs text-[#a3a3a3] bg-[#f5f3ef] px-2.5 py-1 rounded-full">{certificates.length}</span>
            </div>
            <div className="space-y-2.5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#fafaf8] rounded-xl border border-[#eae8e3] hover:border-[#d4e4d6] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#1a1a1a] truncate">{cert.name || `Certificado ${cert.uniqueCode}`}</p>
                      <p className="text-sm text-[#8a8a8a]">
                        {formatDate(cert.periodStart)} &middot; {Math.round(cert.totalKg).toLocaleString("es-CL")} kg
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/portal/${token}/certificate/${cert.id}/pdf`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white text-sm font-medium rounded-xl hover:bg-[#3d6a4b] transition-colors shrink-0 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pickups Timeline */}
        {pickupGroups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#eae8e3] p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#e8f0e9] flex items-center justify-center">
                <Truck className="w-4 h-4 text-[#4a7c59]" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a]">Historial de retiros</h3>
              <span className="ml-auto text-xs text-[#a3a3a3] bg-[#f5f3ef] px-2.5 py-1 rounded-full">{pickupGroups.length} retiros</span>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-3 bottom-3 w-px bg-[#e8e5df] hidden sm:block" />

              <div className="space-y-3">
                {pickupGroups.map((group, i) => (
                  <div key={i} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="hidden sm:flex flex-col items-center pt-4 flex-shrink-0">
                      <div className="w-[9px] h-[9px] rounded-full bg-[#4a7c59] ring-4 ring-white relative z-10" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-[#fafaf8] rounded-xl border border-[#eae8e3] p-4 hover:border-[#d4e4d6] transition-colors">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#a3a3a3]" />
                          <span className="text-sm font-medium text-[#1a1a1a] capitalize">{formatFullDate(group.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {group.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#8a8a8a]">
                              <MapPin className="w-3 h-3" />
                              {group.location}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[#4a7c59]">{group.totalKg.toLocaleString("es-CL")} kg</span>
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="flex flex-wrap gap-2">
                        {group.materials.map((m) => (
                          <span
                            key={m.material}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${MATERIAL_BADGE_COLORS[m.material] || "bg-gray-50 text-gray-600"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${MATERIAL_DOT_COLORS[m.material] || "bg-gray-400"}`} />
                            {m.material}
                            <span className="opacity-60">{m.kg.toLocaleString("es-CL")} kg</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-[#c3c3c3]">
            <Leaf className="w-4 h-4" />
            <span className="text-sm">
              Impulsado por <span className="font-medium text-[#8a8a8a]">CertiRecicla</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
