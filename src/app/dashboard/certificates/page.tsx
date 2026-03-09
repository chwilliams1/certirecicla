"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileCheck, Download, Plus, Mail, Loader2, Check } from "lucide-react";
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

interface Certificate {
  id: string;
  uniqueCode: string;
  name: string;
  totalKg: number;
  totalCo2: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  client: { name: string; email: string | null; parentClient?: { name: string } | null };
}

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
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

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

  function toggleCert(id: string) {
    setSelectedCerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isSendable(cert: Certificate) {
    return (cert.status === "draft" || cert.status === "published") && !!cert.client?.email;
  }

  async function handleBulkSend() {
    const toSend = Array.from(selectedCerts);
    if (toSend.length === 0) return;
    setBulkSending(true);
    setBulkProgress(0);

    for (let i = 0; i < toSend.length; i++) {
      try {
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certificateId: toSend[i] }),
        });
        setCertificates((prev) =>
          prev.map((c) => c.id === toSend[i] ? { ...c, status: "sent" } : c)
        );
      } catch {
        // Continue with remaining
      }
      setBulkProgress(i + 1);
    }

    setSelectedCerts(new Set());
    setBulkSending(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Certificados</h1>
          <p className="text-sm text-sage-800/40">{certificates.length} certificados emitidos</p>
        </div>
        <Link href="/dashboard/certificates/new">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" /> Crear certificado
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
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
          <SelectTrigger className="w-40">
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
            <div key={cert.id} className={`bg-sand-50 border rounded-[14px] p-5 card-hover ${selectedCerts.has(cert.id) ? "border-sage-400 ring-1 ring-sage-200" : "border-sand-300"}`}>
              <div className="flex items-center gap-4">
                {isSendable(cert) && (
                  <button
                    onClick={() => toggleCert(cert.id)}
                    className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedCerts.has(cert.id) ? "bg-sage-500 border-sage-500" : "border-sand-300 hover:border-sage-300"
                    }`}
                  >
                    {selectedCerts.has(cert.id) && <Check className="h-3 w-3 text-white" />}
                  </button>
                )}
                <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-sage-500" />
                </div>
                <Link href={`/dashboard/certificates/${cert.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sage-800 truncate">
                      {cert.name || (
                        <>
                          {cert.client?.parentClient && <span className="text-sage-800/40">{cert.client.parentClient.name} › </span>}
                          {cert.client?.name}
                        </>
                      )}
                    </p>
                    <Badge className={STATUS_STYLES[cert.status] || ""}>{cert.status}</Badge>
                  </div>
                  <p className="text-xs text-sage-800/40">
                    {cert.uniqueCode}
                  </p>
                </Link>
                <div className="text-right">
                  <p className="text-sm font-medium text-sage-800">{cert.totalKg.toLocaleString("es-CL")} kg</p>
                  <p className="text-xs text-sage-500">{cert.totalCo2.toLocaleString("es-CL")} kg CO₂</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(cert.id, cert.name || cert.uniqueCode)}>
                  <Download className="h-4 w-4" />
                </Button>
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
      {/* Floating action bar for bulk send */}
      {selectedCerts.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-sage-800 text-white rounded-2xl shadow-xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm">
            {selectedCerts.size} {selectedCerts.size === 1 ? "certificado seleccionado" : "certificados seleccionados"}
          </span>
          <div className="w-px h-5 bg-white/20" />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedCerts(new Set())}
            className="bg-white/10 hover:bg-white/20 text-white border-0"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleBulkSend}
            disabled={bulkSending}
            className="bg-white text-sage-800 hover:bg-white/90"
          >
            {bulkSending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                {bulkProgress}/{selectedCerts.size}
              </>
            ) : (
              <>
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Publicar y enviar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
