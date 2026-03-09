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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateEquivalencies } from "@/lib/co2-calculator";
import Link from "next/link";

// Colores centralizados en src/lib/material-colors.ts

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
  company: { name: string; rut: string | null; address: string | null };
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
  const [sending, setSending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingAndSending, setPublishingAndSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMaterials, setEditMaterials] = useState<Record<string, { kg: number; co2: number }>>({});

  useEffect(() => {
    fetch(`/api/certificates/${params.id}`)
      .then((r) => r.json())
      .then(setCert)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handlePublishAndSend() {
    setPublishingAndSending(true);
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId: params.id }),
    });
    const data = await res.json();
    if (data.success) {
      setCert((prev) => prev ? { ...prev, status: "sent", sentAt: new Date().toISOString() } : null);
    } else {
      alert(data.error || "Error al enviar email");
    }
    setPublishingAndSending(false);
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

  async function handleSendEmail() {
    setSending(true);
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId: params.id }),
    });
    const data = await res.json();
    if (data.success) {
      setCert((prev) => prev ? { ...prev, status: "sent", sentAt: new Date().toISOString() } : null);
    } else {
      alert(data.error || "Error al enviar email");
    }
    setSending(false);
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
    try { setEditMaterials(JSON.parse(cert.materials)); } catch { return; }
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditMaterials({});
  }

  function updateMaterialKg(material: string, value: string) {
    const kg = parseFloat(value) || 0;
    setEditMaterials((prev) => ({
      ...prev,
      [material]: { ...prev[material], kg },
    }));
  }

  function updateMaterialCo2(material: string, value: string) {
    const co2 = parseFloat(value) || 0;
    setEditMaterials((prev) => ({
      ...prev,
      [material]: { ...prev[material], co2 },
    }));
  }

  function removeMaterial(material: string) {
    setEditMaterials((prev) => {
      const next = { ...prev };
      delete next[material];
      return next;
    });
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
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl text-sage-800">{cert.name || `Certificado ${cert.uniqueCode}`}</h1>
          <p className="text-xs text-sage-800/40 mt-0.5">{cert.uniqueCode}</p>
          <Badge className={`mt-1 ${STATUS_STYLES[cert.status] || ""}`}>
            {STATUS_LABELS[cert.status] || cert.status}
          </Badge>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {isDraft && !editing && (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Eliminar
              </Button>
            </>
          )}
          {isDraft && !editing && (
            <Button variant="outline" size="sm" onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Publicar
            </Button>
          )}
          {isDraft && !editing && cert.client?.email && (
            <Button onClick={handlePublishAndSend} disabled={publishingAndSending}>
              {publishingAndSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
              Publicar y enviar
            </Button>
          )}
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
          {!editing && !isDraft && (
            <Button variant="outline" size="sm" onClick={handleRevertToDraft} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4 mr-1" />}
              Volver a borrador
            </Button>
          )}
          {!editing && cert.status !== "sent" && cert.client?.email && (
            <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
              Enviar
            </Button>
          )}
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
      <div className={`bg-white border rounded-[14px] p-8 shadow-sm ${editing ? "border-sage-300 ring-2 ring-sage-200" : "border-sand-200"}`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-2xl text-sage-700">Certificado de Reciclaje</h2>
            <p className="text-sm text-sage-400 mt-1">CertiRecicla - Impacto Ambiental Verificado</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{cert.company.name}</p>
            {cert.company.rut && <p className="text-sage-800/40">{cert.company.rut}</p>}
            {cert.company.address && <p className="text-sage-800/40">{cert.company.address}</p>}
          </div>
        </div>

        <div className="border-t border-sand-200 pt-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-sage-800/40 uppercase">Cliente</p>
              <p className="font-medium">
                {cert.client?.parentClient && <span className="text-sage-800/40">{cert.client.parentClient.name} › </span>}
                {cert.client?.name}
              </p>
              {cert.client?.rut && <p className="text-xs text-sage-800/40">RUT: {cert.client.rut}</p>}
            </div>
            <div>
              <p className="text-xs text-sage-800/40 uppercase">Período</p>
              <p className="font-medium">
                {new Date(cert.periodStart).toLocaleDateString("es-CL")} - {new Date(cert.periodEnd).toLocaleDateString("es-CL")}
              </p>
            </div>
            <div>
              <p className="text-xs text-sage-800/40 uppercase">Código</p>
              <p className="font-medium">{cert.uniqueCode}</p>
            </div>
          </div>
        </div>

        <h3 className="font-serif text-lg text-sage-700 mb-4">
          Detalle de Materiales Reciclados
          {editing && <span className="text-sm font-normal text-sage-400 ml-2">(editando)</span>}
        </h3>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-sage-50">
              <th className="text-left py-2 px-3 rounded-l-lg">Material</th>
              <th className="text-right py-2 px-3">Cantidad (kg)</th>
              <th className="text-right py-2 px-3">CO₂ evitado (kg)</th>
              {editing && <th className="w-10 py-2 px-3 rounded-r-lg"></th>}
              {!editing && <th className="rounded-r-lg w-0"></th>}
            </tr>
          </thead>
          <tbody>
            {Object.entries(materials).map(([mat, vals]) => (
              <tr key={mat} className="border-b border-sand-100">
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
                    <input
                      type="number"
                      value={vals.co2 || ""}
                      onChange={(e) => updateMaterialCo2(mat, e.target.value)}
                      className="w-24 text-right text-sm border border-sand-300 rounded-md px-2 py-1 bg-sand-50 focus:outline-none focus:ring-1 focus:ring-sage-400"
                      min="0"
                      step="0.1"
                    />
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

        <div className="bg-sage-50 rounded-xl p-5 flex justify-between">
          <div>
            <p className="text-xs text-sage-600">TOTAL RECICLADO</p>
            <p className="font-serif text-2xl text-sage-700">{totalKg.toLocaleString("es-CL")} kg</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-sage-600">CO₂ EVITADO</p>
            <p className="font-serif text-2xl text-sage-700">{totalCo2.toLocaleString("es-CL")} kg</p>
          </div>
        </div>

        {!editing && (
          <>
            <h3 className="font-serif text-lg text-sage-700 mt-6 mb-4">Equivalencias Ecológicas</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: TreePine, value: eq.trees, label: "Árboles preservados" },
                { icon: Car, value: eq.kmNotDriven.toLocaleString("es-CL"), label: "Km no conducidos" },
                { icon: Home, value: eq.homesEnergized, label: "Hogares energizados" },
                { icon: Smartphone, value: eq.smartphonesCharged.toLocaleString("es-CL"), label: "Smartphones cargados" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="h-6 w-6 mx-auto text-sage-400 mb-1" strokeWidth={1.5} />
                  <p className="font-serif text-lg text-sage-600">{item.value}</p>
                  <p className="text-xs text-sage-800/40">{item.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-sand-200 mt-6 pt-4 flex justify-between text-xs text-sage-800/30">
          <span>Certificado #{cert.uniqueCode}</span>
          <span>Emitido: {new Date(cert.createdAt).toLocaleDateString("es-CL")}</span>
          <span>Generado por CertiRecicla</span>
        </div>
      </div>
    </div>
  );
}
