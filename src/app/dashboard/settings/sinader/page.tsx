"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Calendar, Filter, Loader2, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MONTHS = [
  { value: "", label: "Todo el año" },
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

interface ClientOption {
  id: string;
  name: string;
}

export default function SinaderExportPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Check plan access
  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((data) => setHasAccess(data.limits?.sinaderExport ?? false))
      .catch(() => setHasAccess(false));
  }, []);

  // Fetch clients for filter
  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch record count for preview
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
      if (!response.ok) {
        throw new Error("Error al exportar");
      }

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

  if (hasAccess === false) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="flex items-center gap-1.5 text-sm text-sage-800/50 hover:text-sage-800 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a reportes
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Exportación SINADER no disponible</p>
            <p className="text-xs text-amber-700 mt-1">
              La exportación SINADER está disponible en el plan Business. Actualiza tu plan para acceder.
            </p>
            <a href="/dashboard/billing" className="inline-block mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900">
              Ver planes
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="flex items-center gap-1.5 text-sm text-sage-800/50 hover:text-sage-800 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a reportes
        </button>
        <div className="flex items-center gap-3 mb-1">
          <FileSpreadsheet className="h-6 w-6 text-sage-500" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl text-sage-800">Exportar para SINADER</h1>
        </div>
        <p className="text-sm text-sage-800/40">
          Genera un archivo CSV compatible con el Sistema Nacional de Declaración de Residuos (SINADER)
          del Ministerio del Medio Ambiente de Chile. Este formato incluye códigos LER, datos del
          generador y gestor de residuos.
        </p>
      </div>

      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-5">
        {/* Year selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-sage-800">
            <Calendar className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
            Año
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-sage-800">
            <Calendar className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
            Mes (opcional)
          </label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todo el año" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value || "all"} value={m.value || "all"}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client filter */}
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
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="bg-sand-100 border border-sand-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-sage-800/60">Registros a exportar</span>
          {loadingCount ? (
            <Loader2 className="h-4 w-4 animate-spin text-sage-500" />
          ) : (
            <Badge
              variant="secondary"
              className="bg-sage-500/10 text-sage-600 border-sage-500/20"
            >
              {recordCount !== null ? recordCount : "—"}
            </Badge>
          )}
        </div>
      </div>

      {/* Download button */}
      <Button
        onClick={handleDownload}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        Descargar CSV para SINADER
      </Button>

      {/* Info box */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-medium text-emerald-700">Sobre el formato SINADER</p>
        <p className="text-[11px] text-emerald-600/70 leading-relaxed">
          El archivo CSV generado incluye las columnas requeridas por SINADER: fecha, RUT del
          generador, tipo de residuo con código LER, cantidad en kg, tratamiento aplicado y datos
          del gestor. Revisa los datos antes de subir al portal oficial del Ministerio del Medio
          Ambiente.
        </p>
      </div>
    </div>
  );
}
