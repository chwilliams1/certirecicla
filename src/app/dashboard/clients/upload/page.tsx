"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { parseExcelRaw, type RawExcelData } from "@/lib/excel-parser";
import { formatRut } from "@/lib/validations";

type Step = "upload" | "analyzing" | "preview" | "importing" | "done";

interface AIAnalysis {
  mapping: Record<string, string | null>;
  clientMapping: Record<string, string>;
  missingFields: string[];
  confidence: number;
  summary: string;
  warnings: string[];
}

interface ClientRow {
  nombre: string;
  sucursal: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  contacto: string;
  notas: string;
}

const FIELD_LABELS: Record<string, string> = {
  nombre: "Nombre",
  sucursal: "Sucursal",
  rut: "RUT",
  email: "Email",
  telefono: "Teléfono",
  direccion: "Dirección",
  contacto: "Contacto",
  notas: "Notas",
};

const CRITICAL_FIELDS = ["email", "rut"];

export default function ClientUploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [rawData, setRawData] = useState<RawExcelData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    try {
      const buffer = await file.arrayBuffer();
      const raw = parseExcelRaw(buffer);

      if (raw.totalRows === 0) {
        setError("El archivo está vacío");
        return;
      }

      setRawData(raw);
      setStep("analyzing");

      // Send to AI for analysis
      const res = await fetch("/api/clients/import?action=analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: raw.headers,
          sampleRows: raw.rows.slice(0, 10),
        }),
      });

      const ai = await res.json();
      if (!res.ok) throw new Error(ai.error);

      setAnalysis(ai);

      // Transform rows using AI mapping
      const transformed = transformRows(raw.rows, ai);
      setClients(transformed);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar archivo");
      setStep("upload");
    }
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

  function transformRows(rows: Record<string, unknown>[], ai: AIAnalysis): ClientRow[] {
    const mapping = ai.mapping;
    const clientMapping = ai.clientMapping || {};

    return rows.map((row) => {
      const rawName = mapping.nombre ? String(row[mapping.nombre] || "").trim() : "";
      const nombre = clientMapping[rawName] || rawName;
      const rawSucursal = mapping.sucursal ? String(row[mapping.sucursal] || "").trim() : "";
      const sucursal = clientMapping[rawSucursal] || rawSucursal;

      return {
        nombre,
        sucursal,
        rut: mapping.rut ? String(row[mapping.rut] || "").trim() : "",
        email: mapping.email ? String(row[mapping.email] || "").trim() : "",
        telefono: mapping.telefono ? String(row[mapping.telefono] || "").trim() : "",
        direccion: mapping.direccion ? String(row[mapping.direccion] || "").trim() : "",
        contacto: mapping.contacto ? String(row[mapping.contacto] || "").trim() : "",
        notas: mapping.notas ? String(row[mapping.notas] || "").trim() : "",
      };
    }).filter((c) => c.nombre);
  }

  // Deduplicate by name+sucursal (keep first occurrence, merge data)
  function getUniqueClients(): ClientRow[] {
    const map = new Map<string, ClientRow>();
    for (const c of clients) {
      const key = `${c.nombre}|${c.sucursal}`;
      if (!map.has(key)) {
        map.set(key, { ...c });
      } else {
        // Merge: fill empty fields from subsequent rows
        const existing = map.get(key)!;
        if (!existing.rut && c.rut) existing.rut = c.rut;
        if (!existing.email && c.email) existing.email = c.email;
        if (!existing.telefono && c.telefono) existing.telefono = c.telefono;
        if (!existing.direccion && c.direccion) existing.direccion = c.direccion;
        if (!existing.contacto && c.contacto) existing.contacto = c.contacto;
      }
    }
    return Array.from(map.values());
  }

  const uniqueClients = getUniqueClients();

  // Count clients with missing critical fields
  const clientsWithMissingEmail = uniqueClients.filter((c) => !c.email).length;
  const clientsWithMissingRut = uniqueClients.filter((c) => !c.rut).length;
  const hasMissingCritical = clientsWithMissingEmail > 0 || clientsWithMissingRut > 0;

  function updateClient(index: number, field: keyof ClientRow, value: string) {
    const unique = getUniqueClients();
    unique[index] = { ...unique[index], [field]: value };

    // Rebuild the full clients list with the update
    const key = `${uniqueClients[index].nombre}|${uniqueClients[index].sucursal}`;
    setClients((prev) =>
      prev.map((c) => {
        const cKey = `${c.nombre}|${c.sucursal}`;
        if (cKey === key) return unique[index];
        return c;
      })
    );
  }

  async function handleImport() {
    setStep("importing");
    setError("");

    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: uniqueClients }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
      setStep("preview");
    }
  }

  // --- RENDER ---

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Importar clientes</h1>
          <p className="text-sm text-sage-800/40">Sube un Excel o CSV con los datos de tus clientes</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError("")}><X className="h-4 w-4 text-red-400" /></button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-[14px] p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sage-400 bg-sage-50/50"
              : "border-sand-300 bg-sand-50 hover:border-sage-300 hover:bg-sand-100/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-sage-100 flex items-center justify-center">
            <Upload className="h-6 w-6 text-sage-500" />
          </div>
          <h3 className="font-serif text-lg text-sage-800 mb-1">
            {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo de clientes"}
          </h3>
          <p className="text-sm text-sage-800/40">Excel (.xlsx, .xls) o CSV — con columnas como nombre, email, RUT, etc.</p>
        </div>
      )}

      {/* Step 2: Analyzing */}
      {step === "analyzing" && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-sage-100 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-sage-500 animate-pulse" />
          </div>
          <h3 className="font-serif text-lg text-sage-800 mb-2">Analizando archivo</h3>
          <p className="text-sm text-sage-800/40">
            <FileSpreadsheet className="h-4 w-4 inline mr-1" />
            {fileName} · {rawData?.totalRows} filas
          </p>
          <Loader2 className="h-5 w-5 mx-auto mt-4 text-sage-400 animate-spin" />
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-sage-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg text-sage-800">
                  {uniqueClients.length} {uniqueClients.length === 1 ? "cliente" : "clientes"} detectados
                </h3>
                <p className="text-xs text-sage-800/40">{analysis.summary}</p>
              </div>
              {analysis.confidence >= 0.8 && (
                <Badge className="bg-sage-100 text-sage-600">
                  <CheckCircle className="h-3 w-3 mr-1" /> {Math.round(analysis.confidence * 100)}% confianza
                </Badge>
              )}
            </div>
          </div>

          {/* Missing fields warning */}
          {hasMissingCritical && (
            <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Datos faltantes para certificados</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {clientsWithMissingEmail > 0 && (
                      <span className="block">
                        <strong>{clientsWithMissingEmail}</strong> {clientsWithMissingEmail === 1 ? "cliente sin" : "clientes sin"} email — necesario para enviar certificados
                      </span>
                    )}
                    {clientsWithMissingRut > 0 && (
                      <span className="block">
                        <strong>{clientsWithMissingRut}</strong> {clientsWithMissingRut === 1 ? "cliente sin" : "clientes sin"} RUT — necesario para identificación en certificados
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    Puedes completar los datos ahora haciendo click en <Pencil className="h-3 w-3 inline" /> o después desde el perfil del cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI warnings */}
          {analysis.warnings.length > 0 && (
            <div className="text-xs text-sage-800/40 space-y-1">
              {analysis.warnings.map((w, i) => (
                <p key={i}>⚠ {w}</p>
              ))}
            </div>
          )}

          {/* Client list */}
          <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-sand-100 z-10">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Nombre</th>
                    {uniqueClients.some((c) => c.sucursal) && (
                      <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Sucursal</th>
                    )}
                    <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">RUT</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Contacto</th>
                    <th className="w-10 py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueClients.map((client, i) => {
                    const isEditing = editingIndex === i;
                    const missingEmail = !client.email;
                    const missingRut = !client.rut;

                    return (
                      <tr
                        key={i}
                        className={`border-t border-sand-200 transition-colors ${
                          isEditing ? "bg-sage-50/50" : "hover:bg-white/50"
                        }`}
                      >
                        <td className="py-2.5 px-4 text-xs text-sage-800/30">{i + 1}</td>
                        <td className="py-2.5 px-4">
                          {isEditing ? (
                            <Input
                              value={client.nombre}
                              onChange={(e) => updateClient(i, "nombre", e.target.value)}
                              className="h-8 text-xs"
                            />
                          ) : (
                            <span className="font-medium text-sage-800 text-xs">{client.nombre}</span>
                          )}
                        </td>
                        {uniqueClients.some((c) => c.sucursal) && (
                          <td className="py-2.5 px-4">
                            {isEditing ? (
                              <Input
                                value={client.sucursal}
                                onChange={(e) => updateClient(i, "sucursal", e.target.value)}
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="text-xs text-sage-800/60">{client.sucursal || "—"}</span>
                            )}
                          </td>
                        )}
                        <td className="py-2.5 px-4">
                          {isEditing ? (
                            <Input
                              value={client.rut}
                              onChange={(e) => updateClient(i, "rut", formatRut(e.target.value))}
                              className="h-8 text-xs"
                              placeholder="Ej: 76.123.456-7"
                            />
                          ) : missingRut ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">
                              Sin RUT
                            </span>
                          ) : (
                            <span className="text-xs text-sage-800">{client.rut}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {isEditing ? (
                            <Input
                              value={client.email}
                              onChange={(e) => updateClient(i, "email", e.target.value)}
                              className="h-8 text-xs"
                              placeholder="email@ejemplo.com"
                              type="email"
                            />
                          ) : missingEmail ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">
                              Sin email
                            </span>
                          ) : (
                            <span className="text-xs text-sage-800">{client.email}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {isEditing ? (
                            <Input
                              value={client.contacto}
                              onChange={(e) => updateClient(i, "contacto", e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Nombre del contacto"
                            />
                          ) : (
                            <span className="text-xs text-sage-800/60">{client.contacto || "—"}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => setEditingIndex(isEditing ? null : i)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isEditing
                                ? "bg-sage-500 text-white"
                                : "text-sage-400 hover:text-sage-600 hover:bg-sage-50"
                            }`}
                          >
                            {isEditing ? <CheckCircle className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
                setRawData(null);
                setAnalysis(null);
                setClients([]);
                setEditingIndex(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Subir otro archivo
            </Button>
            <Button onClick={handleImport} className="flex-1">
              <Users className="h-4 w-4 mr-1.5" />
              Importar {uniqueClients.length} {uniqueClients.length === 1 ? "cliente" : "clientes"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-sage-400 animate-spin mb-4" />
          <h3 className="font-serif text-lg text-sage-800">Importando clientes</h3>
          <p className="text-sm text-sage-800/40 mt-1">Creando {uniqueClients.length} clientes...</p>
        </div>
      )}

      {/* Step 5: Done */}
      {step === "done" && result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-sage-500" />
            </div>
            <h3 className="font-serif text-2xl text-sage-800 mb-2">Importación completada</h3>

            <div className="flex justify-center gap-8 mt-6">
              {result.created > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-serif text-sage-500">{result.created}</p>
                  <p className="text-xs text-sage-800/40 mt-1">Creados</p>
                </div>
              )}
              {result.updated > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-serif text-blue-500">{result.updated}</p>
                  <p className="text-xs text-sage-800/40 mt-1">Actualizados</p>
                </div>
              )}
              {result.skipped > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-serif text-sage-800/30">{result.skipped}</p>
                  <p className="text-xs text-sage-800/40 mt-1">Sin cambios</p>
                </div>
              )}
            </div>

            {hasMissingCritical && (
              <p className="text-xs text-amber-600 mt-4">
                Algunos clientes no tienen email o RUT. Puedes completar esos datos desde su perfil.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
                setRawData(null);
                setAnalysis(null);
                setClients([]);
                setResult(null);
                setEditingIndex(null);
              }}
              className="flex-1"
            >
              Importar más clientes
            </Button>
            <Button onClick={() => router.push("/dashboard/clients")} className="flex-1">
              Ver clientes <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
