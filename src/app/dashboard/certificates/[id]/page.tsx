"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  ArrowLeft,
  Download,
  Mail,
  Check,
  Loader2,
  TreePine,
  Car,
  Home,
  Smartphone,
  Trash2,
  Pencil,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { calculateEquivalencies, DEFAULT_CO2_FACTORS, VALID_MATERIALS } from "@/lib/co2-calculator";
import { formatPeriod } from "@/lib/format-period";
import { SendCertificateDialog } from "@/components/send-certificate-dialog";
import Link from "next/link";
import { Plus } from "lucide-react";

interface PickupDetail {
  date: string;
  location: string;
  materials: string;
  kg: number;
}

interface CertificateDetail {
  id: string;
  uniqueCode: string;
  name: string;
  totalKg: number;
  totalCo2: number;
  materials: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  sentAt: string | null;
  createdAt: string;
  client: { id: string; name: string; rut: string | null; email: string | null; parentClient?: { name: string } | null };
  company: { name: string; rut: string | null; address: string | null; logo?: string | null; sanitaryResolution?: string | null; plantAddress?: string | null };
  pickups?: PickupDetail[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  sent: "Enviado",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-sand-200 text-sage-800/60",
  published: "bg-sage-100 text-sage-600",
  sent: "bg-blue-100 text-blue-700",
};

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMaterials, setEditMaterials] = useState<Record<string, { kg: number; co2: number }>>({});
  const [co2Factors, setCo2Factors] = useState<Record<string, number>>({});
  const [newMaterial, setNewMaterial] = useState("");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendMode, setSendMode] = useState<"send" | "publishAndSend">("send");

  useEffect(() => {
    fetch(`/api/certificates/${params.id}`)
      .then((r) => r.json())
      .then(setCert)
      .finally(() => setLoading(false));
    // Fetch company CO2 factors for auto-calculation
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.co2Factors) {
          const map: Record<string, number> = {};
          for (const f of data.co2Factors) {
            map[f.material] = f.factor;
          }
          setCo2Factors(map);
        }
      });
  }, [params.id]);

  function openSendDialog(mode: "send" | "publishAndSend") {
    setSendMode(mode);
    setSendDialogOpen(true);
  }

  function handleSendSuccess() {
    setCert((prev) => prev ? { ...prev, status: "sent", sentAt: new Date().toISOString() } : null);
  }

  async function handleRevertToDraft() {
    if (!confirm("¿Volver este certificado a borrador? Podrás editarlo nuevamente.")) return;
    setPublishing(true);
    const res = await fetch(`/api/certificates/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCert(updated);
    }
    setPublishing(false);
  }

  async function handlePublish() {
    setPublishing(true);
    const res = await fetch(`/api/certificates/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCert(updated);
    }
    setPublishing(false);
  }

  async function handleDownload() {
    const res = await fetch(`/api/certificates/${params.id}/pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (cert?.name || cert?.uniqueCode || "certificado").replace(/[()]/g, "").replace(/\s*—\s*/g, "_").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ_\-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    a.download = `${safeName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este certificado? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/certificates/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/certificates");
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar");
      setDeleting(false);
    }
  }

  function startEditing() {
    if (!cert) return;
    let parsed: Record<string, { kg: number; co2: number }>;
    try { parsed = JSON.parse(cert.materials); } catch { return; }
    // Recalculate CO2 with current factors
    const recalculated: Record<string, { kg: number; co2: number }> = {};
    for (const [mat, vals] of Object.entries(parsed)) {
      const factor = getCo2Factor(mat);
      recalculated[mat] = { kg: vals.kg, co2: Math.round(vals.kg * factor * 100) / 100 };
    }
    setEditMaterials(recalculated);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditMaterials({});
  }

  function getCo2Factor(material: string): number {
    return co2Factors[material] ?? DEFAULT_CO2_FACTORS[material] ?? 0;
  }

  function updateMaterialKg(material: string, value: string) {
    const kg = parseFloat(value) || 0;
    const factor = getCo2Factor(material);
    const co2 = Math.round(kg * factor * 100) / 100;
    setEditMaterials((prev) => ({
      ...prev,
      [material]: { kg, co2 },
    }));
  }

  function removeMaterial(material: string) {
    setEditMaterials((prev) => {
      const next = { ...prev };
      delete next[material];
      return next;
    });
  }

  function addMaterial() {
    if (!newMaterial || editMaterials[newMaterial]) return;
    setEditMaterials((prev) => ({
      ...prev,
      [newMaterial]: { kg: 0, co2: 0 },
    }));
    setNewMaterial("");
  }

  async function handleSave() {
    // Remove materials with 0 kg
    const cleaned: Record<string, { kg: number; co2: number }> = {};
    for (const [mat, vals] of Object.entries(editMaterials)) {
      if (vals.kg > 0) cleaned[mat] = vals;
    }

    if (Object.keys(cleaned).length === 0) {
      alert("El certificado debe tener al menos un material");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/certificates/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materials: cleaned }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCert(updated);
      setEditing(false);
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  if (!cert) return <p>Certificado no encontrado</p>;

  const materials = editing ? editMaterials : (() => { try { return JSON.parse(cert.materials) as Record<string, { kg: number; co2: number }>; } catch { return {} as Record<string, { kg: number; co2: number }>; } })();
  const totalKg = editing
    ? Object.values(editMaterials).reduce((s, v) => s + v.kg, 0)
    : cert.totalKg;
  const totalCo2 = editing
    ? Object.values(editMaterials).reduce((s, v) => s + v.co2, 0)
    : cert.totalCo2;
  const eq = calculateEquivalencies(totalCo2);
  const isDraft = cert.status === "draft";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl text-sage-800 truncate">{cert.name || `Certificado ${cert.uniqueCode}`}</h1>
            <p className="text-xs text-sage-800/40 mt-0.5">{cert.uniqueCode}</p>
            <Badge className={`mt-1 ${STATUS_STYLES[cert.status] || ""}`}>
              {STATUS_LABELS[cert.status] || cert.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Draft: Editar (con opción eliminar dentro del dropdown) */}
          {isDraft && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar datos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar certificado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Draft: Publicar */}
          {isDraft && !editing && (
            <Button variant="outline" size="sm" onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Publicar
            </Button>
          )}
          {/* Draft: Publicar y enviar (acción principal) */}
          {isDraft && !editing && cert.client?.email && (
            <Button onClick={() => openSendDialog("publishAndSend")} size="sm">
              <Mail className="h-4 w-4 mr-1" />
              Publicar y enviar
            </Button>
          )}
          {/* Editing mode */}
          {editing && (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Guardar cambios
              </Button>
            </>
          )}
          {/* Published/Sent: Volver a borrador */}
          {!editing && !isDraft && (
            <Button variant="outline" size="sm" onClick={handleRevertToDraft} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4 mr-1" />}
              Volver a borrador
            </Button>
          )}
          {/* Published (not sent): Enviar */}
          {!editing && cert.status === "published" && cert.client?.email && (
            <Button size="sm" onClick={() => openSendDialog("send")}>
              <Mail className="h-4 w-4 mr-1" />
              Enviar
            </Button>
          )}
          {/* Sent: Reenviar */}
          {!editing && cert.status === "sent" && cert.client?.email && (
            <Button variant="outline" size="sm" onClick={() => openSendDialog("send")}>
              <Mail className="h-4 w-4 mr-1" />
              Reenviar
            </Button>
          )}
          {/* Siempre: PDF */}
          {!editing && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
          )}
        </div>
      </div>

      {/* Draft warning */}
      {isDraft && !editing && (
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 flex items-center gap-3 print:hidden">
          <Pencil className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Este certificado está en borrador. Puedes <button onClick={startEditing} className="font-medium underline">editar los datos</button> o <button onClick={handleDelete} className="font-medium underline">eliminarlo</button> antes de publicar.
          </p>
        </div>
      )}

      {/* Certificate Preview */}
      <div className={`bg-white border rounded-[14px] shadow-sm overflow-hidden relative ${editing ? "border-sage-300 ring-2 ring-sage-200" : "border-sand-200"}`}>
        {/* Green left accent bar */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#5a7d5e]" />

        <div className="p-8 pl-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              {cert.company.logo && (
                <img src={cert.company.logo} alt="Logo" className="h-12 w-12 object-contain rounded" />
              )}
              <div>
                <h2 className="font-serif text-2xl text-sage-700">Certificado de Reciclaje</h2>
                <p className="text-sm text-sage-400 mt-0.5">Impacto Ambiental Verificado</p>
              </div>
            </div>
            <div className="sm:text-right text-sm">
              <p className="font-medium">{cert.company.name}</p>
              {cert.company.rut && <p className="text-sage-800/40">{cert.company.rut}</p>}
              {cert.company.address && <p className="text-sage-800/40">{cert.company.address}</p>}
              {cert.company.plantAddress && <p className="text-sage-800/40">Planta: {cert.company.plantAddress}</p>}
            </div>
          </div>

          <div className="border-t border-sand-200 pt-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-sage-800/40 uppercase">Cliente</p>
                <p className="font-medium">
                  {cert.client?.parentClient && <span className="text-sage-800/40">{cert.client.parentClient.name} &rsaquo; </span>}
                  {cert.client?.name}
                </p>
                {cert.client?.rut && <p className="text-xs text-sage-800/40">RUT: {cert.client.rut}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-sage-800/40 uppercase">Período</p>
                <p className="font-medium">{formatPeriod(cert.periodStart)}</p>
              </div>
            </div>
          </div>

          {/* Certification statement */}
          {!editing && (
            <p className="text-sm text-sage-700 leading-relaxed mb-4">
              Mediante el presente documento, {cert.company.name}{cert.company.rut ? ` (RUT ${cert.company.rut})` : ""} hace constar que {cert.client?.name}{cert.client?.rut ? ` (RUT ${cert.client.rut})` : ""} realizó la valorización de {totalKg.toLocaleString("es-CL")} kg de residuos reciclables durante {formatPeriod(cert.periodStart)}, contribuyendo a evitar {totalCo2.toLocaleString("es-CL")} kg de emisiones de CO₂ equivalente.
            </p>
          )}

          <div className="border-t border-sand-200 pt-4 mb-4" />

          {/* Materials table */}
          <h3 className="font-serif text-lg text-sage-700 mb-4">
            Detalle de Materiales Reciclados
            {editing && <span className="text-sm font-normal text-sage-400 ml-2">(editando)</span>}
          </h3>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-[#4a6b4e] text-white">
                <th className="text-left py-2 px-3 rounded-tl-lg font-medium">Material</th>
                <th className="text-right py-2 px-3 font-medium">Cantidad (kg)</th>
                <th className="text-right py-2 px-3 font-medium">CO₂ evitado (kg)</th>
                {editing && <th className="w-10 py-2 px-3 rounded-tr-lg"></th>}
                {!editing && <th className="rounded-tr-lg w-0"></th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(materials).map(([mat, vals], i) => (
                <tr key={mat} className={`border-b border-sand-100 ${i % 2 === 1 ? "bg-sage-50/50" : ""}`}>
                  <td className="py-2 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${MATERIAL_COLORS[mat] || "bg-sage-50 text-sage-600 border-sage-200"}`}>
                      {mat}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {editing ? (
                      <input
                        type="number"
                        value={vals.kg || ""}
                        onChange={(e) => updateMaterialKg(mat, e.target.value)}
                        className="w-24 text-right text-sm border border-sand-300 rounded-md px-2 py-1 bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sage-400"
                        min="0"
                        step="0.1"
                      />
                    ) : (
                      vals.kg.toLocaleString("es-CL")
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-sage-600">
                    {editing ? (
                      <span className="text-sage-500">{vals.co2.toLocaleString("es-CL")}</span>
                    ) : (
                      vals.co2.toLocaleString("es-CL")
                    )}
                  </td>
                  {editing && (
                    <td className="py-2 px-3 text-center">
                      <button onClick={() => removeMaterial(mat)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                  {!editing && <td></td>}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add material row */}
          {editing && (
            <div className="flex items-center gap-2 mb-6">
              <select
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                className="flex-1 text-sm border border-sand-300 rounded-md px-2 py-1.5 bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sage-400"
              >
                <option value="">Agregar material...</option>
                {VALID_MATERIALS.filter((m) => !editMaterials[m]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                disabled={!newMaterial}
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          )}

          {/* Totals */}
          <div className="bg-sage-50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-around gap-3 border border-[#d4e4d6]">
            <div className="text-center">
              <p className="text-xs text-sage-600">TOTAL RECICLADO</p>
              <p className="font-serif text-xl sm:text-2xl text-[#4a6b4e]">{totalKg.toLocaleString("es-CL")} kg</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-sage-600">CO₂ EVITADO</p>
              <p className="font-serif text-xl sm:text-2xl text-[#4a6b4e]">{totalCo2.toLocaleString("es-CL")} kg</p>
            </div>
          </div>

          {/* Equivalencies */}
          {!editing && (
            <>
              <h3 className="font-serif text-lg text-sage-700 mt-6 mb-2">Equivalencias Ecológicas</h3>
              <p className="text-xs text-sage-500 mb-4">El correcto manejo de estos residuos permitió generar el siguiente impacto ambiental positivo:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sage-50 rounded-xl p-4">
                {[
                  { icon: TreePine, value: eq.trees, label: "Árboles preservados" },
                  { icon: Car, value: eq.kmNotDriven.toLocaleString("es-CL"), label: "Km no conducidos" },
                  { icon: Home, value: eq.homesEnergized, label: "Hogares energizados" },
                  { icon: Smartphone, value: eq.smartphonesCharged.toLocaleString("es-CL"), label: "Smartphones cargados" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <item.icon className="h-6 w-6 mx-auto text-sage-400 mb-1" strokeWidth={1.5} />
                    <p className="font-serif text-lg text-[#5a7d5e]">{item.value}</p>
                    <p className="text-xs text-sage-800/40">{item.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pickups detail */}
          {!editing && cert.pickups && cert.pickups.length > 0 && (
            <>
              <h3 className="font-serif text-lg text-sage-700 mt-6 mb-4">Detalle de Retiros</h3>
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="bg-[#4a6b4e] text-white">
                    <th className="text-left py-2 px-3 rounded-tl-lg font-medium">Fecha</th>
                    <th className="text-left py-2 px-3 font-medium">Ubicación</th>
                    <th className="text-left py-2 px-3 font-medium">Materiales</th>
                    <th className="text-right py-2 px-3 rounded-tr-lg font-medium">kg</th>
                  </tr>
                </thead>
                <tbody>
                  {cert.pickups.map((pickup, i) => (
                    <tr key={i} className={`border-b border-sand-100 ${i % 2 === 1 ? "bg-sage-50/50" : ""}`}>
                      <td className="py-2 px-3">{new Date(pickup.date).toLocaleDateString("es-CL")}</td>
                      <td className="py-2 px-3 text-sage-600">{pickup.location || "-"}</td>
                      <td className="py-2 px-3 text-sage-600">{pickup.materials}</td>
                      <td className="py-2 px-3 text-right">{pickup.kg.toLocaleString("es-CL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Closing note */}
          {!editing && (
            <p className="text-xs text-sage-500 mt-6 leading-relaxed">
              Los residuos fueron procesados en instalaciones de valorización debidamente autorizadas{cert.company.sanitaryResolution ? ` (${cert.company.sanitaryResolution})` : ""}. Agradecemos su compromiso con la sostenibilidad y el cuidado del entorno.
            </p>
          )}

          {/* Signature */}
          {!editing && (
            <div className="mt-8">
              <div className="w-48 border-b border-sage-800 mb-1" />
              <p className="text-xs text-sage-800/40">Firma Responsable</p>
              <p className="text-sm font-medium text-sage-800">{cert.company.name}</p>
              {cert.company.sanitaryResolution && (
                <p className="text-xs text-sage-800/40 mt-0.5">Res. Sanitaria: {cert.company.sanitaryResolution}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sage-50 border-t border-[#d4e4d6] px-8 pl-10 py-4 flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-sage-800/40">
          <span className="font-medium text-sage-800/60">Certificado #{cert.uniqueCode}</span>
          <span>Emitido: {new Date(cert.createdAt).toLocaleDateString("es-CL")}</span>
          <span>Verificar en: certirecicla.cl/verify/{cert.uniqueCode}</span>
          {cert.company.sanitaryResolution && <span>Res. Sanitaria: {cert.company.sanitaryResolution}</span>}
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 60 }}>
          {isDraft ? (
            <span className="text-[5rem] font-bold text-red-600/[0.15] -rotate-45 whitespace-nowrap select-none">BORRADOR</span>
          ) : (
            <span className="text-[4rem] font-bold text-sage-800/[0.04] -rotate-45 whitespace-nowrap select-none">{cert.uniqueCode}</span>
          )}
        </div>
      </div>

      {/* Send email dialog */}
      <SendCertificateDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        certificate={cert}
        mode={sendMode}
        onSuccess={handleSendSuccess}
      />
    </div>
  );
}
