"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronRight, Leaf, Scale, Users, FileSpreadsheet, Lock, Upload, X, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatRut } from "@/lib/validations";
import { PageGuard } from "@/components/permission-gate";

interface CompanySettings {
  id: string;
  name: string;
  rut: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  autoSendOnPublish: boolean;
  sanitaryResolution: string | null;
  plantAddress: string | null;
  co2Factors: Array<{ id: string; material: string; factor: number }>;
  ecoEquivalencies: string | null;
  brandPrimaryColor: string | null;
  brandHidePlatform: boolean;
  brandSignatureUrl: string | null;
  brandSecondaryLogoUrl: string | null;
  brandClosingText: string | null;
  brandFont: string | null;
}

interface PlanInfo {
  plan: string;
  features: { customBranding: boolean };
}

function derivePalettePreview(hex: string) {
  // Simple client-side preview — mirrors server derivePalette logic
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  const H = Math.round(h * 360), S = Math.round(s * 100), L = Math.round(l * 100);

  const toHex = (hh: number, ss: number, ll: number) => {
    const sn = ss / 100, ln = ll / 100;
    const c = (1 - Math.abs(2 * ln - 1)) * sn;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = ln - c / 2;
    let rr = 0, gg = 0, bb = 0;
    if (hh < 60) { rr = c; gg = x; }
    else if (hh < 120) { rr = x; gg = c; }
    else if (hh < 180) { gg = c; bb = x; }
    else if (hh < 240) { gg = x; bb = c; }
    else if (hh < 300) { rr = x; bb = c; }
    else { rr = c; bb = x; }
    const ch = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${ch(rr)}${ch(gg)}${ch(bb)}`;
  };

  return [
    hex,
    toHex(H, Math.max(0, S - 20), Math.min(100, L + 15)),
    toHex(H, Math.max(0, S - 40), 96),
    toHex(H, Math.min(S, 15), 18),
    toHex(H, Math.max(0, S - 30), 85),
  ];
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [brandColor, setBrandColor] = useState("#4a6b4e");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/plan").then((r) => r.json()),
    ]).then(([settingsData, planData]) => {
      setSettings(settingsData);
      setPlanInfo(planData);
      if (settingsData.brandPrimaryColor) {
        setBrandColor(settingsData.brandPrimaryColor);
      }
    }).finally(() => setLoading(false));
  }, []);

  const uploadImage = useCallback(async (file: File, field: "signature" | "secondaryLogo") => {
    const setUploading = field === "signature" ? setUploadingSignature : setUploadingLogo;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", field);
      const res = await fetch("/api/settings/branding/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al subir imagen");
        return;
      }
      const { url } = await res.json();
      setSettings((prev) => prev ? {
        ...prev,
        [field === "signature" ? "brandSignatureUrl" : "brandSecondaryLogoUrl"]: url,
      } : prev);
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (field: "signature" | "secondaryLogo") => {
    const res = await fetch(`/api/settings/branding/upload?field=${field}`, { method: "DELETE" });
    if (res.ok) {
      setSettings((prev) => prev ? {
        ...prev,
        [field === "signature" ? "brandSignatureUrl" : "brandSecondaryLogoUrl"]: null,
      } : prev);
    }
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      name: formData.get("name"),
      rut: formData.get("rut"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      sanitaryResolution: formData.get("sanitaryResolution"),
      plantAddress: formData.get("plantAddress"),
      autoSendOnPublish: formData.get("autoSendOnPublish") === "on",
    };

    // Add branding fields if Business plan
    if (planInfo?.features?.customBranding) {
      body.brandPrimaryColor = formData.get("brandPrimaryColor") || null;
      body.brandHidePlatform = formData.get("brandHidePlatform") === "on";
      body.brandFont = formData.get("brandFont") || null;
      body.brandClosingText = formData.get("brandClosingText") || null;
    }

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

  const canBrand = planInfo?.features?.customBranding ?? false;
  const palettePreview = derivePalettePreview(brandColor);

  return (
    <PageGuard permission="settings:view">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sanitaryResolution">Resolución sanitaria</Label>
              <Input id="sanitaryResolution" name="sanitaryResolution" placeholder="Ej: Res. N° 12345/2024" defaultValue={settings.sanitaryResolution || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantAddress">Dirección planta</Label>
              <Input id="plantAddress" name="plantAddress" placeholder="Dirección de la planta de reciclaje" defaultValue={settings.plantAddress || ""} />
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

        {/* Branding section */}
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-sage-800" />
            <h3 className="font-serif text-lg text-sage-800">Branding de certificados</h3>
          </div>

          {!canBrand ? (
            <div className="flex items-start gap-3 p-4 bg-sage-800/5 rounded-lg">
              <Lock className="h-5 w-5 text-sage-800/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-sage-800/70">
                  Personaliza tus certificados con colores, logo y firma propios. Disponible en el plan Business.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/billing")}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  Ver planes →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Primary color */}
              <div className="space-y-2">
                <Label htmlFor="brandPrimaryColor">Color primario</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="brandColorPicker"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-10 rounded border border-sand-300 cursor-pointer"
                  />
                  <Input
                    id="brandPrimaryColor"
                    name="brandPrimaryColor"
                    value={brandColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBrandColor(v);
                    }}
                    className="w-32"
                    placeholder="#4a6b4e"
                  />
                  <div className="flex gap-1">
                    {palettePreview.map((c, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded border border-sand-300"
                        style={{ backgroundColor: c }}
                        title={["Primary", "Light", "Background", "Dark", "Border"][i]}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hide platform branding */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="brandHidePlatform"
                  defaultChecked={settings.brandHidePlatform}
                  className="rounded border-sand-300"
                />
                <span className="text-sm">Ocultar marca CertiRecicla en certificados</span>
              </label>

              {/* Font */}
              <div className="space-y-2">
                <Label htmlFor="brandFont">Tipografía</Label>
                <select
                  id="brandFont"
                  name="brandFont"
                  defaultValue={settings.brandFont || "Helvetica"}
                  className="w-full rounded-md border border-sand-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="Helvetica">Moderna (Helvetica)</option>
                  <option value="Times-Roman">Clásica (Times-Roman)</option>
                  <option value="Courier">Monoespaciada (Courier)</option>
                </select>
              </div>

              {/* Closing text */}
              <div className="space-y-2">
                <Label htmlFor="brandClosingText">Texto de cierre</Label>
                <textarea
                  id="brandClosingText"
                  name="brandClosingText"
                  maxLength={500}
                  rows={3}
                  defaultValue={settings.brandClosingText || ""}
                  placeholder="Los residuos fueron procesados en instalaciones de valorizacion debidamente autorizadas. Agradecemos su compromiso con la sostenibilidad y el cuidado del entorno."
                  className="w-full rounded-md border border-sand-300 bg-white px-3 py-2 text-sm resize-none"
                />
                <p className="text-xs text-sage-800/40">Máximo 500 caracteres. Dejar vacío para usar el texto por defecto.</p>
              </div>

              {/* Signature image */}
              <div className="space-y-2">
                <Label>Imagen de firma/sello</Label>
                {settings.brandSignatureUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={settings.brandSignatureUrl} alt="Firma" className="h-12 object-contain border rounded" />
                    <button
                      type="button"
                      onClick={() => deleteImage("signature")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-sand-300 rounded-lg cursor-pointer hover:border-sage-800/30 transition-colors">
                    {uploadingSignature ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 text-sage-800/40" />
                    )}
                    <span className="text-sm text-sage-800/60">
                      {uploadingSignature ? "Subiendo..." : "Subir imagen (PNG, JPG, WebP — máx 2MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, "signature");
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Secondary logo */}
              <div className="space-y-2">
                <Label>Segundo logo/sello (ej: ISO, certificación)</Label>
                {settings.brandSecondaryLogoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={settings.brandSecondaryLogoUrl} alt="Logo secundario" className="h-12 object-contain border rounded" />
                    <button
                      type="button"
                      onClick={() => deleteImage("secondaryLogo")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-sand-300 rounded-lg cursor-pointer hover:border-sage-800/30 transition-colors">
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 text-sage-800/40" />
                    )}
                    <span className="text-sm text-sage-800/60">
                      {uploadingLogo ? "Subiendo..." : "Subir imagen (PNG, JPG, WebP — máx 2MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, "secondaryLogo");
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          )}
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
    </PageGuard>
  );
}
