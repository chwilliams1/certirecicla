"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import { ArrowLeft, Mail, Phone, MapPin, Trash2, ChevronDown, ChevronRight, Package, Truck, FileCheck, Pencil, Save, X, Loader2, Users, FileText, User, Building2, AlertTriangle, MoreHorizontal, Plus, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { formatRut } from "@/lib/validations";
import { calculateEquivalencies } from "@/lib/co2-calculator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  none: { label: "Solo retiro", className: "bg-sand-100 text-sage-800/50 border-sand-300" },
  draft: { label: "Certificado borrador", className: "bg-amber-50 text-amber-700 border-amber-200" },
  published: { label: "Certificado emitido", className: "bg-sage-50 text-sage-600 border-sage-200" },
  sent: { label: "Certificado enviado", className: "bg-blue-50 text-blue-600 border-blue-200" },
};

const STATUS_RANK: Record<string, number> = { none: 0, draft: 1, published: 2, sent: 3 };

// Colores centralizados en src/lib/material-colors.ts

interface RecordItem {
  id: string;
  material: string;
  quantityKg: number;
  co2Saved: number;
  pickupDate: string;
  location: string | null;
  branchName?: string;
}

interface BranchItem {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  contactName: string | null;
  _count: { records: number; certificates: number };
  totalKg: number;
  totalCo2: number;
  topMaterials: Array<{ material: string; kg: number }>;
  lastPickup: string | null;
  certsSent: number;
  certsPublished: number;
}

interface ClientDetail {
  id: string;
  name: string;
  rut: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactName: string | null;
  notes: string | null;
  parentClientId: string | null;
  parentClient: { id: string; name: string } | null;
  branches: BranchItem[];
  records: RecordItem[];
  certificates: Array<{
    id: string;
    uniqueCode: string;
    name: string;
    totalKg: number;
    totalCo2: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
    branchName?: string;
  }>;
  _count: { records: number; certificates: number };
  consolidated: {
    totalKg: number;
    totalCo2: number;
    totalRecords: number;
    totalCertificates: number;
  } | null;
}

interface Pickup {
  key: string;
  date: string;
  location: string | null;
  branchName?: string;
  materials: Array<{ material: string; quantityKg: number; co2Saved: number }>;
  totalKg: number;
  totalCo2: number;
}

function groupRecordsIntoPickups(records: RecordItem[]): Pickup[] {
  const map = new Map<string, Pickup>();

  for (const r of records) {
    const dateStr = r.pickupDate.slice(0, 10);
    const key = `${r.branchName || ""}|${dateStr}|${r.location || ""}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        date: dateStr,
        location: r.location,
        branchName: r.branchName,
        materials: [],
        totalKg: 0,
        totalCo2: 0,
      });
    }

    const pickup = map.get(key)!;
    pickup.materials.push({
      material: r.material,
      quantityKg: r.quantityKg,
      co2Saved: r.co2Saved,
    });
    pickup.totalKg += r.quantityKg;
    pickup.totalCo2 += r.co2Saved;
  }

  // Sort by date descending
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPickup, setExpandedPickup] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    empresa: "", sucursal: "", rut: "", email: "", phone: "", address: "", contactName: "", notes: "",
  });
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [portalCopied, setPortalCopied] = useState(false);
  const [generatingPortal, setGeneratingPortal] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((r) => r.json())
      .then(setClient)
      .finally(() => setLoading(false));
  }, [params.id]);

  const pickups = useMemo(() => {
    if (!client) return [];
    return groupRecordsIntoPickups(client.records);
  }, [client]);

  function startEditing() {
    if (!client) return;
    // If this is a branch, empresa = parent name, sucursal = this name
    // If this is a parent or standalone, empresa = this name, sucursal = ""
    const isBranch = !!client.parentClient;
    setEditForm({
      empresa: isBranch ? client.parentClient!.name : client.name,
      sucursal: isBranch ? client.name : "",
      rut: client.rut || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      contactName: client.contactName || "",
      notes: client.notes || "",
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const isBranch = !!client?.parentClient;
    const payload = {
      name: isBranch ? editForm.sucursal : editForm.empresa,
      rut: editForm.rut || null,
      email: editForm.email || null,
      phone: editForm.phone || null,
      address: editForm.address || null,
      contactName: editForm.contactName || null,
      notes: editForm.notes || null,
    };
    const res = await fetch(`/api/clients/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setClient((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleGeneratePortal() {
    setGeneratingPortal(true);
    try {
      const res = await fetch("/api/portal/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.url}`;
        setPortalUrl(fullUrl);
      }
    } catch {}
    setGeneratingPortal(false);
  }

  async function copyPortalUrl() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setPortalCopied(true);
    setTimeout(() => setPortalCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de desactivar este cliente? Esta acción no se puede deshacer fácilmente.")) return;
    await fetch(`/api/clients/${params.id}`, { method: "DELETE" });
    router.push("/dashboard/clients");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-32 w-full rounded-[14px]" />
      </div>
    );
  }

  if (!client) return <p>Cliente no encontrado</p>;

  const ownTotalKg = client.records.reduce((s, r) => s + r.quantityKg, 0);
  const ownTotalCo2 = client.records.reduce((s, r) => s + r.co2Saved, 0);
  const hasBranches = client.branches.length > 0;
  const displayKg = client.consolidated ? client.consolidated.totalKg : ownTotalKg;
  const displayCo2 = client.consolidated ? client.consolidated.totalCo2 : ownTotalCo2;
  const displayCerts = client.consolidated ? client.consolidated.totalCertificates : client._count.certificates;

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl text-sage-800">
            {client.parentClient && (
              <Link href={`/dashboard/clients/${client.parentClient.id}`} className="text-sage-800/40 hover:text-sage-600 transition-colors">
                {client.parentClient.name} ›{" "}
              </Link>
            )}
            {client.name}
          </h1>
          {client.rut && <p className="text-sm text-sage-800/40">RUT: {client.rut}</p>}
          {hasBranches && (
            <p className="text-sm text-sage-500">{client.branches.length} sucursales</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/pickups/new?clientId=${client.id}`}>
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-1" /> Registrar retiro
            </Button>
          </Link>
          <Link href={`/dashboard/certificates/new?clientId=${client.id}`}>
            <Button variant="outline" size="sm">
              <FileCheck className="h-4 w-4 mr-1" /> Crear certificado
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleGeneratePortal} disabled={generatingPortal}>
            {generatingPortal ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-1" />}
            Portal
          </Button>
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      </div>

      {portalUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-[14px] p-4">
          <div className="flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800">Portal del cliente generado</p>
              <p className="text-xs text-blue-600 truncate mt-0.5">{portalUrl}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyPortalUrl} className="flex-shrink-0">
              {portalCopied ? <Check className="h-4 w-4 mr-1 text-emerald-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {portalCopied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <p className="text-[11px] text-blue-500/60 mt-2">Comparte este enlace con tu cliente para que vea su impacto ambiental y descargue certificados.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 text-center">
          <p className="text-2xl font-serif text-sage-500">{displayKg.toLocaleString("es-CL")}</p>
          <p className="text-xs text-sage-800/40">kg reciclados</p>
          {hasBranches && <p className="text-[10px] text-sage-800/25 mt-1">consolidado</p>}
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 text-center">
          <p className="text-2xl font-serif text-sage-500">{displayCo2.toLocaleString("es-CL")}</p>
          <p className="text-xs text-sage-800/40">kg CO₂ evitado</p>
          {hasBranches && <p className="text-[10px] text-sage-800/25 mt-1">consolidado</p>}
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 text-center">
          <p className="text-2xl font-serif text-sage-500">{pickups.length}</p>
          <p className="text-xs text-sage-800/40">retiros</p>
          {hasBranches && <p className="text-[10px] text-sage-800/25 mt-1">consolidado</p>}
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 text-center">
          <p className="text-2xl font-serif text-sage-500">{displayCerts}</p>
          <p className="text-xs text-sage-800/40">certificados</p>
          {hasBranches && <p className="text-[10px] text-sage-800/25 mt-1">consolidado</p>}
        </div>
      </div>

      {displayCo2 > 0 && (() => {
        const eq = calculateEquivalencies(displayCo2);
        const best = [
          { emoji: "🌳", value: eq.trees, label: "árboles preservados" },
          { emoji: "🚗", value: eq.kmNotDriven, label: "km no recorridos" },
          { emoji: "📱", value: eq.smartphonesCharged, label: "smartphones cargados" },
          { emoji: "🏠", value: eq.homesEnergized, label: "hogares energizados" },
        ].sort((a, b) => b.value - a.value)[0];
        return (
          <p className="text-center text-sm text-sage-500">
            {best.emoji} El impacto {hasBranches ? "consolidado" : "de este cliente"} equivale a {best.value.toLocaleString("es-CL")} {best.label}
          </p>
        );
      })()}

      {(!client.email || !client.rut) && (
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Datos pendientes para certificados</p>
              <p className="text-xs text-amber-600 mt-1">
                {!client.email && !client.rut && "Falta email y RUT — necesarios para emitir y enviar certificados."}
                {!client.email && client.rut && "Falta email — necesario para enviar certificados."}
                {client.email && !client.rut && "Falta RUT — necesario para identificación en certificados."}
              </p>
              <button
                onClick={startEditing}
                className="text-xs text-amber-700 font-medium underline hover:text-amber-900 mt-2 transition-colors"
              >
                Completar datos ahora
              </button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Perfil</TabsTrigger>
          {client.branches.length > 0 && (
            <TabsTrigger value="branches">Sucursales ({client.branches.length})</TabsTrigger>
          )}
          <TabsTrigger value="records">Retiros ({pickups.length})</TabsTrigger>
          <TabsTrigger value="certificates">Certificados ({client.certificates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          {editing ? (
            <div className="space-y-4">
              {/* Empresa & Sucursal */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                  <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Building2 className="h-3.5 w-3.5" /> Empresa *
                  </label>
                  {client.parentClient ? (
                    <p className="text-sm text-sage-800 py-2">{editForm.empresa}</p>
                  ) : (
                    <Input
                      value={editForm.empresa}
                      onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                      className="bg-white"
                      placeholder="Nombre o razón social..."
                    />
                  )}
                </div>
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                  <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Package className="h-3.5 w-3.5" /> Sucursal
                  </label>
                  {client.parentClient ? (
                    <Input
                      value={editForm.sucursal}
                      onChange={(e) => setEditForm((f) => ({ ...f, sucursal: e.target.value }))}
                      className="bg-white"
                      placeholder="Nombre de la sucursal..."
                    />
                  ) : (
                    <p className="text-xs text-sage-800/30 py-2">Este cliente no es una sucursal</p>
                  )}
                </div>
              </div>

              {/* RUT — empresa level */}
              <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <FileText className="h-3.5 w-3.5" /> RUT de la empresa
                </label>
                {client.parentClient ? (
                  <>
                    <p className="text-[10px] text-sage-800/30 mb-3">Se gestiona desde la empresa madre</p>
                    <p className="text-sm text-sage-800 py-1">{editForm.rut || <span className="text-sage-800/30 italic">Sin RUT</span>}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-sage-800/30 mb-3">Se aplicará a todas las sucursales</p>
                    <Input
                      placeholder="12.345.678-9"
                      value={editForm.rut}
                      onChange={(e) => setEditForm((f) => ({ ...f, rut: formatRut(e.target.value) }))}
                      className="bg-white"
                    />
                  </>
                )}
              </div>

              {/* Contacto de sucursal: Email, Phone, Contact */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-sage-800/40 uppercase tracking-wider px-1">
                  {client.parentClient ? "Datos de contacto de la sucursal" : "Datos de contacto"}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </label>
                    <Input
                      type="email"
                      placeholder="correo@empresa.cl"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Phone className="h-3.5 w-3.5" /> Teléfono
                    </label>
                    <Input
                      placeholder="+56 9 1234 5678"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <User className="h-3.5 w-3.5" /> Contacto
                    </label>
                    <Input
                      placeholder="Nombre del contacto"
                      value={editForm.contactName}
                      onChange={(e) => setEditForm((f) => ({ ...f, contactName: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                    <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <MapPin className="h-3.5 w-3.5" /> Dirección
                    </label>
                    <Input
                      placeholder="Dirección"
                      value={editForm.address}
                      onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
                <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <FileText className="h-3.5 w-3.5" /> Notas
                </label>
                <Input
                  placeholder="Notas adicionales"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  className="bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Desactivar
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving || !editForm.empresa.trim()} className="flex-[2]">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-1.5" /> Guardar cambios</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
              {client.contactName && (
                <div>
                  <p className="text-xs text-sage-800/40">Contacto</p>
                  <p className="text-sm">{client.contactName}</p>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sage-400" />
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-sage-400" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sage-400" />
                  <span className="text-sm">{client.address}</span>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-xs text-sage-800/40">Notas</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
              {!client.contactName && !client.email && !client.phone && !client.address && !client.notes && (
                <p className="text-sm text-sage-800/40 text-center py-2">
                  Sin datos de contacto. <button onClick={startEditing} className="text-sage-500 underline hover:text-sage-700">Agregar datos</button>
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {hasBranches && (
          <TabsContent value="branches" className="mt-4 space-y-4">
            {/* Summary bar */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-[14px] p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-serif text-emerald-700">{client.branches.length}</p>
                  <p className="text-[10px] text-emerald-600/60 uppercase tracking-wider">Sucursales</p>
                </div>
                <div>
                  <p className="text-lg font-serif text-emerald-700">{client.branches.reduce((s, b) => s + b.totalKg, 0).toLocaleString("es-CL")}</p>
                  <p className="text-[10px] text-emerald-600/60 uppercase tracking-wider">kg total suc.</p>
                </div>
                <div>
                  <p className="text-lg font-serif text-emerald-700">{client.branches.reduce((s, b) => s + b.totalCo2, 0).toLocaleString("es-CL")}</p>
                  <p className="text-[10px] text-emerald-600/60 uppercase tracking-wider">kg CO₂ suc.</p>
                </div>
                <div>
                  <p className="text-lg font-serif text-emerald-700">{client.branches.reduce((s, b) => s + b._count.certificates, 0)}</p>
                  <p className="text-[10px] text-emerald-600/60 uppercase tracking-wider">Certificados suc.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {client.branches.map((branch) => (
                <Link key={branch.id} href={`/dashboard/clients/${branch.id}`}>
                  <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 card-hover space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-sage-500">{branch.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sage-800">{branch.name}</p>
                        <div className="flex items-center gap-3 text-xs text-sage-800/40">
                          {branch.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{branch.email}</span>}
                          {branch.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{branch.address}</span>}
                          {branch.contactName && <span className="flex items-center gap-1"><User className="h-3 w-3" />{branch.contactName}</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-sage-800/20 shrink-0" />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white/60 rounded-lg p-2.5 text-center border border-sand-200">
                        <p className="text-sm font-serif text-sage-700">{branch.totalKg.toLocaleString("es-CL")}</p>
                        <p className="text-[10px] text-sage-800/30">kg reciclados</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 text-center border border-sand-200">
                        <p className="text-sm font-serif text-sage-700">{branch.totalCo2.toLocaleString("es-CL")}</p>
                        <p className="text-[10px] text-sage-800/30">kg CO₂</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 text-center border border-sand-200">
                        <p className="text-sm font-serif text-sage-700">{branch._count.records}</p>
                        <p className="text-[10px] text-sage-800/30">retiros</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 text-center border border-sand-200">
                        <p className="text-sm font-serif text-sage-700">{branch._count.certificates}</p>
                        <p className="text-[10px] text-sage-800/30">certificados</p>
                      </div>
                    </div>

                    {(branch.topMaterials.length > 0 || branch.lastPickup) && (
                      <div className="flex items-center justify-between text-xs">
                        {branch.topMaterials.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {branch.topMaterials.map((m) => (
                              <span
                                key={m.material}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}
                              >
                                {m.material} ({m.kg.toLocaleString("es-CL")} kg)
                              </span>
                            ))}
                          </div>
                        )}
                        {branch.lastPickup && (
                          <span className="text-sage-800/30 whitespace-nowrap ml-2">
                            Último retiro: {new Date(branch.lastPickup).toLocaleDateString("es-CL")}
                          </span>
                        )}
                      </div>
                    )}

                    {branch._count.records === 0 && (
                      <p className="text-xs text-sage-800/30 text-center">Sin retiros registrados</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="records" className="mt-4">
          <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
            {pickups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-3">🌿</p>
                <p className="text-sm text-sage-600">Este cliente aún no tiene retiros.</p>
                <p className="text-xs text-sage-800/40 mt-1">Registra el primero y empieza a medir su impacto.</p>
                <Link href={`/dashboard/pickups/new?clientId=${client.id}`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Truck className="h-4 w-4 mr-1" /> Registrar retiro
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sand-100">
                      <th className="w-8 py-3 px-3"></th>
                      {hasBranches && <th className="text-left py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Sucursal</th>}
                      <th className="text-left py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Fecha</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Ubicación</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Materiales</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Total kg</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">CO₂ evitado</th>
                      <th className="text-center py-3 px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Estado</th>
                      <th className="w-10 py-3 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickups.map((pickup) => {
                      const isExpanded = expandedPickup === pickup.key;
                      const pickupDate = new Date(pickup.date + "T12:00:00");
                      const matchingCerts = client.certificates.filter((cert) => {
                        const start = new Date(cert.periodStart);
                        const end = new Date(cert.periodEnd);
                        return pickupDate >= start && pickupDate <= end;
                      });
                      let certStatus: string = "none";
                      let certId: string | null = null;
                      for (const cert of matchingCerts) {
                        const rank = STATUS_RANK[cert.status] ?? 0;
                        if (rank > (STATUS_RANK[certStatus] ?? 0)) {
                          certStatus = cert.status;
                          certId = cert.id;
                        }
                      }
                      return (
                        <PickupRow
                          key={pickup.key}
                          pickup={pickup}
                          isExpanded={isExpanded}
                          onToggle={() => setExpandedPickup(isExpanded ? null : pickup.key)}
                          certStatus={certStatus}
                          certId={certId}
                          clientId={client.id}
                          showBranch={hasBranches}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          {client.certificates.length === 0 ? (
            <div className="bg-sand-50 border border-sand-300 rounded-[14px] text-center py-12">
              <p className="text-3xl mb-3">📄</p>
              <p className="text-sm text-sage-600">Sin certificados todavía.</p>
              <p className="text-xs text-sage-800/40 mt-1">Convierte los retiros de este cliente en impacto documentado.</p>
              <Link href={`/dashboard/certificates/new?clientId=${client.id}`}>
                <Button variant="outline" size="sm" className="mt-4">
                  <FileCheck className="h-4 w-4 mr-1" /> Crear certificado
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sand-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Nombre</th>
                      {hasBranches && <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Sucursal</th>}
                      <th className="text-left py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Período</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Kg reciclados</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">CO₂ evitado</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...client.certificates]
                      .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
                      .map((cert) => {
                        const endDate = new Date(cert.periodEnd);
                        const periodLabel = endDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" }).toUpperCase();
                        return (
                          <tr key={cert.id} className="border-t border-sand-200 hover:bg-white/50 transition-colors">
                            <td className="py-3 px-4">
                              <Link href={`/dashboard/certificates/${cert.id}`} className="hover:underline">
                                <p className="font-medium text-sage-800 text-sm">{cert.name || cert.uniqueCode}</p>
                              </Link>
                            </td>
                            {hasBranches && (
                              <td className="py-3 px-4 text-xs text-sage-600 whitespace-nowrap">
                                {cert.branchName || "Sede principal"}
                              </td>
                            )}
                            <td className="py-3 px-4 text-xs text-sage-800/60 whitespace-nowrap">
                              {periodLabel}
                            </td>
                            <td className="py-3 px-4 text-right text-xs font-medium text-sage-800 tabular-nums whitespace-nowrap">
                              {cert.totalKg.toLocaleString("es-CL")} kg
                            </td>
                            <td className="py-3 px-4 text-right text-xs text-sage-500 tabular-nums whitespace-nowrap">
                              {cert.totalCo2.toLocaleString("es-CL")} kg
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={cert.status === "published" ? "default" : cert.status === "sent" ? "secondary" : "outline"}>
                                {cert.status === "draft" ? "Borrador" : cert.status === "published" ? "Emitido" : cert.status === "sent" ? "Enviado" : cert.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PickupRow({ pickup, isExpanded, onToggle, certStatus, certId, clientId, showBranch }: { pickup: Pickup; isExpanded: boolean; onToggle: () => void; certStatus: string; certId: string | null; clientId: string; showBranch?: boolean }) {
  const status = STATUS_CONFIG[certStatus] || STATUS_CONFIG.none;
  const editParams = new URLSearchParams({
    clientId,
    date: pickup.date,
    location: pickup.location || "",
  }).toString();

  return (
    <>
      <tr
        className="border-t border-sand-200 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 px-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-sage-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-sage-400" />
          )}
        </td>
        {showBranch && (
          <td className="py-3 px-3 text-xs text-sage-600 whitespace-nowrap">
            {pickup.branchName || "Sede principal"}
          </td>
        )}
        <td className="py-3 px-3 font-medium text-sage-800 text-xs whitespace-nowrap">
          {new Date(pickup.date + "T12:00:00").toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="py-3 px-3 text-xs text-sage-800/50 truncate max-w-[200px]">
          {pickup.location || "—"}
        </td>
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            {pickup.materials.map((m, i) => (
              <span
                key={i}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}
              >
                {m.material}
              </span>
            ))}
          </div>
        </td>
        <td className="py-3 px-3 text-right text-xs font-medium text-sage-800 tabular-nums whitespace-nowrap">
          {pickup.totalKg.toLocaleString("es-CL")} kg
        </td>
        <td className="py-3 px-3 text-right text-xs text-sage-500 tabular-nums whitespace-nowrap">
          {pickup.totalCo2.toLocaleString("es-CL")} kg
        </td>
        <td className="py-3 px-3 text-right">
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${status.className}`}>
            {status.label}
          </span>
        </td>
        <td className="py-3 px-3 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-sand-200 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-sage-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {certStatus === "none" ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/pickups/edit?${editParams}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar retiro
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/certificates/new?clientId=${clientId}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear certificado
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/certificates/${certId}`}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Ver certificado
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={showBranch ? 9 : 8} className="p-0">
            <div className="bg-sand-100/50 border-t border-sand-200 px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-3.5 w-3.5 text-sage-400" />
                <span className="text-xs font-medium text-sage-700">
                  Detalle del retiro — {pickup.materials.length} {pickup.materials.length === 1 ? "material" : "materiales"}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left py-2 px-4 font-medium text-sage-800/40">Material</th>
                      <th className="text-right py-2 px-4 font-medium text-sage-800/40">Cantidad</th>
                      <th className="text-right py-2 px-4 font-medium text-sage-800/40">CO₂ evitado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickup.materials.map((m, i) => (
                      <tr key={i} className="border-t border-sand-100">
                        <td className="py-2 px-4">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"}`}>
                            {m.material}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right text-sage-800 tabular-nums">
                          {m.quantityKg.toLocaleString("es-CL")} kg
                        </td>
                        <td className="py-2 px-4 text-right text-sage-500 tabular-nums">
                          {m.co2Saved.toLocaleString("es-CL")} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-sand-200 bg-sand-50/50">
                      <td className="py-2 px-4 font-medium text-sage-700">Total</td>
                      <td className="py-2 px-4 text-right font-medium text-sage-800 tabular-nums">
                        {pickup.totalKg.toLocaleString("es-CL")} kg
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-sage-500 tabular-nums">
                        {pickup.totalCo2.toLocaleString("es-CL")} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {pickup.location && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-sage-800/40">
                  <MapPin className="h-3 w-3" />
                  {pickup.location}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
