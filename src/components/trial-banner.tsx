"use client";

import { Clock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/components/plan-provider";

const PLANS_DISPLAY = [
  {
    name: "Starter",
    price: "$19.900",
    features: ["15 clientes", "30 certificados/mes", "Importación Excel"],
  },
  {
    name: "Profesional",
    price: "$49.900",
    features: ["60 clientes", "Certificados ilimitados", "Portal de impacto", "Multi-usuario (5)"],
    recommended: true,
  },
  {
    name: "Business",
    price: "$99.900",
    features: ["200 clientes", "Usuarios ilimitados", "Exportación SINADER", "Branding propio"],
  },
];

export function TrialBanner() {
  const planInfo = usePlan();

  if (!planInfo || planInfo.plan !== "trial") return null;

  if (planInfo.trialExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-sage-800 mb-2">
              Tu prueba gratuita ha terminado
            </h2>
            <p className="text-muted-foreground">
              Elige un plan para seguir usando CertiRecicla y no perder tus datos.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {PLANS_DISPLAY.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-5 ${
                  plan.recommended
                    ? "border-2 border-sage-500 ring-1 ring-sage-200"
                    : "border-gray-200"
                }`}
              >
                {plan.recommended && (
                  <span className="mb-2 inline-block rounded-full bg-sage-500 px-2.5 py-0.5 text-xs font-medium text-white">
                    Recomendado
                  </span>
                )}
                <h3 className="font-serif text-lg font-bold text-sage-800">{plan.name}</h3>
                <p className="text-2xl font-bold text-sage-900 mb-3">
                  {plan.price}<span className="text-sm font-normal text-muted-foreground">/mes</span>
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-sage-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/billing"
                  className={`block w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
                    plan.recommended
                      ? "bg-sage-600 text-white hover:bg-sage-700"
                      : "bg-gray-100 text-sage-800 hover:bg-gray-200"
                  }`}
                >
                  Seleccionar plan
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Tus datos están seguros. Al elegir un plan, todo tu trabajo se mantiene.
          </p>
        </div>
      </div>
    );
  }

  if (planInfo.trialDaysRemaining !== null && planInfo.trialDaysRemaining <= 10) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-3 sm:px-4 py-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-700">
              Estás usando el plan Profesional gratis — quedan {planInfo.trialDaysRemaining} días
            </p>
          </div>
          <Link href="/dashboard/billing" className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors self-end sm:self-auto">
            Elegir plan
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
