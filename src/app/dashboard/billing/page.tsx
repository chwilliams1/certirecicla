"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/plans";

interface BillingStatus {
  plan: string;
  subscriptionStatus: string;
  reveniuSubscriptionId: number | null;
  reveniu: {
    nextPaymentDate: string;
    planName: string;
  } | null;
}

const planOrder: PlanType[] = ["starter", "profesional", "business"];

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-sage-500" /></div>}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then(setBilling)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCancelSubscription() {
    if (!window.confirm("¿Estas seguro de que deseas cancelar tu suscripcion? Perderas acceso a las funciones de tu plan actual.")) {
      return;
    }
    setCancelLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al cancelar");
        return;
      }
      setBilling((prev) => prev ? { ...prev, subscriptionStatus: "cancelled" } : prev);
    } catch {
      alert("Error de conexion. Intenta de nuevo.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleSelectPlan(planKey: string) {
    const isActive = billing?.subscriptionStatus === "active";
    if (isActive) {
      const confirmed = window.confirm(
        `¿Deseas cambiar tu plan a ${PLANS[planKey as PlanType]?.displayName}? Se cancelara tu plan actual y se iniciara el proceso de pago del nuevo plan.`
      );
      if (!confirmed) return;
    }

    setCheckoutLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al iniciar el pago");
        return;
      }

      const { completion_url, security_token } = await res.json();

      // Redirect to Reveniu checkout via form POST with TBK_TOKEN
      const form = document.createElement("form");
      form.method = "POST";
      form.action = completion_url;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "TBK_TOKEN";
      input.value = security_token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch {
      alert("Error de conexion. Intenta de nuevo.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
      </div>
    );
  }

  const isActive = billing?.subscriptionStatus === "active";
  const currentPlan = billing?.plan || "trial";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-sage-800">Planes y facturacion</h1>
        <p className="text-sm text-sage-800/50 mt-1">
          Selecciona el plan que mejor se adapte a tu operacion
        </p>
      </div>

      {status === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-3 mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700">
            Pago procesado correctamente. Tu plan se activara en unos momentos.
          </p>
        </div>
      )}

      {status === "failure" && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">
            El pago no pudo ser procesado. Intenta nuevamente o usa otro medio de pago.
          </p>
        </div>
      )}

      {billing?.subscriptionStatus === "switching" && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 mb-6 flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-amber-600 flex-shrink-0 animate-spin" />
          <p className="text-sm text-amber-700">
            Cambio de plan en proceso...
          </p>
        </div>
      )}

      {billing?.subscriptionStatus === "cancelled" && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Tu suscripcion fue cancelada. Selecciona un nuevo plan.
          </p>
        </div>
      )}

      {isActive && billing?.reveniu && (
        <div className="bg-sage-50 border border-sage-200 rounded-[10px] px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-sage-600 flex-shrink-0" />
            <p className="text-sm text-sage-700">
              Plan actual: <strong>{PLANS[currentPlan as PlanType]?.displayName}</strong>
              {billing.reveniu.nextPaymentDate && (
                <> — Proximo cobro: {new Date(billing.reveniu.nextPaymentDate).toLocaleDateString("es-CL")}</>
              )}
            </p>
          </div>
          <button
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
            className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {cancelLoading ? "Cancelando..." : "Cancelar suscripcion"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = isActive && currentPlan === planKey;
          const isPopular = planKey === "profesional";

          return (
            <div
              key={planKey}
              className={`relative bg-white rounded-[12px] border-2 p-6 flex flex-col ${
                isPopular
                  ? "border-sage-500 shadow-lg"
                  : "border-sand-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-sage-800">{plan.displayName}</h3>
                <p className="text-xs text-sage-800/40 mt-0.5">{plan.description}</p>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-bold text-sage-800">
                  ${plan.priceClp.toLocaleString("es-CL")}
                </span>
                <span className="text-sm text-sage-800/40">/mes</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2 text-sm text-sage-800/70">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  Hasta {plan.maxClients} clientes
                </li>
                <li className="flex items-start gap-2 text-sm text-sage-800/70">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  {plan.maxCertificatesPerMonth === -1
                    ? "Certificados ilimitados"
                    : `${plan.maxCertificatesPerMonth} certificados/mes`}
                </li>
                <li className="flex items-start gap-2 text-sm text-sage-800/70">
                  <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                  {plan.maxUsers === -1
                    ? "Usuarios ilimitados"
                    : `${plan.maxUsers} usuario${plan.maxUsers > 1 ? "s" : ""}`}
                </li>
                {plan.multiUser && (
                  <li className="flex items-start gap-2 text-sm text-sage-800/70">
                    <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    Multi-usuario
                  </li>
                )}
                {plan.sinaderExport && (
                  <li className="flex items-start gap-2 text-sm text-sage-800/70">
                    <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    Exportacion SINADER
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 text-center text-sm font-medium text-sage-500 bg-sage-50 rounded-[8px]">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan(planKey)}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-2.5 text-center text-sm font-medium rounded-[8px] transition-colors ${
                    isPopular
                      ? "bg-sage-500 text-white hover:bg-sage-600"
                      : "bg-sage-50 text-sage-700 hover:bg-sage-100"
                  } disabled:opacity-50`}
                >
                  {checkoutLoading === planKey ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : isActive ? (
                    "Cambiar plan"
                  ) : (
                    "Seleccionar"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
