"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  Leaf,
  TreePine,
  Car,
  Smartphone,
  Droplets,
  Package,
  ArrowRight,
  Recycle,
  AlertTriangle,
} from "lucide-react";
import { calculateEquivalencies, calculateWaterSaved } from "@/lib/co2-calculator";

function DemoContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "DEMO-000000";
  const name = searchParams.get("name") || "";
  const materialsParam = searchParams.get("materials"); // JSON string
  const totalKg = Number(searchParams.get("totalKg")) || 0;
  const totalCo2 = Number(searchParams.get("totalCo2")) || 0;

  let materials: { material: string; kg: number; co2: number }[] = [];
  try {
    if (materialsParam) materials = JSON.parse(materialsParam);
  } catch { /* ignore */ }

  const eq = calculateEquivalencies(totalCo2);
  const waterMaterials = materials.map((m) => ({ material: m.material, kg: m.kg }));
  const waterSaved = calculateWaterSaved(waterMaterials);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5f0] to-[#faf8f5]">
      {/* Top bar */}
      <div className="bg-[#4a6b4e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="CertiRecicla" width={24} height={24} />
            <span className="font-semibold text-sm">CertiRecicla</span>
          </div>
          <span className="text-xs text-white/70">Verificación de Certificado</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">

        {/* NOT VERIFIED banner */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-9 w-9 text-amber-600" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl font-semibold text-amber-900 mb-1">Certificado de demostración</h1>
            <p className="text-sm text-amber-700">
              Este certificado fue generado con la calculadora gratuita y <strong>no tiene validez oficial</strong>.
              Para emitir certificados verificables con código QR, firma digital y trazabilidad completa,
              crea tu cuenta en CertiRecicla.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-xs text-amber-600">Código</p>
            <p className="font-mono font-semibold text-amber-900 text-sm">{code}</p>
          </div>
        </div>

        {/* CTA box top */}
        <div className="bg-[#4a6b4e] rounded-2xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">¿Quieres certificados oficiales como este?</h2>
          <p className="text-sm text-white/80 mb-5 max-w-lg mx-auto">
            Con CertiRecicla generas certificados PDF profesionales con QR verificable,
            firma digital y datos de trazabilidad. Prueba gratis por 14 días.
          </p>
          <Link
            href={`/register?ref=demo-cert&name=${encodeURIComponent(name)}`}
            className="inline-flex items-center gap-2 bg-white text-[#4a6b4e] font-medium px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-sm"
          >
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#4a6b4e] to-[#5a7d5e] rounded-2xl p-5 sm:p-6 text-white text-center">
            <Recycle className="h-6 w-6 mx-auto mb-2 opacity-70" />
            <p className="text-2xl sm:text-3xl font-bold">{totalKg.toLocaleString("es-CL")}</p>
            <p className="text-sm text-white/70 mt-1">kg reciclados</p>
          </div>
          <div className="bg-gradient-to-br from-[#5a7d5e] to-[#7c9a82] rounded-2xl p-5 sm:p-6 text-white text-center">
            <Leaf className="h-6 w-6 mx-auto mb-2 opacity-70" />
            <p className="text-2xl sm:text-3xl font-bold">{totalCo2.toLocaleString("es-CL", { maximumFractionDigits: 1 })}</p>
            <p className="text-sm text-white/70 mt-1">kg CO₂ evitados</p>
          </div>
        </div>

        {/* Materials */}
        {materials.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h2 className="font-semibold text-[#2d3a2e] mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#4a6b4e]" />
              Detalle de Materiales
            </h2>
            <div className="space-y-3">
              {materials.map((m) => {
                const pct = totalKg > 0 ? (m.kg / totalKg) * 100 : 0;
                return (
                  <div key={m.material}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#2d3a2e]">{m.material}</span>
                      <span className="text-sm text-gray-500">{m.kg.toLocaleString("es-CL")} kg</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4a6b4e] to-[#7c9a82] rounded-full"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{m.co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg CO₂ evitados</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Equivalencies */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h2 className="font-semibold text-[#2d3a2e] mb-1 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-[#4a6b4e]" />
            Impacto Ambiental
          </h2>
          <p className="text-xs text-gray-400 mb-5">El correcto manejo de estos residuos permite generar el siguiente impacto:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: TreePine, value: eq.trees, label: "Árboles preservados", color: "bg-green-50 text-green-600" },
              { icon: Car, value: eq.kmNotDriven.toLocaleString("es-CL"), label: "Km no conducidos", color: "bg-blue-50 text-blue-600" },
              { icon: Droplets, value: waterSaved.toLocaleString("es-CL"), label: "Litros agua ahorrados", color: "bg-cyan-50 text-cyan-600" },
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

        {/* Warning + watermark feel */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#2d3a2e] mb-1">¿Por qué este certificado no es oficial?</p>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li>• Fue generado desde la calculadora pública, sin datos de empresa verificados</li>
                <li>• No tiene firma digital ni resolución sanitaria asociada</li>
                <li>• No incluye trazabilidad de retiros ni código QR verificable</li>
                <li>• No es válido para auditorías, Ley REP ni SINADER</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#d4e4d6] p-6 sm:p-8 text-center">
          <h3 className="text-lg font-semibold text-[#2d3a2e] mb-2">
            Emite certificados reales en minutos
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Certificados PDF con QR verificable, ecoequivalencias, firma digital,
            portal de clientes y exportación a SINADER. Todo desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/register?ref=demo-cert&name=${encodeURIComponent(name)}`}
              className="inline-flex items-center gap-2 bg-[#4a6b4e] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#3d5a40] transition-colors text-sm"
            >
              Prueba gratis 14 días
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/precios"
              className="inline-flex items-center gap-1 text-sm text-[#4a6b4e] font-medium hover:underline"
            >
              Ver planes y precios
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>Generado con la calculadora gratuita de <Link href="/" className="text-[#4a6b4e] hover:underline">CertiRecicla</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f0f5f0] to-[#faf8f5] flex items-center justify-center">
        <p className="text-[#7c9a82]">Cargando certificado...</p>
      </div>
    }>
      <DemoContent />
    </Suspense>
  );
}
