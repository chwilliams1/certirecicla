"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronRight, Leaf, Scale, Users, FileSpreadsheet, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatRut } from "@/lib/validations";

interface CompanySettings {
  id: string;
  name: string;
  rut: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  autoSendOnPublish: boolean;
  co2Factors: Array<{ id: string; material: string; factor: number }>;
  ecoEquivalencies: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      rut: formData.get("rut"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      autoSendOnPublish: formData.get("autoSendOnPublish") === "on",
    };

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSettings(data);
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

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-sage-800">Configuración</h1>
        <p className="text-sm text-sage-800/40">Datos de tu empresa y factores de CO₂</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
          <h3 className="font-serif text-lg text-sage-800">Datos de la empresa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={settings.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" name="rut" defaultValue={settings.rut || ""} onInput={(e) => { const input = e.target as HTMLInputElement; input.value = formatRut(input.value); }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={settings.address || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={settings.phone || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={settings.email || ""} />
            </div>
          </div>
        </div>

        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
          <h3 className="font-serif text-lg text-sage-800">Email automático</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="autoSendOnPublish"
              defaultChecked={settings.autoSendOnPublish}
              className="rounded border-sand-300"
            />
            <span className="text-sm">Enviar certificado por email automáticamente al publicar</span>
          </label>
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Guardar cambios
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-serif text-lg text-sage-800">Administración</h3>
        <p className="text-sm text-sage-800/40">Gestiona usuarios, exportaciones y notificaciones</p>

        <button
          type="button"
          onClick={() => router.push("/dashboard/settings/users")}
          className="w-full bg-sand-50 border border-sand-300 rounded-[14px] p-5 flex items-center gap-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors text-left group"
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sage-800">Usuarios y roles</p>
            <p className="text-xs text-sage-800/40">Administra usuarios con roles: admin, operador, visualizador</p>
          </div>
          <ChevronRight className="h-5 w-5 text-sage-800/30 group-hover:text-blue-500 transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/settings/sinader")}
          className="w-full bg-sand-50 border border-sand-300 rounded-[14px] p-5 flex items-center gap-4 hover:border-amber-300 hover:bg-amber-50/30 transition-colors text-left group"
        >
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sage-800">Exportar SINADER</p>
            <p className="text-xs text-sage-800/40">Exporta datos en formato compatible con el Sistema Nacional de Declaración de Residuos</p>
          </div>
          <ChevronRight className="h-5 w-5 text-sage-800/30 group-hover:text-amber-500 transition-colors shrink-0" />
        </button>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-serif text-lg text-sage-800">Factores ambientales</h3>
        <p className="text-sm text-sage-800/40">Configura los factores de emisión y equivalencias ecológicas</p>

        <button
          type="button"
          onClick={() => router.push("/dashboard/settings/co2-factors")}
          className="w-full bg-sand-50 border border-sand-300 rounded-[14px] p-5 flex items-center gap-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors text-left group"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Leaf className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sage-800">Factores de CO₂</p>
            <p className="text-xs text-sage-800/40">kg de CO₂ evitados por material reciclado — EPA WARM, FEVE, DEFRA</p>
          </div>
          <ChevronRight className="h-5 w-5 text-sage-800/30 group-hover:text-emerald-500 transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/settings/eco-equivalencias")}
          className="w-full bg-sand-50 border border-sand-300 rounded-[14px] p-5 flex items-center gap-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors text-left group"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sage-800">Eco-equivalencias</p>
            <p className="text-xs text-sage-800/40">Convierte CO₂ en árboles, km, hogares y más — EPA GHG Calculator</p>
          </div>
          <ChevronRight className="h-5 w-5 text-sage-800/30 group-hover:text-emerald-500 transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
}
