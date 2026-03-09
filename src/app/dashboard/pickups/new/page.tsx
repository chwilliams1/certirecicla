"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Truck,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const MATERIALS = [
  "Plástico PET",
  "Plástico HDPE",
  "Plástico LDPE",
  "Plástico PP",
  "Cartón",
  "Vidrio",
  "Aluminio",
  "Papel",
  "Madera",
  "Electrónicos",
  "RAE",
];

// Colores centralizados en src/lib/material-colors.ts

interface ClientItem {
  id: string;
  name: string;
  address: string | null;
  parentClientId: string | null;
  parentClient?: { id: string; name: string } | null;
  branches?: ClientItem[];
}

interface MaterialEntry {
  material: string;
  quantityKg: string;
}

export default function NewPickupPage() {
  return (
    <Suspense>
      <NewPickupContent />
    </Suspense>
  );
}

function NewPickupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(searchParams.get("clientId") || "");
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([
    { material: "", quantityKg: "" },
  ]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    recordsCreated: number;
    duplicatesSkipped: number;
    duplicates: string[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data: ClientItem[]) => {
        setClients(data);
        // Auto-fill location if client was pre-selected via query param
        const preselectedId = searchParams.get("clientId");
        if (preselectedId) {
          for (const c of data) {
            if (c.id === preselectedId && c.address) { setLocation(c.address); break; }
            if (c.branches) {
              const branch = c.branches.find((b) => b.id === preselectedId);
              if (branch?.address) { setLocation(branch.address); break; }
            }
          }
        }
      })
      .finally(() => setLoadingClients(false));
  }, [searchParams]);

  function addMaterial() {
    setMaterialEntries((prev) => [...prev, { material: "", quantityKg: "" }]);
  }

  function removeMaterial(index: number) {
    setMaterialEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, field: "material" | "quantityKg", value: string) {
    setMaterialEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  }

  // Available materials (not already selected)
  function getAvailableMaterials(currentIndex: number) {
    const used = new Set(
      materialEntries
        .filter((_, i) => i !== currentIndex)
        .map((e) => e.material)
        .filter(Boolean)
    );
    return MATERIALS.filter((m) => !used.has(m));
  }

  // Validation
  const validEntries = materialEntries.filter(
    (e) => e.material && parseFloat(e.quantityKg) > 0
  );
  const canSubmit = selectedClientId && pickupDate && validEntries.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/pickups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          pickupDate,
          location: location || undefined,
          materials: validEntries.map((e) => ({
            material: e.material,
            quantityKg: parseFloat(e.quantityKg),
          })),
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // All duplicates
        setError(data.error);
        setResult(data);
      } else if (!res.ok) {
        setError(data.error || "Error al crear el retiro");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSelectedClientId("");
    setPickupDate(new Date().toISOString().slice(0, 10));
    setLocation("");
    setMaterialEntries([{ material: "", quantityKg: "" }]);
    setResult(null);
    setError("");
  }

  // Find client in flat or nested structure
  const findClient = (id: string): ClientItem | undefined => {
    for (const c of clients) {
      if (c.id === id) return c;
      if (c.branches) {
        const branch = c.branches.find((b) => b.id === id);
        if (branch) return branch;
      }
    }
    return undefined;
  };

  const selectedClient = findClient(selectedClientId);

  // Auto-fill location from client address
  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    const client = findClient(clientId);
    if (client?.address) {
      setLocation(client.address);
    } else {
      setLocation("");
    }
  }

  // Success state
  if (result && result.recordsCreated > 0) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="font-serif text-2xl text-sage-800">Retiro registrado</h1>
        </div>

        <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-sage-500" />
          </div>
          <h3 className="font-serif text-2xl text-sage-800 mb-2">Retiro registrado exitosamente</h3>
          <p className="text-sage-600">{selectedClient?.name} — {new Date(pickupDate + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>

          <div className="mt-6 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-serif text-sage-500">{result.recordsCreated}</p>
              <p className="text-xs text-sage-800/40 mt-1">Materiales registrados</p>
            </div>
            {result.duplicatesSkipped > 0 && (
              <div className="text-center">
                <p className="text-3xl font-serif text-amber-500">{result.duplicatesSkipped}</p>
                <p className="text-xs text-sage-800/40 mt-1">Duplicados omitidos</p>
              </div>
            )}
          </div>

          {result.duplicates.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs text-amber-700">
                Materiales omitidos por duplicado: {result.duplicates.join(", ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <Plus className="h-4 w-4 mr-1.5" /> Registrar otro retiro
          </Button>
          <Button onClick={() => router.push("/dashboard/pickups")} className="flex-1">
            Ver retiros
          </Button>
        </div>
        <div className="text-center">
          <Link
            href="/dashboard/certificates/new"
            className="text-sm text-sage-500 hover:text-sage-700 underline transition-colors"
          >
            Crear certificado para este cliente →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Registrar retiro</h1>
          <p className="text-sm text-sage-800/40">Agrega un retiro manualmente con sus materiales</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError("")}><X className="h-4 w-4 text-red-400" /></button>
        </div>
      )}

      {/* Client selector */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
        <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Truck className="h-3.5 w-3.5" /> Cliente
        </label>
        {loadingClients ? (
          <div className="h-10 bg-sand-100 rounded-lg animate-pulse" />
        ) : (
          <select
            value={selectedClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-sand-200 rounded-lg text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400"
          >
            <option value="">Selecciona un cliente...</option>
            {clients
              .filter((c) => !c.parentClientId)
              .map((c) =>
                c.branches && c.branches.length > 0 ? (
                  <optgroup key={c.id} label={c.name}>
                    {c.branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              )}
          </select>
        )}
      </div>

      {/* Date and Location */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <CalendarDays className="h-3.5 w-3.5" /> Fecha de retiro
          </label>
          <Input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="bg-white"
          />
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <MapPin className="h-3.5 w-3.5" /> Ubicación (opcional)
          </label>
          <Input
            placeholder="Dirección del retiro..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Materials */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider">
            Materiales retirados
          </label>
          <button
            onClick={addMaterial}
            disabled={materialEntries.length >= MATERIALS.length}
            className="text-xs text-sage-500 hover:text-sage-700 transition-colors flex items-center gap-1 disabled:opacity-30"
          >
            <Plus className="h-3 w-3" /> Agregar material
          </button>
        </div>

        <div className="space-y-2.5">
          {materialEntries.map((entry, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={entry.material}
                onChange={(e) => updateEntry(i, "material", e.target.value)}
                className="flex-1 px-3 py-2.5 sm:py-2 text-sm bg-white border border-sand-200 rounded-lg text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400"
              >
                <option value="">Material...</option>
                {getAvailableMaterials(i).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {/* Keep current selection visible */}
                {entry.material && !getAvailableMaterials(i).includes(entry.material) && (
                  <option value={entry.material}>{entry.material}</option>
                )}
              </select>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-32">
                  <Input
                    type="number"
                    placeholder="0"
                    value={entry.quantityKg}
                    onChange={(e) => updateEntry(i, "quantityKg", e.target.value)}
                    min="0"
                    step="0.1"
                    className="bg-white pr-8 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage-800/30">kg</span>
                </div>
                {materialEntries.length > 1 && (
                  <button
                    onClick={() => removeMaterial(i)}
                    className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary of valid entries */}
        {validEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-sand-200">
            <div className="flex flex-wrap gap-2">
              {validEntries.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[e.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}>
                    {e.material}
                  </span>
                  <span className="text-xs text-sage-800/50">{parseFloat(e.quantityKg).toLocaleString("es-CL")} kg</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-800/30 mt-2">
              Total: {validEntries.reduce((s, e) => s + parseFloat(e.quantityKg), 0).toLocaleString("es-CL")} kg en {validEntries.length} {validEntries.length === 1 ? "material" : "materiales"}
            </p>
          </div>
        )}
      </div>

      {/* Duplicate info */}
      {result && result.duplicatesSkipped > 0 && result.recordsCreated === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
          <p className="text-sm text-amber-700 font-medium mb-1">Registros duplicados detectados</p>
          <p className="text-xs text-amber-600">
            Los materiales {result.duplicates.join(", ")} ya están registrados para este cliente en esta fecha con las mismas cantidades.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          className="flex-[2]"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Registrando...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Registrar retiro ({validEntries.length} {validEntries.length === 1 ? "material" : "materiales"})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
