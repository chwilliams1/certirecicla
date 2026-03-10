"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Leaf,
  TreePine,
  Car,
  Home,
  Smartphone,
  Calendar,
  Building2,
  Package,
  MapPin,
  FileCheck,
  AlertCircle,
  Loader2,
  Recycle,
  Droplets,
} from "lucide-react";
import Image from "next/image";
import { calculateEquivalencies, calculateWaterSaved } from "@/lib/co2-calculator";
import { formatPeriod } from "@/lib/format-period";

interface PickupDetail {
  date: string;
  location: string;
  materials: string;
  kg: number;
}

interface CertificateVerify {
  uniqueCode: string;
  status: string;
  clientName: string;
  clientRut: string | null;
  companyName: string;
  companyRut: string | null;
  companyAddress: string | null;
  companyLogo: string | null;
  sanitaryResolution: string | null;
  plantAddress: string | null;
  totalKg: number;
  totalCo2: number;
  materials: Record<string, { kg: number; co2: number }>;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  sentAt: string | null;
  pickups: PickupDetail[];
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const [cert, setCert] = useState<CertificateVerify | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/verify/${params.code}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setCert(data);
      })
      .finally(() => setLoading(false));
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f5f0] to-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a6b4e] mx-auto mb-3" />
          <p className="text-[#7c9a82]">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f5f0] to-[#faf8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Certificado no encontrado</h1>
          <p className="text-gray-500 text-sm">
            El código <span className="font-mono font-medium text-gray-700">{params.code}</span> no corresponde a ningún certificado publicado. Verifica que el código sea correcto.
          </p>
        </div>
      </div>
    );
  }

  const eq = calculateEquivalencies(cert.totalCo2);
  const waterMaterials = Object.entries(cert.materials).map(([material, v]: [string, { kg: number }]) => ({ material, kg: v.kg }));
  const waterSaved = calculateWaterSaved(waterMaterials);
  const materialEntries = Object.entries(cert.materials);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5f0] to-[#faf8f5]">
      {/* Top bar */}
      <div className="bg-[#4a6b4e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            <span className="font-semibold text-sm">CertiRecicla</span>
          </div>
          <span className="text-xs text-white/70">Verificación de Certificado</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Verification badge */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#d4e4d6] p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-9 w-9 text-[#4a6b4e]" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl font-semibold text-[#2d3a2e] mb-1">Certificado Verificado</h1>
            <p className="text-sm text-[#7c9a82]">
              Este documento acredita la correcta valorización de residuos reciclables gestionados por <span className="font-medium text-[#4a6b4e]">{cert.companyName}</span>.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-xs text-[#7c9a82]">Código</p>
            <p className="font-mono font-semibold text-[#2d3a2e]">{cert.uniqueCode}</p>
          </div>
        </div>

        {/* Main info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
                <p className="font-semibold text-[#2d3a2e]">{cert.clientName}</p>
              </div>
            </div>
            {cert.clientRut && <p className="text-xs text-gray-400 ml-12">RUT: {cert.clientRut}</p>}
          </div>

          {/* Period & Company card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Período</p>
                <p className="font-semibold text-[#2d3a2e]">{formatPeriod(cert.periodStart)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 ml-12">Emitido por {cert.companyName}</p>
          </div>
        </div>

        {/* Totals highlight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#4a6b4e] to-[#5a7d5e] rounded-2xl p-6 text-white text-center">
            <Recycle className="h-6 w-6 mx-auto mb-2 opacity-70" />
            <p className="text-3xl font-bold">{cert.totalKg.toLocaleString("es-CL")}</p>
            <p className="text-sm text-white/70 mt-1">kg reciclados</p>
          </div>
          <div className="bg-gradient-to-br from-[#5a7d5e] to-[#7c9a82] rounded-2xl p-6 text-white text-center">
            <Leaf className="h-6 w-6 mx-auto mb-2 opacity-70" />
            <p className="text-3xl font-bold">{cert.totalCo2.toLocaleString("es-CL")}</p>
            <p className="text-sm text-white/70 mt-1">kg CO₂ evitados</p>
          </div>
        </div>

        {/* Certification text */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-[#2d3a2e] leading-relaxed">
            Mediante el presente documento, <strong>{cert.companyName}</strong>{cert.companyRut ? ` (RUT ${cert.companyRut})` : ""} hace constar que <strong>{cert.clientName}</strong>{cert.clientRut ? ` (RUT ${cert.clientRut})` : ""} realizó la valorización de <strong>{cert.totalKg.toLocaleString("es-CL")} kg</strong> de residuos reciclables durante <strong>{formatPeriod(cert.periodStart)}</strong>, contribuyendo a evitar <strong>{cert.totalCo2.toLocaleString("es-CL")} kg</strong> de emisiones de CO₂ equivalente.
          </p>
        </div>

        {/* Materials breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#2d3a2e] mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#4a6b4e]" />
            Detalle de Materiales
          </h2>
          <div className="space-y-3">
            {materialEntries.map(([material, values]) => {
              const pct = cert.totalKg > 0 ? (values.kg / cert.totalKg) * 100 : 0;
              return (
                <div key={material}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#2d3a2e]">{material}</span>
                    <span className="text-sm text-gray-500">{values.kg.toLocaleString("es-CL")} kg</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4a6b4e] to-[#7c9a82] rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{values.co2.toLocaleString("es-CL")} kg CO₂ evitados</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eco equivalencies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#2d3a2e] mb-1 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-[#4a6b4e]" />
            Impacto Ambiental Positivo
          </h2>
          <p className="text-xs text-gray-400 mb-5">El correcto manejo de estos residuos permitió generar el siguiente impacto:</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: TreePine, value: eq.trees, label: "Árboles preservados", color: "bg-green-50 text-green-600" },
              { icon: Car, value: eq.kmNotDriven.toLocaleString("es-CL"), label: "Km no conducidos", color: "bg-blue-50 text-blue-600" },
              { icon: Droplets, value: waterSaved.toLocaleString("es-CL"), label: "Litros de agua ahorrados", color: "bg-cyan-50 text-cyan-600" },
              { icon: Home, value: eq.homesEnergized.toLocaleString("es-CL"), label: "Días de hogar energizado", color: "bg-amber-50 text-amber-600" },
              { icon: Smartphone, value: eq.smartphonesCharged.toLocaleString("es-CL"), label: "Smartphones cargados", color: "bg-purple-50 text-purple-600" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-[#2d3a2e]">{item.value}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pickups detail */}
        {cert.pickups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[#2d3a2e] mb-4 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#4a6b4e]" />
              Detalle de Retiros
            </h2>
            <div className="space-y-3">
              {cert.pickups.map((pickup, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="h-9 w-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-[#4a6b4e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#2d3a2e]">
                        {new Date(pickup.date.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <span className="text-sm font-semibold text-[#4a6b4e]">{pickup.kg.toLocaleString("es-CL")} kg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{pickup.materials}</p>
                    {pickup.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {pickup.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company & validation info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            {cert.companyLogo && (
              <Image src={cert.companyLogo} alt={cert.companyName} width={48} height={48} className="h-12 w-12 object-contain rounded-lg flex-shrink-0" unoptimized />
            )}
            <div className="flex-1">
              <p className="font-semibold text-[#2d3a2e]">{cert.companyName}</p>
              {cert.companyRut && <p className="text-xs text-gray-400">RUT: {cert.companyRut}</p>}
              {cert.companyAddress && <p className="text-xs text-gray-400">{cert.companyAddress}</p>}
              {cert.plantAddress && <p className="text-xs text-gray-400">Planta: {cert.plantAddress}</p>}
              {cert.sanitaryResolution && <p className="text-xs text-gray-400">Resolución sanitaria: {cert.sanitaryResolution}</p>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
            Los residuos fueron procesados en instalaciones de valorización debidamente autorizadas{cert.sanitaryResolution ? ` (${cert.sanitaryResolution})` : ""}. Este certificado fue emitido el {new Date(cert.createdAt.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })} a través de la plataforma CertiRecicla.
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>Verificado por CertiRecicla &middot; Certificado #{cert.uniqueCode}</p>
        </div>
      </div>
    </div>
  );
}
