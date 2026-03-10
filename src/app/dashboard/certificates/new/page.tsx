"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileCheck,
  Loader2,
  AlertCircle,
  Package,
  CalendarDays,
  Users,
  CheckCircle,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Colores centralizados en src/lib/material-colors.ts

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type Step = "select" | "preview" | "creating" | "done";

interface ClientItem {
  id: string;
  name: string;
  parentClientId: string | null;
  branches?: ClientItem[];
  _count: { records: number };
}

interface CertPreview {
  clientId: string;
  clientName: string;
  parentClientName: string | null;
  recordCount: number;
  pickups: Array<{
    date: string;
    location: string | null;
    materials: Array<{ material: string; kg: number }>;
  }>;
  materials: Record<string, { kg: number; co2: number }>;
  totalKg: number;
  totalCo2: number;
  existingCertStatus: string | null;
}

interface CreatedCert {
  id: string;
  uniqueCode: string;
  clientName: string;
  totalKg: number;
  totalCo2: number;
  status: string;
}

export default function NewCertificatePage() {
  return (
    <Suspense>
      <NewCertificateContent />
    </Suspense>
  );
}

function NewCertificateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("select");
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(() => {
    const preselected = searchParams.get("clientId");
    return preselected ? new Set([preselected]) : new Set();
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<CertPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createdCerts, setCreatedCerts] = useState<CreatedCert[]>([]);
  const [error, setError] = useState("");
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  // Restore created certs from sessionStorage on mount (for back navigation)
  useEffect(() => {
    const saved = sessionStorage.getItem("createdCerts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedMonth(parsed.month);
        setSelectedYear(parsed.year);
        // Refresh cert statuses from the server
        Promise.all(
          parsed.certs.map((c: CreatedCert) =>
            fetch(`/api/certificates/${c.id}`).then((r) => r.ok ? r.json() : null)
          )
        ).then((results) => {
          const updated = parsed.certs.map((c: CreatedCert, i: number) => {
            const fresh = results[i];
            return fresh ? { ...c, status: fresh.status } : c;
          });
          setCreatedCerts(updated);
          // Update sessionStorage with fresh statuses
          sessionStorage.setItem("createdCerts", JSON.stringify({
            certs: updated,
            month: parsed.month,
            year: parsed.year,
          }));
        });
        setCreatedCerts(parsed.certs);
        setStep("done");
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  // Period dates
  const periodStart = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  }, [selectedYear, selectedMonth]);

  const periodEnd = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;
  }, [selectedYear, selectedMonth]);

  // Available years (current and previous 2)
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, []);

  // Grouped client lists
  const parentClients = useMemo(
    () => clients.filter((c) => c.parentClientId === null && c.branches && c.branches.length > 0),
    [clients]
  );

  const standaloneClients = useMemo(
    () => clients.filter((c) => c.parentClientId === null && (!c.branches || c.branches.length === 0)),
    [clients]
  );

  // All selectable IDs (branches + standalone, never parent IDs)
  const allSelectableIds = useMemo(() => {
    const ids: string[] = [];
    for (const p of parentClients) {
      for (const b of p.branches!) {
        ids.push(b.id);
      }
    }
    for (const s of standaloneClients) {
      ids.push(s.id);
    }
    return ids;
  }, [parentClients, standaloneClients]);

  function toggleClient(id: string) {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleParent(parentId: string) {
    const parent = parentClients.find((p) => p.id === parentId);
    if (!parent || !parent.branches) return;
    const branchIds = parent.branches.map((b) => b.id);
    setSelectedClients((prev) => {
      const next = new Set(prev);
      const allSelected = branchIds.every((id) => next.has(id));
      if (allSelected) {
        branchIds.forEach((id) => next.delete(id));
      } else {
        branchIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedClients.size === allSelectableIds.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(allSelectableIds));
    }
  }

  async function handlePreview() {
    if (selectedClients.size === 0) return;
    setPreviewLoading(true);
    setError("");

    try {
      const res = await fetch("/api/certificates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientIds: Array.from(selectedClients),
          periodStart,
          periodEnd,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al generar preview");

      setPreviews(result.previews);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleCreate() {
    const validPreviews = previews.filter((p) => p.recordCount > 0 && !p.existingCertStatus);
    if (validPreviews.length === 0) return;

    setStep("creating");
    setError("");
    const created: CreatedCert[] = [];

    for (const preview of validPreviews) {
      try {
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: preview.clientId,
            periodStart,
            periodEnd,
          }),
        });

        const cert = await res.json();
        if (res.ok) {
          created.push({
            id: cert.id,
            uniqueCode: cert.uniqueCode,
            clientName: preview.clientName,
            totalKg: cert.totalKg,
            totalCo2: cert.totalCo2,
            status: "draft",
          });
        }
      } catch {
        // Continue with other clients on error
      }
    }

    setCreatedCerts(created);
    // Save to sessionStorage so we can restore on back navigation
    sessionStorage.setItem("createdCerts", JSON.stringify({
      certs: created,
      month: selectedMonth,
      year: selectedYear,
    }));
    setStep("done");
  }

  const validCount = previews.filter((p) => p.recordCount > 0 && !p.existingCertStatus).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Crear certificados</h1>
          <p className="text-sm text-sage-800/40">Selecciona clientes y mes para generar certificados</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: "Seleccionar" },
          { num: 2, label: "Revisar" },
          { num: 3, label: "Crear" },
        ].map((s, i) => {
          const currentNum = step === "select" ? 1 : step === "preview" ? 2 : 3;
          return (
            <div key={s.num} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3 text-sand-400 flex-shrink-0" />}
              <div className="flex items-center gap-1.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentNum > s.num
                    ? "bg-sage-500 text-white"
                    : currentNum === s.num
                    ? "bg-sage-500/10 text-sage-600 ring-2 ring-sage-500/30"
                    : "bg-sand-200 text-sage-800/30"
                }`}>
                  {currentNum > s.num ? <Check className="h-3 w-3" /> : s.num}
                </div>
                <span className={`text-xs hidden sm:inline ${currentNum >= s.num ? "text-sage-700" : "text-sage-800/30"}`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError("")}><X className="h-4 w-4 text-red-400" /></button>
        </div>
      )}

      {/* Step 1: Select clients and month */}
      {step === "select" && (
        <div className="space-y-5">
          {/* Month Selector */}
          <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
            <h3 className="font-serif text-base text-sage-800 mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-sage-400" />
              Selecciona el mes
            </h3>

            {/* Year tabs */}
            <div className="flex gap-2 mb-4">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    selectedYear === y
                      ? "bg-sage-500 text-white font-medium"
                      : "bg-sand-100 text-sage-800/50 hover:bg-sand-200"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {MONTHS.map((name, i) => {
                const isFuture = selectedYear === new Date().getFullYear() && i > new Date().getMonth();
                return (
                  <button
                    key={i}
                    onClick={() => !isFuture && setSelectedMonth(i)}
                    disabled={isFuture}
                    className={`px-3 py-2.5 text-xs rounded-lg transition-all ${
                      selectedMonth === i && !isFuture
                        ? "bg-sage-500 text-white font-medium ring-2 ring-sage-500/30"
                        : isFuture
                        ? "bg-sand-50 text-sage-800/20 cursor-not-allowed"
                        : "bg-white border border-sand-200 text-sage-700 hover:border-sage-300 hover:bg-sage-50/30"
                    }`}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-sage-800/40 mt-3">
              Período: {MONTHS[selectedMonth]} {selectedYear}
            </p>
          </div>

          {/* Client Selector */}
          <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-sage-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-sage-400" />
                Selecciona clientes
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-sage-500 hover:text-sage-700 transition-colors"
              >
                {selectedClients.size === allSelectableIds.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            </div>

            {clients.length === 0 ? (
              <p className="text-sage-800/40 text-sm text-center py-4">No hay clientes registrados</p>
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                {/* Parent clients with branches */}
                {parentClients.map((parent) => {
                  const branchIds = parent.branches!.map((b) => b.id);
                  const allBranchesSelected = branchIds.every((id) => selectedClients.has(id));
                  const someBranchesSelected = branchIds.some((id) => selectedClients.has(id));
                  return (
                    <div key={parent.id} className="space-y-1">
                      {/* Parent header */}
                      <button
                        onClick={() => toggleParent(parent.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                          allBranchesSelected
                            ? "bg-sage-50 border border-sage-200"
                            : someBranchesSelected
                            ? "bg-sage-50/50 border border-sage-200/50"
                            : "bg-white border border-sand-200 hover:border-sage-200"
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                          allBranchesSelected
                            ? "bg-sage-500 border-sage-500"
                            : someBranchesSelected
                            ? "bg-sage-300 border-sage-300"
                            : "border-sand-300"
                        }`}>
                          {allBranchesSelected && <Check className="h-3 w-3 text-white" />}
                          {someBranchesSelected && !allBranchesSelected && <div className="h-2 w-2 bg-white rounded-sm" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sage-800 truncate">{parent.name}</p>
                        </div>
                        <span className="text-xs text-sage-800/30">{parent.branches!.length} sucursales</span>
                      </button>
                      {/* Branch items */}
                      {parent.branches!.map((branch) => {
                        const isSelected = selectedClients.has(branch.id);
                        return (
                          <button
                            key={branch.id}
                            onClick={() => toggleClient(branch.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ml-8 ${
                              isSelected
                                ? "bg-sage-50 border border-sage-200"
                                : "bg-white border border-sand-200 hover:border-sage-200"
                            }`}
                            style={{ width: "calc(100% - 2rem)" }}
                          >
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "bg-sage-500 border-sage-500" : "border-sand-300"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-sage-800 truncate">{branch.name}</p>
                            </div>
                            <span className="text-xs text-sage-800/30">{branch._count.records} registros</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                {/* Standalone clients */}
                {standaloneClients.map((client) => {
                  const isSelected = selectedClients.has(client.id);
                  return (
                    <button
                      key={client.id}
                      onClick={() => toggleClient(client.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        isSelected
                          ? "bg-sage-50 border border-sage-200"
                          : "bg-white border border-sand-200 hover:border-sage-200"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? "bg-sage-500 border-sage-500" : "border-sand-300"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sage-800 truncate">{client.name}</p>
                      </div>
                      <span className="text-xs text-sage-800/30">{client._count.records} registros</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancelar</Button>
            <Button
              onClick={handlePreview}
              className="flex-[2]"
              disabled={selectedClients.size === 0 || previewLoading}
            >
              {previewLoading ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Cargando...</>
              ) : (
                <>Revisar {selectedClients.size} {selectedClients.size === 1 ? "certificado" : "certificados"} <ArrowRight className="h-4 w-4 ml-1.5" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
                <FileCheck className="h-5 w-5 text-sage-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-sage-800">
                  {MONTHS[selectedMonth]} {selectedYear}
                </h3>
                <p className="text-xs text-sage-800/40">
                  {validCount} {validCount === 1 ? "certificado" : "certificados"} por crear
                  {previews.length - validCount > 0 && ` · ${previews.length - validCount} omitidos`}
                </p>
              </div>
            </div>
          </div>

          {/* Preview Cards */}
          <div className="space-y-3">
            {previews.map((preview) => {
              const hasRecords = preview.recordCount > 0;
              const alreadyExists = !!preview.existingCertStatus;
              const isValid = hasRecords && !alreadyExists;
              const isExpanded = expandedPreview === preview.clientId;

              return (
                <div
                  key={preview.clientId}
                  className={`border rounded-[14px] overflow-hidden transition-all ${
                    !isValid ? "bg-sand-50/50 border-sand-200 opacity-60" : "bg-sand-50 border-sand-300"
                  }`}
                >
                  {/* Header row */}
                  <div
                    className={`p-4 flex items-center gap-4 ${isValid ? "cursor-pointer hover:bg-white/50" : ""}`}
                    onClick={() => isValid && setExpandedPreview(isExpanded ? null : preview.clientId)}
                  >
                    {isValid && (
                      isExpanded
                        ? <ChevronRight className="h-4 w-4 text-sage-400 rotate-90 transition-transform" />
                        : <ChevronRight className="h-4 w-4 text-sage-400 transition-transform" />
                    )}
                    {!isValid && <AlertCircle className="h-4 w-4 text-amber-400" />}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sage-800 text-sm">
                        {preview.parentClientName ? `${preview.parentClientName} - ${preview.clientName}` : preview.clientName}
                      </p>
                      {!hasRecords && (
                        <p className="text-xs text-amber-600">Sin retiros en este período</p>
                      )}
                      {alreadyExists && (
                        <p className="text-xs text-amber-600">Ya existe un certificado ({preview.existingCertStatus})</p>
                      )}
                      {isValid && (
                        <p className="text-xs text-sage-800/40">
                          {preview.pickups.length} {preview.pickups.length === 1 ? "retiro" : "retiros"} · {Object.keys(preview.materials).length} materiales
                        </p>
                      )}
                    </div>

                    {isValid && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-sage-800">{preview.totalKg.toLocaleString("es-CL")} kg</p>
                        <p className="text-xs text-sage-500">{preview.totalCo2.toLocaleString("es-CL")} kg CO₂</p>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isValid && isExpanded && (
                    <div className="border-t border-sand-200 px-5 py-4 space-y-4">
                      {/* Materials summary */}
                      <div>
                        <p className="text-xs font-medium text-sage-700 mb-2">Materiales</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(preview.materials).map(([mat, data]) => (
                            <div key={mat} className="flex items-center gap-1.5 bg-white rounded-lg border border-sand-200 px-2.5 py-1.5">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[mat] || "bg-sage-50 text-sage-600 border-sage-200"}`}>
                                {mat}
                              </span>
                              <span className="text-xs text-sage-800 tabular-nums">{data.kg.toLocaleString("es-CL")} kg</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pickups list */}
                      <div>
                        <p className="text-xs font-medium text-sage-700 mb-2">Retiros incluidos</p>
                        <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-sand-50">
                                <th className="text-left py-2 px-3 font-medium text-sage-800/40">Fecha</th>
                                <th className="text-left py-2 px-3 font-medium text-sage-800/40">Materiales</th>
                                <th className="text-left py-2 px-3 font-medium text-sage-800/40">Ubicación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preview.pickups.map((pickup, i) => (
                                <tr key={i} className="border-t border-sand-100">
                                  <td className="py-2 px-3 text-sage-800 whitespace-nowrap">
                                    {new Date(pickup.date + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" })}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex flex-wrap gap-1">
                                      {pickup.materials.map((m, j) => (
                                        <span key={j} className="text-sage-800/60">
                                          {m.material} ({m.kg.toLocaleString("es-CL")} kg){j < pickup.materials.length - 1 ? "," : ""}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-sage-800/40 truncate max-w-[150px]">
                                    {pickup.location || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("select")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
            </Button>
            <Button onClick={handleCreate} className="flex-1" disabled={validCount === 0}>
              <FileCheck className="h-4 w-4 mr-1.5" />
              Crear {validCount} {validCount === 1 ? "certificado" : "certificados"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2b: Creating */}
      {step === "creating" && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-sage-500 animate-spin" />
          </div>
          <h3 className="font-serif text-xl text-sage-800 mb-2">Creando certificados</h3>
          <p className="text-sm text-sage-800/40">Generando certificados para {MONTHS[selectedMonth]} {selectedYear}...</p>
        </div>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-sage-500" />
            </div>
            <h3 className="font-serif text-2xl text-sage-800 mb-2">
              {createdCerts.length} certificados creados
            </h3>
            <p className="text-sage-600">{MONTHS[selectedMonth]} {selectedYear}</p>
            <p className="text-sm text-sage-800/40 mt-2">
              Revisa cada certificado para editar, publicar o eliminar antes de enviar.
            </p>
          </div>

          {/* Created certificates list */}
          <div className="space-y-2">
            {createdCerts.map((cert) => (
              <div key={cert.id} className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-4 w-4 text-sage-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sage-800 text-sm">{cert.clientName}</p>
                  <p className="text-xs text-sage-800/40">{cert.uniqueCode}</p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-sm font-medium text-sage-800">{cert.totalKg.toLocaleString("es-CL")} kg</p>
                  <p className="text-xs text-sage-500">{cert.totalCo2.toLocaleString("es-CL")} kg CO₂</p>
                </div>
                <Badge className={cert.status === "draft" ? "bg-sand-200 text-sage-800/60" : "bg-sage-100 text-sage-600"}>
                  {cert.status === "draft" ? "Borrador" : "Publicado"}
                </Badge>
                {cert.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const res = await fetch(`/api/certificates/${cert.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "published" }),
                      });
                      if (res.ok) {
                        setCreatedCerts((prev) =>
                          prev.map((c) => c.id === cert.id ? { ...c, status: "published" } : c)
                        );
                      }
                    }}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Publicar
                  </Button>
                )}
                <Link href={`/dashboard/certificates/${cert.id}`}>
                  <Button size="sm">
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Revisar
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { sessionStorage.removeItem("createdCerts"); setStep("select"); setCreatedCerts([]); setPreviews([]); }} className="flex-1">
              Crear más certificados
            </Button>
            <Button onClick={() => { sessionStorage.removeItem("createdCerts"); router.push("/dashboard/certificates"); }} className="flex-1">
              Ver todos los certificados <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
