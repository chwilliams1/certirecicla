"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileCheck, Download, Plus, Mail, Check, MoreVertical, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleBulkPublish} disabled={bulkPublishing}>
              {bulkPublishing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
              Publicar todos
            </Button>
          )}
          <Link href="/dashboard/certificates/new" className="flex-1 sm:flex-initial">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-1.5" /> Crear certificado
            </Button>
          </Link>
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
              <div className="skeleton h-5 w-48 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cert) => (
            <div key={cert.id} className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 sm:p-5 card-hover">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                  <FileCheck className="h-5 w-5 text-sage-500" />
                </div>
                <Link href={`/dashboard/certificates/${cert.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sage-800 truncate">
                      {cert.name || (
                        <>
                          {cert.client?.parentClient && <span className="text-sage-800/40">{cert.client.parentClient.name} › </span>}
                          {cert.client?.name}
                        </>
                      )}
                    </p>
                    <Badge className={STATUS_STYLES[cert.status] || ""}>{STATUS_LABELS[cert.status] || cert.status}</Badge>
                  </div>
                  <p className="text-xs text-sage-800/40">
                    {cert.uniqueCode}
                  </p>
                  <div className="flex items-center gap-3 mt-1 sm:hidden">
                    <p className="text-xs font-medium text-sage-800">{cert.totalKg.toLocaleString("es-CL")} kg</p>
                    <p className="text-xs text-sage-500">{cert.totalCo2.toLocaleString("es-CL")} kg CO₂</p>
                  </div>
                </Link>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-sage-800">{cert.totalKg.toLocaleString("es-CL")} kg</p>
                  <p className="text-xs text-sage-500">{cert.totalCo2.toLocaleString("es-CL")} kg CO₂</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="min-w-[44px] min-h-[44px]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
              </div>
            </div>
          ))}
          {filtered.length === 0 && !search && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">📄</p>
              <p className="text-sm text-sage-600">Sin certificados todavía.</p>
              <p className="text-xs text-sage-800/40 mt-1">Cuando estés listo, convierte tus retiros en impacto documentado.</p>
              <Link href="/dashboard/certificates/new">
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Crear certificado
                </Button>
              </Link>
            </div>
          )}
          {filtered.length === 0 && search && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-sage-600">Nada por aquí con esos filtros.</p>
              <p className="text-xs text-sage-800/40 mt-1">Prueba ampliando la búsqueda.</p>
            </div>
          )}
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
