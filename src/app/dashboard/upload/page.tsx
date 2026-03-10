"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Brain,
  Table,
  Zap,
  RefreshCw,
  Check,
  X,
  ChevronRight,
  Copy,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { parseExcelRaw, type RawExcelData } from "@/lib/excel-parser";

type Step = "upload" | "analyzing" | "preview" | "importing" | "done";

interface AIAnalysis {
  format?: "wide" | "long";
  mapping: Record<string, string | null>;
  materialColumns?: Record<string, string>;
  statusFilter?: { column: string; value: string };
  materialMapping: Record<string, string>;
  clientMapping: Record<string, string>;
  confidence: number;
  summary: string;
  warnings: string[];
  unmappedColumns: string[];
}

interface TransformedData {
  data: Array<{
    nombre_cliente: string;
    nombre_sucursal: string;
    material: string;
    cantidad_kg: number;
    fecha_retiro: string;
    ubicacion: string;
  }>;
  errors: string[];
  totalProcessed: number;
}

const STEP_INFO: Record<Step, { num: number; label: string; icon: typeof Upload }> = {
  upload: { num: 1, label: "Subir archivo", icon: Upload },
  analyzing: { num: 2, label: "Análisis IA", icon: Brain },
  preview: { num: 3, label: "Revisar e importar", icon: Table },
  importing: { num: 3, label: "Revisar e importar", icon: Zap },
  done: { num: 3, label: "Revisar e importar", icon: Zap },
};

// Colores centralizados en src/lib/material-colors.ts

export default function UploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [rawData, setRawData] = useState<RawExcelData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [transformed, setTransformed] = useState<TransformedData | null>(null);
  const [duplicateFlags, setDuplicateFlags] = useState<boolean[]>([]);
  const [importResult, setImportResult] = useState<{ pickupsCreated: number; recordsCreated: number; clientsCreated: number; duplicatesSkipped?: number } | null>(null);
  const [error, setError] = useState("");
  const [newClientNames, setNewClientNames] = useState<string[]>([]);
  const [newBranchNames, setNewBranchNames] = useState<Set<string>>(new Set());
  const [showNewClientsPanel, setShowNewClientsPanel] = useState(false);
  const [newClientDetails, setNewClientDetails] = useState<Record<string, { rut?: string; email?: string; phone?: string; address?: string; contactName?: string }>>({});
  const [expandedNewClient, setExpandedNewClient] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError("");
    setAnalysis(null);
    setTransformed(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const raw = parseExcelRaw(buffer);

      if (raw.totalRows === 0) {
        setError("El archivo está vacío o no tiene datos válidos");
        return;
      }

      setRawData(raw);
      setStep("analyzing");

      // Send to AI for analysis
      try {
        const res = await fetch("/api/upload/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: raw.headers,
            sampleRows: raw.rows.slice(0, 10),
            totalRows: raw.totalRows,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error en el análisis");
        }

        const analysisResult = await res.json();
        setAnalysis(analysisResult);
        // Skip review step — go directly to transform/preview
        await doTransform(raw, analysisResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al analizar el archivo");
        setStep("upload");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  async function doTransform(raw: RawExcelData, analysisData: AIAnalysis) {
    setStep("preview");

    try {
      const res = await fetch("/api/upload/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: raw.rows,
          mapping: analysisData.mapping,
          materialMapping: analysisData.materialMapping,
          clientMapping: analysisData.clientMapping,
          format: analysisData.format || "long",
          materialColumns: analysisData.materialColumns || {},
          statusFilter: analysisData.statusFilter,
        }),
      });

      const result = await res.json();
      setTransformed(result);

      // Check for duplicates and new clients in parallel
      if (result.data && result.data.length > 0) {
        const clientNames = Array.from(new Set(
          result.data.flatMap((r: TransformedData["data"][0]) =>
            r.nombre_sucursal ? [r.nombre_cliente, r.nombre_sucursal] : [r.nombre_cliente]
          )
        )) as string[];

        const [dupResult, newClientResult] = await Promise.allSettled([
          fetch("/api/upload/check-duplicates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: result.data }),
          }).then((r) => r.json()),
          fetch("/api/upload/check-new-clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientNames }),
          }).then((r) => r.json()),
        ]);

        setDuplicateFlags(
          dupResult.status === "fulfilled" ? dupResult.value.duplicates || [] : []
        );

        if (newClientResult.status === "fulfilled" && newClientResult.value.newClients?.length > 0) {
          const newNames: string[] = newClientResult.value.newClients;
          // Determine which new names are branches (sucursales) vs parent companies
          const branchSet = new Set<string>();
          for (const row of result.data) {
            if (row.nombre_sucursal && newNames.includes(row.nombre_sucursal)) {
              branchSet.add(row.nombre_sucursal);
            }
          }
          setNewClientNames(newNames);
          setNewBranchNames(branchSet);
          setShowNewClientsPanel(true);
        } else {
          setNewClientNames([]);
          setNewBranchNames(new Set());
        }
      }
    } catch {
      setError("Error al transformar los datos");
      setStep("upload");
    }
  }

  async function handleImport() {
    if (!transformed || transformed.data.length === 0) return;
    setStep("importing");

    // Filter out duplicates before importing
    const dataToImport = duplicateFlags.length > 0
      ? transformed.data.filter((_, i) => !duplicateFlags[i])
      : transformed.data;

    if (dataToImport.length === 0) {
      setError("Todos los registros son duplicados. No hay datos nuevos para importar.");
      setStep("preview");
      return;
    }

    // Count unique pickups (client + sucursal + date + location)
    const uniquePickups = new Set<string>();
    dataToImport.forEach((row) => {
      uniquePickups.add(`${row.nombre_cliente}|${row.nombre_sucursal || ""}|${row.fecha_retiro}|${row.ubicacion || ""}`);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataToImport, newClientDetails }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Error al importar los datos");
        setStep("preview");
        return;
      }
      setImportResult({ ...result, pickupsCreated: uniquePickups.size });
      setStep("done");
    } catch {
      setError("Error al importar los datos");
      setStep("preview");
    }
  }

  function handleReset() {
    setStep("upload");
    setFileName("");
    setRawData(null);
    setAnalysis(null);
    setTransformed(null);
    setDuplicateFlags([]);
    setImportResult(null);
    setError("");
    setNewClientNames([]);
    setNewBranchNames(new Set());
    setShowNewClientsPanel(false);
    setNewClientDetails({});
    setExpandedNewClient(null);
  }

  const currentStep = STEP_INFO[step];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-sage-800">Subir datos</h1>
        <p className="text-sm text-sage-800/40">La IA analiza tu archivo y mapea los datos automáticamente</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: "Subir archivo" },
          { num: 2, label: "Análisis IA" },
          { num: 3, label: "Revisar e importar" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3 w-3 text-sand-400 flex-shrink-0" />}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep.num > s.num
                    ? "bg-sage-500 text-white"
                    : currentStep.num === s.num
                    ? "bg-sage-500/10 text-sage-600 ring-2 ring-sage-500/30"
                    : "bg-sand-200 text-sage-800/30"
                }`}
              >
                {currentStep.num > s.num ? <Check className="h-3 w-3" /> : s.num}
              </div>
              <span className={`text-xs hidden sm:inline ${currentStep.num >= s.num ? "text-sage-700" : "text-sage-800/30"}`}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-[14px] p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-sage-400 bg-sage-50/50 scale-[1.01]"
                : "border-sand-300 hover:border-sage-300 hover:bg-sand-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className={`mx-auto mb-5 h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragActive ? "bg-sage-100 scale-110" : "bg-sand-100"
            }`}>
              <Upload className={`h-7 w-7 ${isDragActive ? "text-sage-500" : "text-sage-400"}`} strokeWidth={1.5} />
            </div>
            {isDragActive ? (
              <p className="text-lg text-sage-600 font-medium">Suelta el archivo aquí</p>
            ) : (
              <>
                <p className="text-lg text-sage-800 font-medium">Arrastra tu archivo Excel o CSV</p>
                <p className="text-sm text-sage-800/40 mt-2">o haz click para seleccionar</p>
              </>
            )}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-sage-400" />
              <span className="text-xs text-sage-800/40">
                La IA identificará las columnas sin importar el formato
              </span>
            </div>
          </div>

          <div className="bg-sand-50/50 border border-sand-200 rounded-[14px] p-5">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-sage-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-sage-700">Cualquier formato funciona</p>
                <p className="text-xs text-sage-800/40 mt-1 leading-relaxed">
                  No importa cómo se llamen las columnas. La IA reconocerá clientes, materiales, cantidades, fechas y ubicaciones
                  aunque tengan nombres diferentes como &quot;Empresa&quot;, &quot;Client&quot;, &quot;kg&quot;, &quot;Peso&quot;, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2a: Analyzing */}
      {step === "analyzing" && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center relative">
            <Brain className="h-7 w-7 text-sage-500" />
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-sage-500 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>
          <h3 className="font-serif text-xl text-sage-800 mb-2">Analizando tu archivo</h3>
          <p className="text-sm text-sage-800/40 mb-6">
            La IA está identificando columnas, materiales y clientes...
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-sage-800/40">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{fileName}</span>
            <span className="text-sand-400">·</span>
            <span>{rawData?.totalRows} filas</span>
            <span className="text-sand-400">·</span>
            <span>{rawData?.headers.length} columnas</span>
          </div>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-8 rounded-full bg-sage-200 overflow-hidden"
              >
                <div
                  className="h-full bg-sage-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && transformed && (
        <div className="space-y-4">
          {/* AI Analysis Summary */}
          {analysis && (
            <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-sage-400" />
                <div>
                  <p className="text-sm font-medium text-sage-800">{fileName}</p>
                  <p className="text-xs text-sage-800/40">{analysis.summary}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant="outline" className="bg-sage-50 text-sage-600 border-sage-200">
                  {Math.round((analysis.confidence || 0.9) * 100)}% precisión
                </Badge>
                {transformed.errors.length > 0 && (
                  <Badge variant="destructive">{transformed.errors.length} errores</Badge>
                )}
              </div>
            </div>
          )}

          {/* Warnings from AI */}
          {analysis?.warnings && analysis.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-3 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 space-y-0.5">
                {analysis.warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {transformed.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[14px] p-4">
              <p className="text-sm font-medium text-red-700 mb-2">Filas con errores (serán omitidas):</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {transformed.errors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                    <X className="h-3 w-3 mt-0.5 flex-shrink-0" /> {err}
                  </p>
                ))}
                {transformed.errors.length > 10 && (
                  <p className="text-xs text-red-500">...y {transformed.errors.length - 10} más</p>
                )}
              </div>
            </div>
          )}

          {/* Duplicates Warning */}
          {duplicateFlags.filter(Boolean).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 flex items-start gap-3">
              <Copy className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">
                  {duplicateFlags.filter(Boolean).length} registros duplicados detectados
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Estos registros ya existen en el sistema y serán omitidos automáticamente al importar.
                </p>
              </div>
            </div>
          )}

          {/* New Clients Banner */}
          {newClientNames.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[14px] p-4 flex items-start gap-3">
              <UserPlus className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-700">
                  {newClientNames.length} {newClientNames.length === 1 ? "cliente nuevo detectado" : "clientes nuevos detectados"}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Se crearán automáticamente al importar. Puedes completar sus datos ahora o después.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 flex-shrink-0"
                onClick={() => setShowNewClientsPanel(true)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Completar datos
              </Button>
            </div>
          )}

          {/* Data Table — grouped by pickup */}
          {(() => {
            const hasSucursal = transformed.data.some((r) => r.nombre_sucursal);
            // Group records into pickups (client + sucursal + date + location)
            const pickups: Array<{
              key: string;
              cliente: string;
              sucursal: string;
              fecha: string;
              ubicacion: string;
              materials: Array<{ material: string; cantidad_kg: number }>;
              totalKg: number;
              isDuplicate: boolean;
              isNewClient: boolean;
            }> = [];
            const pickupMap = new Map<string, typeof pickups[0]>();

            transformed.data.forEach((row, i) => {
              const key = `${row.nombre_cliente}|${row.nombre_sucursal || ""}|${row.fecha_retiro}|${row.ubicacion || ""}`;
              if (!pickupMap.has(key)) {
                const pickup = {
                  key,
                  cliente: row.nombre_cliente,
                  sucursal: row.nombre_sucursal,
                  fecha: row.fecha_retiro,
                  ubicacion: row.ubicacion,
                  materials: [],
                  totalKg: 0,
                  isDuplicate: true,
                  isNewClient: newClientNames.includes(row.nombre_cliente) || (!!row.nombre_sucursal && newClientNames.includes(row.nombre_sucursal)),
                };
                pickupMap.set(key, pickup);
                pickups.push(pickup);
              }
              const pickup = pickupMap.get(key)!;
              pickup.materials.push({ material: row.material, cantidad_kg: row.cantidad_kg });
              pickup.totalKg += row.cantidad_kg;
              // If any record in the pickup is NOT a duplicate, the pickup is not a duplicate
              if (!duplicateFlags[i]) pickup.isDuplicate = false;
            });

            return (
              <>
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-sand-100 z-10">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Cliente</th>
                          {hasSucursal && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Sucursal</th>
                          )}
                          <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Fecha</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Materiales</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Total kg</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickups.map((pickup) => (
                          <tr key={pickup.key} className={`border-t border-sand-200 transition-colors ${pickup.isDuplicate ? "bg-amber-50/50 opacity-50" : "hover:bg-white/50"}`}>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${pickup.isNewClient ? "bg-emerald-50" : "bg-sage-50"}`}>
                                  <span className={`text-[10px] font-medium ${pickup.isNewClient ? "text-emerald-500" : "text-sage-500"}`}>{pickup.cliente.charAt(0)}</span>
                                </div>
                                <span className="font-medium text-sage-800 text-xs">{pickup.cliente}</span>
                                {pickup.isNewClient && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">NUEVO</span>
                                )}
                                {pickup.isDuplicate && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">DUPLICADO</span>
                                )}
                              </div>
                            </td>
                            {hasSucursal && (
                              <td className="py-2.5 px-4 text-xs text-sage-800/60">{pickup.sucursal || "—"}</td>
                            )}
                            <td className="py-2.5 px-4 text-xs text-sage-800/60 whitespace-nowrap">
                              {pickup.fecha.split("-").reverse().join("/")}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {pickup.materials.map((m, j) => (
                                  <span key={j} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}>
                                    {m.material} · {m.cantidad_kg.toLocaleString("es-CL")} kg
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right text-sage-800 text-xs tabular-nums whitespace-nowrap">
                              {pickup.totalKg.toLocaleString("es-CL")} kg
                            </td>
                            <td className="py-2.5 px-4 text-xs text-sage-800/40 truncate max-w-[180px]">{pickup.ubicacion || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
                    <p className="text-xl font-serif text-sage-500">{pickups.length}</p>
                    <p className="text-xs text-sage-800/40 mt-1">Retiros</p>
                  </div>
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
                    <p className="text-xl font-serif text-sage-500">
                      {new Set(transformed.data.map((r) => r.nombre_cliente)).size}
                    </p>
                    <p className="text-xs text-sage-800/40 mt-1">Clientes</p>
                  </div>
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
                    <p className="text-xl font-serif text-sage-500">
                      {transformed.data.reduce((s, r) => s + r.cantidad_kg, 0).toLocaleString("es-CL")}
                    </p>
                    <p className="text-xs text-sage-800/40 mt-1">kg totales</p>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Subir otro archivo
            </Button>
            <Button
              onClick={handleImport}
              className="flex-1"
              disabled={transformed.data.length - duplicateFlags.filter(Boolean).length === 0}
            >
              <Zap className="h-4 w-4 mr-1.5" />
              Importar {(() => {
                const uniquePickups = new Set<string>();
                transformed.data.forEach((row, i) => {
                  if (!duplicateFlags[i]) {
                    uniquePickups.add(`${row.nombre_cliente}|${row.nombre_sucursal || ""}|${row.fecha_retiro}|${row.ubicacion || ""}`);
                  }
                });
                return uniquePickups.size;
              })()} retiros
            </Button>
          </div>
        </div>
      )}

      {/* Step 3b: Importing */}
      {step === "importing" && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-sage-500 animate-spin" />
          </div>
          <h3 className="font-serif text-xl text-sage-800 mb-2">Importando datos</h3>
          <p className="text-sm text-sage-800/40">
            Creando registros y calculando CO₂...
          </p>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && importResult && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-sage-500" />
            </div>
            <h3 className="font-serif text-2xl text-sage-800 mb-2">Importación exitosa</h3>
            <p className="text-sage-600">Todos los datos han sido procesados correctamente</p>

            <div className="mt-8 flex justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-serif text-sage-500">{importResult.pickupsCreated}</p>
                <p className="text-xs text-sage-800/40 mt-1">Retiros importados</p>
              </div>
              {importResult.clientsCreated > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-serif text-sage-500">{importResult.clientsCreated}</p>
                  <p className="text-xs text-sage-800/40 mt-1">Nuevos clientes</p>
                </div>
              )}
              {(importResult.duplicatesSkipped ?? 0) > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-serif text-amber-500">{importResult.duplicatesSkipped}</p>
                  <p className="text-xs text-sage-800/40 mt-1">Duplicados omitidos</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard/pickups"} className="flex-1">
              Ver retiros
            </Button>
            <Button onClick={() => window.location.href = "/dashboard/certificates/new"} className="flex-1">
              Generar certificados <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Slide-over panel for new clients */}
      {showNewClientsPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => setShowNewClientsPanel(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-sand-300 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-sage-800">Clientes nuevos</h3>
                  <p className="text-xs text-sage-800/40">Completa los datos o importa solo con el nombre</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewClientsPanel(false)}
                className="h-8 w-8 rounded-lg hover:bg-sand-100 flex items-center justify-center text-sage-400 hover:text-sage-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Client list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {newClientNames.map((name) => {
                const isExpanded = expandedNewClient === name;
                const details = newClientDetails[name] || {};
                const filledCount = Object.values(details).filter(Boolean).length;

                return (
                  <div key={name} className="bg-sand-50 border border-sand-200 rounded-[14px] overflow-hidden">
                    {/* Client header - clickable */}
                    <button
                      onClick={() => setExpandedNewClient(isExpanded ? null : name)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand-100/50 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${newBranchNames.has(name) ? "bg-blue-50" : "bg-emerald-50"}`}>
                        <span className={`text-xs font-medium ${newBranchNames.has(name) ? "text-blue-500" : "text-emerald-500"}`}>{name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-sage-800 truncate">{name}</p>
                        <p className="text-[10px] text-sage-400">
                          {newBranchNames.has(name) ? "Sucursal" : "Empresa"}
                          {filledCount > 0 && ` · ${filledCount} ${filledCount === 1 ? "dato completado" : "datos completados"}`}
                        </p>
                      </div>
                      {filledCount > 0 && (
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-sage-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-sage-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expandable form */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-sand-200">
                        {newBranchNames.has(name) ? (
                          <>
                            {/* Branch (sucursal): no RUT needed, show contact details */}
                            <p className="text-[10px] text-sage-400">Sucursal — el RUT es el mismo de la empresa</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-sage-600">Email</Label>
                                <Input
                                  placeholder="correo@sucursal.cl"
                                  type="email"
                                  value={details.email || ""}
                                  onChange={(e) => setNewClientDetails((prev) => ({
                                    ...prev,
                                    [name]: { ...prev[name], email: e.target.value },
                                  }))}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-sage-600">Teléfono</Label>
                                <Input
                                  placeholder="+56 9 1234 5678"
                                  value={details.phone || ""}
                                  onChange={(e) => setNewClientDetails((prev) => ({
                                    ...prev,
                                    [name]: { ...prev[name], phone: e.target.value },
                                  }))}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-sage-600">Contacto</Label>
                                <Input
                                  placeholder="Nombre contacto"
                                  value={details.contactName || ""}
                                  onChange={(e) => setNewClientDetails((prev) => ({
                                    ...prev,
                                    [name]: { ...prev[name], contactName: e.target.value },
                                  }))}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-sage-600">Dirección</Label>
                                <Input
                                  placeholder="Dirección sucursal"
                                  value={details.address || ""}
                                  onChange={(e) => setNewClientDetails((prev) => ({
                                    ...prev,
                                    [name]: { ...prev[name], address: e.target.value },
                                  }))}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Parent company (empresa): only RUT */}
                            <div className="space-y-1">
                              <Label className="text-xs text-sage-600">RUT</Label>
                              <Input
                                placeholder="12.345.678-9"
                                value={details.rut || ""}
                                onChange={(e) => setNewClientDetails((prev) => ({
                                  ...prev,
                                  [name]: { ...prev[name], rut: e.target.value },
                                }))}
                                className="h-8 text-sm"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-sand-200 space-y-2">
              <p className="text-[10px] text-sage-800/30 text-center">
                Puedes completar estos datos ahora o editarlos después en la sección de clientes
              </p>
              <Button
                className="w-full"
                onClick={() => setShowNewClientsPanel(false)}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Listo, continuar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
