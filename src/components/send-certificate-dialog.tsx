"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, FileCheck, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPeriod } from "@/lib/format-period";

interface CertificateForSend {
  id: string;
  uniqueCode: string;
  name: string;
  totalKg: number;
  totalCo2: number;
  materials: string;
  periodStart: string;
  periodEnd: string;
  client: { name: string; email: string | null };
  company: { name: string };
}

interface SendCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateForSend;
  mode?: "send" | "publishAndSend";
  onSuccess?: () => void;
}

function generateDefaultBody(cert: CertificateForSend): string {
  let materials: Record<string, { kg: number; co2: number }> = {};
  try {
    materials = JSON.parse(cert.materials);
  } catch {
    /* empty */
  }

  const materialLines = Object.entries(materials)
    .map(([name, { kg }]) => `  - ${name}: ${kg.toLocaleString("es-CL")} kg`)
    .join("\n");

  const period = formatPeriod(cert.periodStart);

  return `Estimado/a equipo de ${cert.client.name},

Adjunto encontrarán su certificado de reciclaje correspondiente a ${period}.

Resumen de materiales:
${materialLines}

Total reciclado: ${cert.totalKg.toLocaleString("es-CL")} kg
CO₂ evitado: ${cert.totalCo2.toLocaleString("es-CL")} kg

Gracias por su compromiso con el medio ambiente.

Saludos,
${cert.company.name}`;
}

function generateDefaultSubject(cert: CertificateForSend): string {
  return `Certificado de Reciclaje — ${cert.client.name} (${formatPeriod(cert.periodStart)})`;
}

export function SendCertificateDialog({
  open,
  onOpenChange,
  certificate,
  mode = "send",
  onSuccess,
}: SendCertificateDialogProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Reset fields when dialog opens
  useEffect(() => {
    if (open) {
      setTo(certificate.client.email || "");
      setCc("");
      setSubject(generateDefaultSubject(certificate));
      setBody(generateDefaultBody(certificate));
      setError("");
      setSending(false);
    }
  }, [open, certificate]);

  async function handleSend() {
    if (!to.trim()) {
      setError("El email del destinatario es requerido");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: certificate.id,
          to: to.trim(),
          cc: cc.trim() || undefined,
          subject: subject.trim(),
          body: body.trim(),
          publish: mode === "publishAndSend",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Error al enviar el email");
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      setError("Error de conexión al enviar");
    } finally {
      setSending(false);
    }
  }

  const period = formatPeriod(certificate.periodStart);
  const isPublish = mode === "publishAndSend";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-sage-800">
            {isPublish ? "Publicar y enviar certificado" : "Enviar certificado"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Certificate summary card */}
          <div className="bg-sage-50/50 border border-sage-200 rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
              <FileCheck className="h-4 w-4 text-sage-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sage-800 truncate">
                {certificate.name || certificate.client.name}
              </p>
              <p className="text-xs text-sage-800/40">
                {period} · {certificate.totalKg.toLocaleString("es-CL")} kg · {certificate.totalCo2.toLocaleString("es-CL")} kg CO₂
              </p>
            </div>
          </div>

          {/* To field */}
          <div className="space-y-1.5">
            <Label htmlFor="email-to" className="text-xs">Para</Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@cliente.com"
            />
          </div>

          {/* CC field */}
          <div className="space-y-1.5">
            <Label htmlFor="email-cc" className="text-xs">CC <span className="text-sage-800/30">(opcional)</span></Label>
            <Input
              id="email-cc"
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="copia@empresa.com"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="text-xs">Asunto</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="email-body" className="text-xs">Mensaje</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="text-sm font-mono"
            />
          </div>

          {/* Attachment note */}
          <div className="flex items-center gap-2 text-xs text-sage-800/40">
            <Paperclip className="h-3 w-3" />
            Se adjuntará el certificado en formato PDF
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={sending || !to.trim()}>
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Enviando...</>
            ) : (
              <><Mail className="h-4 w-4 mr-1.5" /> {isPublish ? "Publicar y enviar" : "Enviar"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
