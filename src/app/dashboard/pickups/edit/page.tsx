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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface MaterialEntry {
  material: string;
  quantityKg: string;
}

interface RecordItem {
  id: string;
  material: string;
  quantityKg: number;
  client: { name: string };
}

export default function EditPickupPage() {
  return (
    <Suspense>
      <EditPickupContent />
    </Suspense>
  );
}

function EditPickupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "";
  const originalDate = searchParams.get("date") || "";
  const originalLocation = searchParams.get("location") || "";

  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");

  // Form state
  const [pickupDate, setPickupDate] = useState(originalDate);
  const [location, setLocation] = useState(originalLocation);
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clientId || !originalDate) return;
    const params = new URLSearchParams({ clientId, date: originalDate, location: originalLocation });
    fetch(`/api/pickups/records?${params}`)
      .then((r) => r.json())
      .then((records: RecordItem[]) => {
        if (records.length > 0) {
          setClientName(records[0].client.name);
          setMaterialEntries(
            records.map((r) => ({
              material: r.material,
              quantityKg: String(r.quantityKg),
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [clientId, originalDate, originalLocation]);

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

  function getAvailableMaterials(currentIndex: number) {
    const used = new Set(
      materialEntries
        .filter((_, i) => i !== currentIndex)
        .map((e) => e.material)
        .filter(Boolean)
    );
    return MATERIALS.filter((m) => !used.has(m));
  }

  const validEntries = materialEntries.filter(
    (e) => e.material && parseFloat(e.quantityKg) > 0
  );
  const canSubmit = pickupDate && validEntries.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/pickups/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          originalDate,
          originalLocation,
          pickupDate,
          location: location || undefined,
          materials: validEntries.map((e) => ({
            material: e.material,
            quantityKg: parseFloat(e.quantityKg),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al actualizar el retiro");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar este retiro completo? Se eliminarán ${materialEntries.length} registros de materiales. Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/pickups/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          date: originalDate,
          location: originalLocation,
        }),
      });

      if (res.ok) {
        router.push("/dashboard/pickups");
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-32 w-full rounded-[14px]" />
        <div className="skeleton h-48 w-full rounded-[14px]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-serif text-2xl text-sage-800">Retiro actualizado</h1>
        </div>

        <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-sage-500" />
          </div>
          <h3 className="font-serif text-2xl text-sage-800 mb-2">Retiro actualizado exitosamente</h3>
          <p className="text-sage-600">
            {clientName} — {new Date(pickupDate + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
          <div className="mt-6">
            <p className="text-3xl font-serif text-sage-500">{validEntries.length}</p>
            <p className="text-xs text-sage-800/40 mt-1">Materiales registrados</p>
          </div>
        </div>

        <Button onClick={() => router.push("/dashboard/pickups")} className="w-full">
          Volver a retiros
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Editar retiro</h1>
          <p className="text-sm text-sage-800/40">Modifica los datos del retiro de {clientName}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Client (read-only) */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
        <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Truck className="h-3.5 w-3.5" /> Cliente
        </label>
        <div className="px-3 py-2.5 text-sm bg-sand-100 border border-sand-200 rounded-lg text-sage-800">
          {clientName}
        </div>
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
            <div key={i} className="flex items-center gap-2">
              <select
                value={entry.material}
                onChange={(e) => updateEntry(i, "material", e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-white border border-sand-200 rounded-lg text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400"
              >
                <option value="">Material...</option>
                {getAvailableMaterials(i).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {entry.material && !getAvailableMaterials(i).includes(entry.material) && (
                  <option value={entry.material}>{entry.material}</option>
                )}
              </select>
              <div className="relative w-32">
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
                  className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

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

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-[2]"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Guardando...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Delete zone */}
      <div className="border border-red-200 rounded-[14px] p-5 bg-red-50/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Eliminar retiro</p>
            <p className="text-xs text-red-600 mt-0.5">
              Se eliminarán todos los registros de materiales de este retiro. Esta acción no se puede deshacer.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Eliminando...</>
            ) : (
              <><Trash2 className="h-4 w-4 mr-1.5" /> Eliminar</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
