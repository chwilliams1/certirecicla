"use client";

import { useEffect, useState } from "react";
import { FileBarChart, Download, Calendar, User, Loader2 } from "lucide-react";
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
import { PermissionGate } from "@/components/permission-gate";
import { Lock } from "lucide-react";

interface PlanData {
  limits: {
    fullReports: boolean;
  };
}

interface ClientOption {
  id: string;
  name: string;
  parentClient?: { name: string } | null;
}

type PeriodType = "monthly" | "quarterly" | "semiannual" | "annual" | "custom";

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

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 5; y--) {
    years.push(y);
  }
  return years;
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
    case "annual": {
      return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Anual ${year}` };
    }
    case "custom": {
      if (!customStart || !customEnd) return null;
      return { start: customStart, end: customEnd, label: "Periodo personalizado" };
    }
    default:
      return null;
  }
}

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
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);

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

  // Fetch record count preview when client or period changes
  useEffect(() => {
    setRecordCount(null);
    const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
    if (!clientId || !period) return;

    const timeout = setTimeout(() => {
      setPreviewLoading(true);
      const params = new URLSearchParams({
        clientId,
        startDate: period.start,
        endDate: period.end,
      });
      fetch(`/api/pickups?${params}`)
        .then((r) => r.json())
        .then((data) => {
          const records = Array.isArray(data) ? data : data.records || [];
          setRecordCount(records.length);
        })
        .catch(() => setRecordCount(null))
        .finally(() => setPreviewLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [clientId, periodType, year, month, quarter, semester, customStart, customEnd]);

  async function handleGenerate() {
    setError("");
    const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
    if (!clientId || !period) {
      setError("Selecciona un cliente y un periodo valido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          periodStart: period.start,
          periodEnd: period.end,
          periodLabel: period.label,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error generando reporte");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${period.label.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error de conexion al generar el reporte.");
    } finally {
      setLoading(false);
    }
  }

  const period = computePeriod(periodType, year, month, quarter, semester, customStart, customEnd);
  const canGenerate = clientId && period && !loading;
  const yearOptions = getYearOptions();

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-sage-800">Reportes de Impacto</h1>
        <p className="text-sm text-sage-800/40">
          Genera reportes periodicos de impacto ambiental para tus clientes
        </p>
      </div>

      {/* Main card */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-6">
        {/* Client selector */}
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
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.parentClient ? `${c.parentClient.name} > ${c.name}` : c.name}
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
                <Select
                  value={String(month)}
                  onValueChange={(v) => setMonth(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
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
                <Select
                  value={String(quarter)}
                  onValueChange={(v) => setQuarter(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
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
                <Select
                  value={String(semester)}
                  onValueChange={(v) => setSemester(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">S1 (Ene - Jun)</SelectItem>
                    <SelectItem value="2">S2 (Jul - Dic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <label className="text-xs text-sage-800/50 mb-1 block">Ano</label>
                <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {periodType === "custom" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-sage-800/50 mb-1 block">Desde</label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-sage-800/50 mb-1 block">Hasta</label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview section */}
        {clientId && period && (
          <div className="bg-sage-50/50 border border-sage-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <FileBarChart className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-sage-800">{period.label}</p>
                <p className="text-xs text-sage-800/40">
                  {new Date(period.start).toLocaleDateString("es-CL")} -{" "}
                  {new Date(period.end).toLocaleDateString("es-CL")}
                </p>
              </div>
            </div>
            <div>
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-sage-400" />
              ) : recordCount !== null ? (
                <Badge
                  className={
                    recordCount > 0
                      ? "bg-sage-100 text-sage-600"
                      : "bg-sand-200 text-sage-800/60"
                  }
                >
                  {recordCount} {recordCount === 1 ? "registro" : "registros"}
                </Badge>
              ) : null}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Generate button */}
        {planData && !planData.limits.fullReports ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Reportes avanzados no disponibles</p>
              <p className="text-xs text-amber-700 mt-1">
                Los reportes avanzados con desglose por material, equivalencias ecologicas y tendencias estan disponibles desde el plan Profesional.
              </p>
              <a
                href="/dashboard/billing"
                className="inline-block mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900"
              >
                Actualizar plan
              </a>
            </div>
          </div>
        ) : (
          <PermissionGate permission="reports:generate">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando reporte...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </PermissionGate>
        )}
      </div>

      {/* Info card */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
        <h3 className="text-sm font-medium text-sage-800 mb-2">Sobre los reportes</h3>
        <ul className="text-xs text-sage-800/50 space-y-1.5">
          <li>Los reportes incluyen un resumen de KPIs, desglose por material, equivalencias ecologicas y tendencia mensual.</li>
          <li>Se generan en formato PDF listo para compartir con tus clientes.</li>
          <li>Los datos se calculan a partir de los registros de reciclaje del periodo seleccionado.</li>
        </ul>
      </div>
    </div>
  );
}
