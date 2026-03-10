"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, Plus, Mail, Check, MoreHorizontal, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SendCertificateDialog } from "@/components/send-certificate-dialog";
import { PermissionGate } from "@/components/permission-gate";

interface Certificate {
  id: string;
  uniqueCode: string;
  name: string;
  totalKg: number;
  totalCo2: number;
  materials: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  client: { name: string; email: string | null; parentClient?: { name: string } | null };
  company: { name: string };
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

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendDialogCert, setSendDialogCert] = useState<Certificate | null>(null);
  const [sendMode, setSendMode] = useState<"send" | "publishAndSend">("send");
  const [bulkPublishing, setBulkPublishing] = useState(false);

  function openSendDialog(cert: Certificate, mode: "send" | "publishAndSend") {
    setSendDialogCert(cert);
    setSendMode(mode);
    setSendDialogOpen(true);
  }

  function handleSendSuccess() {
    if (sendDialogCert) {
      setCertificates((prev) =>
        prev.map((c) => c.id === sendDialogCert.id ? { ...c, status: "sent" } : c)
      );
    }
  }

  async function handlePublish(certId: string) {
    const res = await fetch(`/api/certificates/${certId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    if (res.ok) {
      setCertificates((prev) =>
        prev.map((c) => c.id === certId ? { ...c, status: "published" } : c)
      );
    }
  }

  async function handleBulkPublish() {
    const drafts = filtered.filter((c) => c.status === "draft");
    if (drafts.length === 0) return;
    if (!confirm(`¿Publicar ${drafts.length} certificado${drafts.length > 1 ? "s" : ""} en borrador?`)) return;
    setBulkPublishing(true);
    for (const cert of drafts) {
      await handlePublish(cert.id);
    }
    setBulkPublishing(false);
  }

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/certificates?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function handleDownloadPdf(certId: string, name: string) {
    const res = await fetch(`/api/certificates/${certId}/pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (name || "certificado").replace(/[()]/g, "").replace(/\s*—\s*/g, "_").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ_\-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    a.download = `${safeName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = certificates.filter(
    (c) =>
      c.uniqueCode.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.client?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.client?.parentClient?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Certificados</h1>
          <p className="text-sm text-sage-800/40">{certificates.length} certificados emitidos</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {certificates.some((c) => c.status === "draft") && (
            <PermissionGate permission="certificates:create">
              <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleBulkPublish} disabled={bulkPublishing}>
                {bulkPublishing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                Publicar todos
              </Button>
            </PermissionGate>
          )}
          <PermissionGate permission="certificates:create">
            <Link href="/dashboard/certificates/new" className="flex-1 sm:flex-initial">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-1.5" /> Crear certificado
              </Button>
            </Link>
          </PermissionGate>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-800/30" />
          <Input
            placeholder="Buscar por código o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-[14px]" />
          <div className="skeleton h-64 w-full rounded-[14px]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          {!search ? (
            <>
              <p className="text-3xl mb-3">📄</p>
              <p className="text-sm text-sage-600">Sin certificados todavía.</p>
              <p className="text-xs text-sage-800/40 mt-1">Cuando estés listo, convierte tus retiros en impacto documentado.</p>
              <Link href="/dashboard/certificates/new">
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Crear certificado
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-sage-600">Nada por aquí con esos filtros.</p>
              <p className="text-xs text-sage-800/40 mt-1">Prueba ampliando la búsqueda.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-100">
                  <th className="text-left py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Certificado</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">kg</th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">CO₂</th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="w-10 py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="border-t border-sand-200 hover:bg-white/50 transition-colors">
                    <td className="py-3 px-3 sm:px-4">
                      <Link href={`/dashboard/certificates/${cert.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-sage-800 truncate">
                            {cert.name || cert.client?.name}
                          </span>
                          {/* Status dot visible on mobile only */}
                          <span className={`sm:hidden inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                            cert.status === "sent" ? "bg-blue-400" : cert.status === "published" ? "bg-sage-400" : "bg-sand-400"
                          }`} />
                        </div>
                        <span className="text-[11px] text-sage-800/40">{cert.uniqueCode}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                      <span className="text-xs text-sage-800/60 truncate block max-w-[180px]">
                        {cert.client?.parentClient && <span className="text-sage-800/30">{cert.client.parentClient.name} › </span>}
                        {cert.client?.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-xs font-medium text-sage-800 tabular-nums whitespace-nowrap">
                      {cert.totalKg.toLocaleString("es-CL")} kg
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-xs text-sage-500 tabular-nums whitespace-nowrap hidden sm:table-cell">
                      {cert.totalCo2.toLocaleString("es-CL")} kg
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLES[cert.status] || ""}`}>
                        {STATUS_LABELS[cert.status] || cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-sand-200 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-sage-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadPdf(cert.id, cert.name || cert.uniqueCode)}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </DropdownMenuItem>
                          {cert.status === "draft" && (
                            <DropdownMenuItem onClick={() => handlePublish(cert.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Publicar
                            </DropdownMenuItem>
                          )}
                          {cert.status === "draft" && (
                            <DropdownMenuItem onClick={() => openSendDialog(cert, "publishAndSend")}>
                              <Mail className="h-4 w-4 mr-2" />
                              Publicar y enviar
                            </DropdownMenuItem>
                          )}
                          {cert.status === "published" && (
                            <DropdownMenuItem onClick={() => openSendDialog(cert, "send")}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar por email
                            </DropdownMenuItem>
                          )}
                          {cert.status === "sent" && (
                            <DropdownMenuItem onClick={() => openSendDialog(cert, "send")}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Send email dialog */}
      {sendDialogCert && (
        <SendCertificateDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          certificate={sendDialogCert as any}
          mode={sendMode}
          onSuccess={handleSendSuccess}
        />
      )}

    </div>
  );
}
