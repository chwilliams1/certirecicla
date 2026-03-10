"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileBarChart,
  Download,
  Calendar,
  User,
  Loader2,
  FileSpreadsheet,
  Filter,
  Lock,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Recycle,
  Trees,
  Car,
  Zap,
  Smartphone,
  Trophy,
  Building2,
  Mail,
  Trash2,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGate } from "@/components/permission-gate";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─── Types ─── */

interface PlanData {
  limits: {
    fullReports: boolean;
    sinaderExport: boolean;
  };
}

interface ClientOption {
  id: string;
  name: string;
  parentClient?: { name: string } | null;
}

type PeriodType = "monthly" | "quarterly" | "semiannual" | "annual" | "custom";

interface ReportData {
  isConsolidated: boolean;
  totalKg: number;
  totalCo2: number;
  totalPickups: number;
  waterSaved: number;
  equivalencies: {
    trees: number;
    kmNotDriven: number;
    homesEnergized: number;
    smartphonesCharged: number;
  };
  materials: { material: string; kg: number; co2: number; percentage: number }[];
  monthlyTrend: { month: string; kg: number; co2: number }[];
  ranking?: { clientId: string; clientName: string; kg: number; co2: number; percentage: number }[];
  comparison?: {
    prevTotalKg: number;
    prevTotalCo2: number;
    prevTotalPickups: number;
    prevWaterSaved: number;
    kgChange: number | null;
    co2Change: number | null;
    pickupsChange: number | null;
    waterChange: number | null;
    prevMonthlyTrend: { month: string; kg: number; co2: number }[];
  };
  branches?: { branchId: string; branchName: string; kg: number; co2: number; percentage: number }[];
}

interface ScheduledReport {
  id: string;
  clientId: string | null;
  frequency: string;
  emails: string;
  active: boolean;
  nextSendAt: string;
  lastSentAt: string | null;
  client?: { name: string; parentClient?: { name: string } | null } | null;
}

/* ─── Constants ─── */

const PERIOD_LABELS: Record<PeriodType, string> = {
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
  custom: "Personalizado",
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const SINADER_MONTHS = [
  { value: "", label: "Todo el ano" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const PIE_COLORS = [
  "#4a6b4e", "#6b8f6e", "#8fb392", "#b3d4b6", "#d6f0d9",
  "#3d5940", "#527a56", "#7aa47e", "#9dc4a0", "#c0e0c3",
];

/* ─── Helpers ─── */

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => current - i);
}

function computePeriod(
  type: PeriodType,
  year: number,
  month: number,
  quarter: number,
  semester: number,
  customStart: string,
  customEnd: string
): { start: string; end: string; label: string } | null {
  switch (type) {
    case "monthly": {
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
      return { start, end, label: `${MONTHS[month - 1]} ${year}` };
    }
    case "quarterly": {
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = startMonth + 2;
      const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(year, endMonth, 0).getDate();
      const end = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
      return { start, end, label: `Q${quarter} ${year}` };
    }
    case "semiannual": {
      const startMonth = semester === 1 ? 1 : 7;
      const endMonth = semester === 1 ? 6 : 12;
      const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(year, endMonth, 0).getDate();
      const end = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
      return { start, end, label: `S${semester} ${year}` };
    }
    case "annual":
      return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Anual ${year}` };
    case "custom":
      if (!customStart || !customEnd) return null;
      return { start: customStart, end: customEnd, label: "Periodo personalizado" };
    default:
      return null;
  }
}

function formatNum(n: number): string {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 1 });
}

function formatMonthLabel(m: string): string {
  const [, mo] = m.split("-");
  return MONTH_SHORT[parseInt(mo, 10) - 1] || m;
}

/* ─── Change Indicator Component ─── */
function ChangeIndicator({ change }: { change: number | null | undefined }) {
  if (change === null || change === undefined) return null;

  const isPositive = change > 0;
  const isZero = change === 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isZero
          ? "text-sage-800/40"
          : isPositive
          ? "text-emerald-600"
          : "text-red-500"
      }`}
    >
      {isZero ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isZero ? "Sin cambio" : `${change > 0 ? "+" : ""}${change}%`}
    </span>
  );
}

/* ─── SINADER Tab ─── */
function SinaderTab({ planData }: { planData: PlanData | null }) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string; parentClient?: { name: string } | null }[]>([]);
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data.map((c: { id: string; name: string; parentClient?: { name: string } | null }) => ({ id: c.id, name: c.name, parentClient: c.parentClient })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingCount(true);
    const params = new URLSearchParams({ year });
    if (month) params.set("month", month);
    if (clientId) params.set("clientId", clientId);

    fetch(`/api/pickups?${params.toString()}&countOnly=true`)
      .then((r) => r.json())
      .then((data) => {
        setRecordCount(typeof data.count === "number" ? data.count : null);
      })
      .catch(() => setRecordCount(null))
      .finally(() => setLoadingCount(false));
  }, [year, month, clientId]);

  async function handleDownload() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year });
      if (month) params.set("month", month);
      if (clientId) params.set("clientId", clientId);

      const response = await fetch(`/api/export/sinader?${params.toString()}`);
      if (!response.ok) throw new Error("Error al exportar");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = month
        ? `sinader_${year}_${month.padStart(2, "0")}.csv`
        : `sinader_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  }

  if (planData && !planData.limits.sinaderExport) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Exportacion SINADER no disponible</p>
          <p className="text-xs text-amber-700 mt-1">
            La exportacion en formato SINADER esta disponible en el plan Business.
          </p>
          <a href="/dashboard/billing" className="inline-block mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900">
            Ver planes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-5">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-sage-800">
            <Calendar className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
            Ano
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-sage-800">
            <Calendar className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
            Mes (opcional)
          </label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todo el ano" />
            </SelectTrigger>
            <SelectContent>
              {SINADER_MONTHS.map((m) => (
                <SelectItem key={m.value || "all"} value={m.value || "all"}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-sage-800">
            <Filter className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
            Cliente (opcional)
          </label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.parentClient ? `${c.parentClient.name} - ${c.name}` : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-sand-100 border border-sand-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-sage-800/60">Registros a exportar</span>
          {loadingCount ? (
            <Loader2 className="h-4 w-4 animate-spin text-sage-500" />
          ) : (
            <Badge variant="secondary" className="bg-sage-500/10 text-sage-600 border-sage-500/20">
              {recordCount !== null ? recordCount : "—"}
            </Badge>
          )}
        </div>
      </div>

      <Button onClick={handleDownload} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        Descargar CSV para SINADER
      </Button>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-medium text-emerald-700">Sobre el formato SINADER</p>
        <p className="text-[11px] text-emerald-600/70 leading-relaxed">
          El archivo CSV generado incluye las columnas requeridas por SINADER: fecha, RUT del
          generador, tipo de residuo con codigo LER, cantidad en kg, tratamiento aplicado y datos
          del gestor. Revisa los datos antes de subir al portal oficial del Ministerio del Medio
          Ambiente.
        </p>
      </div>
    </div>
  );
}

/* ─── Schedule Tab ─── */
function ScheduleTab({
  clients,
  planData,
}: {
  clients: ClientOption[];
  planData: PlanData | null;
}) {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("all");
  const [frequency, setFrequency] = useState("monthly");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = useCallback(() => {
    fetch("/api/reports/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSchedules(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  async function handleCreate() {
    const emails = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
    if (emails.length === 0) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, frequency, emails }),
      });
      if (res.ok) {
        setShowForm(false);
        setEmailInput("");
        loadSchedules();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Error al crear el reporte programado");
      }
    } catch {
      setError("Error de conexión al crear el reporte programado");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/reports/schedule?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Error al eliminar el reporte programado");
      }
      loadSchedules();
    } catch {
      setError("Error de conexión al eliminar el reporte programado");
    }
  }

  if (planData && !planData.limits.fullReports) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Reportes automaticos no disponibles</p>
          <p className="text-xs text-amber-700 mt-1">
            Los reportes automaticos por email estan disponibles desde el plan Profesional.
          </p>
          <a href="/dashboard/billing" className="inline-block mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900">
            Actualizar plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-sage-800">Reportes Programados</h3>
          <p className="text-xs text-sage-800/40 mt-0.5">
            Programa el envio automatico de reportes por email
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nuevo
        </Button>
      </div>

      {showForm && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-sage-800">Cliente</label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.parentClient ? `${c.parentClient.name} - ${c.name}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-sage-800">Frecuencia</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-sage-800">
              Destinatarios (separados por coma)
            </label>
            <Input
              placeholder="email@ejemplo.com, otro@ejemplo.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} size="sm">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Mail className="h-3.5 w-3.5 mr-1" />}
              Programar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-sage-400" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-8 text-center">
          <Clock className="h-8 w-8 text-sage-300 mx-auto mb-2" />
          <p className="text-sm text-sage-800/50">No hay reportes programados</p>
          <p className="text-xs text-sage-800/30 mt-1">
            Crea uno para recibir reportes automaticamente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const emails: string[] = JSON.parse(s.emails);
            const clientName = s.client
              ? s.client.parentClient
                ? `${s.client.parentClient.name} - ${s.client.name}`
                : s.client.name
              : "Todos los clientes";

            return (
              <div
                key={s.id}
                className="bg-sand-50 border border-sand-300 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-sage-800">{clientName}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {s.frequency === "monthly" ? "Mensual" : "Trimestral"}
                    </Badge>
                  </div>
                  <p className="text-xs text-sage-800/40">
                    {emails.join(", ")}
                  </p>
                  <p className="text-[10px] text-sage-800/30">
                    Proximo envio: {new Date(s.nextSendAt).toLocaleDateString("es-CL")}
                    {s.lastSentAt && ` · Ultimo: ${new Date(s.lastSentAt).toLocaleDateString("es-CL")}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReportsPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [semester, setSemester] = useState(1);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [clientsLoading, setClientsLoading] = useState(true);
  const [planData, setPlanData] = useState<PlanData | null>(null);

  // Report data state
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // Download states
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then(setPlanData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.clients || [];
        setClients(list);
      })
      .finally(() => setClientsLoading(false));
  }, []);

  // Auto-load report data when filters change
  useEffect(() => {
    setReportData(null);
    setDataError("");
    const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
    if (!clientId || !period) return;

    const timeout = setTimeout(() => {
      setDataLoading(true);
      const params = new URLSearchParams({
        clientId,
        periodStart: period.start,
        periodEnd: period.end,
      });
      fetch(`/api/reports/data?${params}`)
        .then((r) => {
          if (!r.ok) return r.json().then((e) => Promise.reject(e));
          return r.json();
        })
        .then(setReportData)
        .catch((err) => {
          if (err?.error) setDataError(err.error);
        })
        .finally(() => setDataLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [clientId, periodType, year, month, quarter, semester, customStart, customEnd]);

  async function handleDownloadPdf() {
    const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
    if (!clientId || !period) return;

    setPdfLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId,
          periodStart: period.start,
          periodEnd: period.end,
          periodLabel: period.label,
        }),
      });
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${period.label.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadExcel() {
    const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
    if (!clientId || !period) return;

    setExcelLoading(true);
    try {
      const res = await fetch("/api/reports/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          periodStart: period.start,
          periodEnd: period.end,
          periodLabel: period.label,
        }),
      });
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${period.label.replace(/\s+/g, "-")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExcelLoading(false);
    }
  }

  const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
  const yearOptions = getYearOptions();

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-sage-800">Reportes</h1>
        <p className="text-sm text-sage-800/40">
          Genera reportes de impacto y exportaciones para tus clientes
        </p>
      </div>

      <Tabs defaultValue="impact" className="space-y-6">
        <TabsList>
          <TabsTrigger value="impact" className="flex items-center gap-1.5">
            <FileBarChart className="h-3.5 w-3.5" />
            Reportes de Impacto
          </TabsTrigger>
          <TabsTrigger value="sinader" className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Exportar SINADER
          </TabsTrigger>
          {/* TODO: Habilitar cuando se implemente programación de envíos
          <TabsTrigger value="schedule" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Programados
          </TabsTrigger>
          */}
        </TabsList>

        <TabsContent value="impact" className="space-y-6">
          {/* Filters card */}
          <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-5">
            {/* Client selector with "Todos" option */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-sage-800 flex items-center gap-2">
                <User className="h-4 w-4 text-sage-500" />
                Cliente
              </label>
              {clientsLoading ? (
                <div className="skeleton h-10 w-full rounded-lg" />
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-sage-500" />
                        Todos los clientes
                      </span>
                    </SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.parentClient ? `${c.parentClient.name} - ${c.name}` : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Period type selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-sage-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sage-500" />
                Tipo de periodo
              </label>
              <Select
                value={periodType}
                onValueChange={(v) => setPeriodType(v as PeriodType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABELS) as PeriodType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {PERIOD_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period-specific selectors */}
            <div className="space-y-2">
              {periodType === "monthly" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-sage-800/50 mb-1 block">Mes</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {periodType === "quarterly" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-sage-800/50 mb-1 block">Trimestre</label>
                    <Select value={String(quarter)} onValueChange={(v) => setQuarter(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1 (Ene - Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Abr - Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct - Dic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {periodType === "semiannual" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-sage-800/50 mb-1 block">Semestre</label>
                    <Select value={String(semester)} onValueChange={(v) => setSemester(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">S1 (Ene - Jun)</SelectItem>
                        <SelectItem value="2">S2 (Jul - Dic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {periodType === "annual" && (
                <div className="w-32">
                  <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                  <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {periodType === "custom" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-sage-800/50 mb-1 block">Desde</label>
                    <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-sage-800/50 mb-1 block">Hasta</label>
                    <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading state */}
          {dataLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-sage-400" />
              <span className="ml-2 text-sm text-sage-800/40">Cargando datos...</span>
            </div>
          )}

          {/* Error state */}
          {dataError && !dataLoading && (
            <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-8 text-center">
              <FileBarChart className="h-8 w-8 text-sage-300 mx-auto mb-2" />
              <p className="text-sm text-sage-800/50">{dataError}</p>
            </div>
          )}

          {/* Plan gate */}
          {planData && !planData.limits.fullReports && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Reportes avanzados no disponibles</p>
                <p className="text-xs text-amber-700 mt-1">
                  Los reportes avanzados con desglose por material, equivalencias ecologicas y tendencias estan disponibles desde el plan Profesional.
                </p>
                <a href="/dashboard/billing" className="inline-block mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900">
                  Actualizar plan
                </a>
              </div>
            </div>
          )}

          {/* ─── Dashboard Visual ─── */}
          {reportData && !dataLoading && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  icon={<Recycle className="h-5 w-5 text-emerald-600" />}
                  label="kg Reciclados"
                  value={formatNum(reportData.totalKg)}
                  change={reportData.comparison?.kgChange}
                />
                <KpiCard
                  icon={<Trees className="h-5 w-5 text-green-600" />}
                  label="kg CO2 Evitados"
                  value={formatNum(reportData.totalCo2)}
                  change={reportData.comparison?.co2Change}
                />
                <KpiCard
                  icon={<Car className="h-5 w-5 text-sage-600" />}
                  label="Retiros"
                  value={String(reportData.totalPickups)}
                  change={reportData.comparison?.pickupsChange}
                />
                <KpiCard
                  icon={<Droplets className="h-5 w-5 text-blue-500" />}
                  label="Litros Agua"
                  value={formatNum(reportData.waterSaved)}
                  change={reportData.comparison?.waterChange}
                />
              </div>

              {/* Eco-equivalencies */}
              <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                <h3 className="text-sm font-medium text-sage-800 mb-4">Equivalencias Ecologicas</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <EqCard
                    icon={<Trees className="h-5 w-5 text-green-600" />}
                    value={formatNum(reportData.equivalencies.trees)}
                    label="Arboles preservados"
                  />
                  <EqCard
                    icon={<Car className="h-5 w-5 text-sage-600" />}
                    value={formatNum(reportData.equivalencies.kmNotDriven)}
                    label="Km no conducidos"
                  />
                  <EqCard
                    icon={<Zap className="h-5 w-5 text-amber-500" />}
                    value={formatNum(reportData.equivalencies.homesEnergized)}
                    label="Dias hogar energizado"
                  />
                  <EqCard
                    icon={<Smartphone className="h-5 w-5 text-blue-500" />}
                    value={formatNum(reportData.equivalencies.smartphonesCharged)}
                    label="Smartphones cargados"
                  />
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Material breakdown bar chart */}
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                  <h3 className="text-sm font-medium text-sage-800 mb-4">Desglose por Material</h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, reportData.materials.length * 32)}>
                    <BarChart data={reportData.materials} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="material"
                        width={110}
                        tick={{ fontSize: 11, fill: "#7c9a82" }}
                      />
                      <Tooltip
                        formatter={(value) => [`${formatNum(Number(value))} kg`, "Cantidad"]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #d4e4d6",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="kg" fill="#4a6b4e" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly CO2 trend */}
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                  <h3 className="text-sm font-medium text-sage-800 mb-4">
                    Tendencia CO2 Evitado
                    {reportData.comparison && (
                      <span className="text-[10px] text-sage-800/30 ml-2 font-normal">
                        Linea punteada = periodo anterior
                      </span>
                    )}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={buildTrendData(reportData)}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4a6b4e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4a6b4e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7c9a82" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#7c9a82" }} />
                      <Tooltip
                        formatter={(value, name) => [
                          `${formatNum(Number(value))} kg`,
                          name === "co2" ? "CO2 actual" : "CO2 anterior",
                        ]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #d4e4d6",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="co2"
                        stroke="#4a6b4e"
                        strokeWidth={2.5}
                        fill="url(#co2Grad)"
                        dot={{ r: 3, fill: "#4a6b4e" }}
                      />
                      {reportData.comparison && (
                        <Area
                          type="monotone"
                          dataKey="prevCo2"
                          stroke="#4a6b4e"
                          strokeWidth={1.5}
                          strokeDasharray="6 4"
                          fill="none"
                          dot={false}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Phase 2: Client ranking (consolidated mode) */}
              {reportData.isConsolidated && reportData.ranking && reportData.ranking.length > 0 && (
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                  <h3 className="text-sm font-medium text-sage-800 mb-4 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Ranking de Clientes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-sage-800/50 border-b border-sand-200">
                          <th className="text-left py-2 pr-2 w-10">#</th>
                          <th className="text-left py-2 pr-2">Cliente</th>
                          <th className="text-right py-2 pr-2">kg Reciclados</th>
                          <th className="text-right py-2 pr-2">CO2 (kg)</th>
                          <th className="text-right py-2">% del Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.ranking.map((r, i) => (
                          <tr key={r.clientId} className="border-b border-sand-100 last:border-0">
                            <td className="py-2.5 pr-2">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                  i === 0
                                    ? "bg-amber-100 text-amber-700"
                                    : i === 1
                                    ? "bg-gray-100 text-gray-600"
                                    : i === 2
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-sand-100 text-sage-600"
                                }`}
                              >
                                {i + 1}
                              </span>
                            </td>
                            <td className="py-2.5 pr-2 font-medium text-sage-800">{r.clientName}</td>
                            <td className="py-2.5 pr-2 text-right text-sage-800/70">{formatNum(r.kg)}</td>
                            <td className="py-2.5 pr-2 text-right text-sage-800/70">{formatNum(r.co2)}</td>
                            <td className="py-2.5 text-right">
                              <Badge variant="secondary" className="text-[10px] bg-sage-100 text-sage-600">
                                {r.percentage}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Phase 4: Branch breakdown */}
              {reportData.branches && reportData.branches.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Branch table */}
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <h3 className="text-sm font-medium text-sage-800 mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-sage-500" />
                      Desglose por Sucursal
                    </h3>
                    <div className="space-y-2">
                      {reportData.branches.map((b) => (
                        <div
                          key={b.branchId}
                          className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-sage-800">{b.branchName}</p>
                            <p className="text-xs text-sage-800/40">
                              {formatNum(b.co2)} kg CO2
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-sage-800">{formatNum(b.kg)} kg</p>
                            <Badge variant="secondary" className="text-[10px] bg-sage-100 text-sage-600">
                              {b.percentage}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Branch pie chart */}
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <h3 className="text-sm font-medium text-sage-800 mb-4">Distribucion por Sucursal</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reportData.branches.map((b) => ({
                            name: b.branchName,
                            value: b.kg,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {reportData.branches.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${formatNum(Number(value))} kg`, "Reciclado"]}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #d4e4d6",
                            fontSize: 12,
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Download buttons */}
              <PermissionGate permission="reports:generate">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex-1"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Descargar PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadExcel}
                    disabled={excelLoading}
                    className="flex-1"
                  >
                    {excelLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Descargar Excel
                  </Button>
                </div>
              </PermissionGate>
            </>
          )}

          {/* Empty state when no client selected */}
          {!clientId && !dataLoading && (
            <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-8 text-center">
              <FileBarChart className="h-8 w-8 text-sage-300 mx-auto mb-2" />
              <p className="text-sm text-sage-800/50">Selecciona un cliente y periodo para ver el reporte</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sinader">
          <SinaderTab planData={planData} />
        </TabsContent>

        {/* TODO: Habilitar cuando se implemente programación de envíos
        <TabsContent value="schedule">
          <ScheduleTab clients={clients} planData={planData} />
        </TabsContent>
        */}
      </Tabs>
    </div>
  );
}

/* ─── KPI Card Component ─── */
function KpiCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number | null;
}) {
  return (
    <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 space-y-2">
      <div className="flex items-center justify-between">
        {icon}
        <ChangeIndicator change={change} />
      </div>
      <p className="text-2xl font-bold text-sage-800">{value}</p>
      <p className="text-xs text-sage-800/40">{label}</p>
    </div>
  );
}

/* ─── Equivalency Card ─── */
function EqCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/50 rounded-xl p-3 border border-sand-200">
      <div className="h-10 w-10 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-sage-800">{value}</p>
        <p className="text-[10px] text-sage-800/40">{label}</p>
      </div>
    </div>
  );
}

/* ─── Trend Data Builder (for overlaying previous period) ─── */
function buildTrendData(data: ReportData) {
  const currentTrend = data.monthlyTrend.map((m) => ({
    label: formatMonthLabel(m.month),
    co2: m.co2,
    prevCo2: undefined as number | undefined,
  }));

  if (data.comparison?.prevMonthlyTrend) {
    const prevTrend = data.comparison.prevMonthlyTrend;
    // Align by index (since periods have same duration)
    for (let i = 0; i < prevTrend.length && i < currentTrend.length; i++) {
      currentTrend[i].prevCo2 = prevTrend[i].co2;
    }
  }

  return currentTrend;
}
