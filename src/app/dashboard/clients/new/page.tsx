"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Building2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRut } from "@/lib/validations";

export default function NewClientPage() {
  const router = useRouter();

  // Form state
  const [empresa, setEmpresa] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [address, setAddress] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdClient, setCreatedClient] = useState<{ id: string; name: string; parentName?: string } | null>(null);

  const canSubmit = empresa.trim().length > 0 && rut.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0 && contactName.trim().length > 0 && address.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, string> = {
        empresa: empresa.trim(),
      };
      if (sucursal.trim()) body.sucursal = sucursal.trim();
      if (rut.trim()) body.rut = rut.trim();
      if (email.trim()) body.email = email.trim();
      if (phone.trim()) body.phone = phone.trim();
      if (contactName.trim()) body.contactName = contactName.trim();
      if (address.trim()) body.address = address.trim();

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el cliente");
      } else {
        setCreatedClient({
          id: data.id,
          name: data.name,
          parentName: sucursal.trim() ? empresa.trim() : undefined,
        });
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (createdClient) {
    return (
      <div className="space-y-6 max-w-2xl page-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="font-serif text-2xl text-sage-800">Cliente creado</h1>
        </div>

        <div className="bg-gradient-to-br from-sage-50 to-sand-50 border border-sage-200 rounded-[14px] p-8 text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-sage-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-sage-500" />
          </div>
          <h3 className="font-serif text-2xl text-sage-800 mb-2">Cliente creado exitosamente</h3>
          <p className="text-sage-600">
            {createdClient.parentName ? `${createdClient.parentName} - ${createdClient.name}` : createdClient.name}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setCreatedClient(null);
              setEmpresa("");
              setSucursal("");
              setRut("");
              setEmail("");
              setPhone("");
              setContactName("");
              setAddress("");
            }}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-1.5" /> Crear otro cliente
          </Button>
          <Button onClick={() => router.push(`/dashboard/clients/${createdClient.id}`)} className="flex-1">
            Ver cliente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl page-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Nuevo cliente</h1>
          <p className="text-sm text-sage-800/40">Agrega un nuevo cliente manualmente</p>
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

      {/* Empresa & Sucursal */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Building2 className="h-3.5 w-3.5" /> Empresa *
          </label>
          <Input
            placeholder="Nombre o razón social..."
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Store className="h-3.5 w-3.5" /> Sucursal (opcional)
          </label>
          <Input
            placeholder="Nombre de la sucursal..."
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            className="bg-white"
          />
          <p className="text-[10px] text-sage-800/30 mt-1.5">Si no tiene sucursal, deja este campo vacío</p>
        </div>
      </div>

      {/* RUT & Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <FileText className="h-3.5 w-3.5" /> RUT *
          </label>
          <Input
            placeholder="12.345.678-9"
            value={rut}
            onChange={(e) => setRut(formatRut(e.target.value))}
            className="bg-white"
          />
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Mail className="h-3.5 w-3.5" /> Email *
          </label>
          <Input
            type="email"
            placeholder="correo@empresa.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Phone & Contact */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Phone className="h-3.5 w-3.5" /> Teléfono *
          </label>
          <Input
            placeholder="+56 9 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
          <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <User className="h-3.5 w-3.5" /> Contacto *
          </label>
          <Input
            placeholder="Nombre del contacto"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-5">
        <label className="text-xs font-medium text-sage-800/40 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <MapPin className="h-3.5 w-3.5" /> Dirección *
        </label>
        <Input
          placeholder="Dirección del cliente..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          className="flex-[2]"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Creando...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Crear cliente
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
