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
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="h-48 bg-gradient-to-r from-[#4a7c59] to-[#6b9a7b] animate-pulse" />
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[14px] h-32 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[14px] h-24 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[14px] h-64 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
      <div className="bg-white rounded-[14px] shadow-sm p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-[#2c2c2c] mb-2">
          Enlace no disponible
        </h2>
        <p className="text-[#6b6b6b]">{message}</p>
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
          setError(
            body.error || "Este enlace no es valido o ha expirado."
          );
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

  const { client, company, kpis, equivalencies, materialDistribution, monthlyCo2, certificates } = data;

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a7c59] to-[#6b9a7b] px-4 pt-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={company.name}
                className="h-10 w-10 rounded-full bg-white object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-white/80 text-sm">{company.name}</p>
              <h1 className="text-white text-xl md:text-2xl font-bold">
                Portal de Impacto Ambiental
              </h1>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[14px] p-4 inline-block">
            <p className="text-white/80 text-sm">Bienvenido,</p>
            <p className="text-white text-lg font-semibold">{client.name}</p>
            {client.rut && (
              <p className="text-white/60 text-sm">RUT: {client.rut}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                <Package className="w-5 h-5 text-[#4a7c59]" />
              </div>
              <span className="text-sm text-[#6b6b6b]">Total reciclado</span>
            </div>
            <p className="text-3xl font-bold text-[#2c2c2c]">
              {formatNumber(Math.round(kpis.totalKg))}
            </p>
            <p className="text-sm text-[#6b6b6b]">kilogramos</p>
          </div>

          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#4a7c59]" />
              </div>
              <span className="text-sm text-[#6b6b6b]">CO2 evitado</span>
            </div>
            <p className="text-3xl font-bold text-[#2c2c2c]">
              {kpis.totalCo2.toFixed(2)}
            </p>
            <p className="text-sm text-[#6b6b6b]">toneladas de CO2</p>
          </div>

          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                <Recycle className="w-5 h-5 text-[#4a7c59]" />
              </div>
              <span className="text-sm text-[#6b6b6b]">Retiros realizados</span>
            </div>
            <p className="text-3xl font-bold text-[#2c2c2c]">
              {kpis.totalPickups}
            </p>
            <p className="text-sm text-[#6b6b6b]">retiros totales</p>
          </div>
        </div>

        {/* Eco-equivalencies */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-[14px] shadow-sm p-4 text-center">
            <TreePine className="w-8 h-8 text-[#4a7c59] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c2c2c]">
              {formatNumber(equivalencies.trees)}
            </p>
            <p className="text-xs text-[#6b6b6b]">arboles equivalentes</p>
          </div>
          <div className="bg-white rounded-[14px] shadow-sm p-4 text-center">
            <Car className="w-8 h-8 text-[#4a7c59] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c2c2c]">
              {formatNumber(equivalencies.kmNotDriven)}
            </p>
            <p className="text-xs text-[#6b6b6b]">km no conducidos</p>
          </div>
          <div className="bg-white rounded-[14px] shadow-sm p-4 text-center">
            <Home className="w-8 h-8 text-[#4a7c59] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c2c2c]">
              {equivalencies.homesEnergized}
            </p>
            <p className="text-xs text-[#6b6b6b]">hogares energizados/ano</p>
          </div>
          <div className="bg-white rounded-[14px] shadow-sm p-4 text-center">
            <Smartphone className="w-8 h-8 text-[#4a7c59] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c2c2c]">
              {formatNumber(equivalencies.smartphonesCharged)}
            </p>
            <p className="text-xs text-[#6b6b6b]">smartphones cargados</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Material Distribution */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#4a7c59]" />
              <h3 className="font-semibold text-[#2c2c2c]">
                Materiales reciclados
              </h3>
            </div>
            {materialDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={materialDistribution}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12, fill: "#6b6b6b" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} kg`, "Cantidad"]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#4a7c59"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[#6b6b6b]">
                Sin datos de materiales
              </div>
            )}
          </div>

          {/* Monthly CO2 */}
          <div className="bg-white rounded-[14px] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#4a7c59]" />
              <h3 className="font-semibold text-[#2c2c2c]">
                CO2 evitado por mes (kg)
              </h3>
            </div>
            {monthlyCo2.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={monthlyCo2}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="co2Gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#4a7c59"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#4a7c59"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#6b6b6b" }}
                    tickFormatter={(v: string) => {
                      const [y, m] = v.split("-");
                      const months = [
                        "Ene",
                        "Feb",
                        "Mar",
                        "Abr",
                        "May",
                        "Jun",
                        "Jul",
                        "Ago",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dic",
                      ];
                      return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b6b" }} />
                  <Tooltip
                    formatter={(value) => [
                      `${value} kg CO2`,
                      "Evitado",
                    ]}
                    labelFormatter={(label) => {
                      const [y, m] = String(label).split("-");
                      const months = [
                        "Enero",
                        "Febrero",
                        "Marzo",
                        "Abril",
                        "Mayo",
                        "Junio",
                        "Julio",
                        "Agosto",
                        "Septiembre",
                        "Octubre",
                        "Noviembre",
                        "Diciembre",
                      ];
                      return `${months[parseInt(m) - 1]} ${y}`;
                    }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="co2"
                    stroke="#4a7c59"
                    strokeWidth={2}
                    fill="url(#co2Gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[#6b6b6b]">
                Sin datos mensuales
              </div>
            )}
          </div>
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-[14px] shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-[#4a7c59]" />
              <h3 className="font-semibold text-[#2c2c2c]">
                Certificados disponibles
              </h3>
            </div>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f9f8f5] rounded-[10px] border border-[#e8e5df]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2c2c2c] truncate">
                      {cert.name || `Certificado ${cert.uniqueCode}`}
                    </p>
                    <p className="text-sm text-[#6b6b6b]">
                      {formatDate(cert.periodStart)} -{" "}
                      {formatDate(cert.periodEnd)} &middot;{" "}
                      {Math.round(cert.totalKg).toLocaleString("es-CL")} kg
                      &middot; {(cert.totalCo2 / 1000).toFixed(2)} ton CO2
                    </p>
                  </div>
                  <a
                    href={`/api/portal/${token}/certificate/${cert.id}/pdf`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a7c59] text-white text-sm font-medium rounded-[10px] hover:bg-[#3d6a4b] transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-[#a3a3a3]">
            <Leaf className="w-4 h-4" />
            <span className="text-sm">
              Impulsado por{" "}
              <span className="font-medium text-[#6b6b6b]">CertiRecicla</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
