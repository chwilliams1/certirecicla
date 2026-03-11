"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Truck,
  FileCheck,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Rocket,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  cta: string;
  checkEndpoint: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: "client",
    title: "Agrega tu primer cliente",
    description:
      "Registra la empresa a la que le retiras residuos. Puedes crearla manualmente o importar desde Excel.",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/clients",
    cta: "Ir a Clientes",
    checkEndpoint: "/api/clients?limit=1",
  },
  {
    id: "pickup",
    title: "Registra tu primer retiro",
    description:
      "Registra un retiro de materiales con fecha, cliente y cantidades. El CO₂ se calcula automáticamente.",
    icon: <Truck className="h-5 w-5" />,
    href: "/dashboard/pickups",
    cta: "Ir a Retiros",
    checkEndpoint: "/api/pickups?limit=1",
  },
  {
    id: "certificate",
    title: "Genera tu primer certificado",
    description:
      "Crea un certificado PDF profesional para tu cliente y envíalo por email con código de verificación.",
    icon: <FileCheck className="h-5 w-5" />,
    href: "/dashboard/certificates",
    cta: "Ir a Certificados",
    checkEndpoint: "/api/certificates?limit=1",
  },
];

const STORAGE_KEY = "certirecicla_onboarding";
const DISMISSED_KEY = "certirecicla_onboarding_dismissed";

interface OnboardingState {
  completed: Record<string, boolean>;
}

export function OnboardingChecklist() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({ completed: {} });
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkProgress = useCallback(async () => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      if (saved === "true") {
        setDismissed(true);
        setLoading(false);
        return;
      }
      setDismissed(false);

      const results: Record<string, boolean> = {};

      await Promise.all(
        STEPS.map(async (step) => {
          try {
            const res = await fetch(step.checkEndpoint);
            if (res.ok) {
              const data = await res.json();
              const items = Array.isArray(data) ? data : data.clients || data.pickups || data.certificates || [];
              results[step.id] = items.length > 0;
            }
          } catch {
            results[step.id] = false;
          }
        })
      );

      setState({ completed: results });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: results }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProgress();
  }, [checkProgress]);

  // Re-check when window gets focus (user might have completed a step)
  useEffect(() => {
    const onFocus = () => checkProgress();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkProgress]);

  const completedCount = STEPS.filter((s) => state.completed[s.id]).length;
  const allDone = completedCount === STEPS.length;
  const progress = (completedCount / STEPS.length) * 100;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (loading || dismissed) return null;

  if (allDone) {
    return (
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 sm:p-5 mb-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-sage-100 text-sage-600">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-sage-800">
                ¡Todo listo!
              </h3>
              <p className="text-sm text-sage-600">
                Completaste los pasos iniciales. Ya puedes usar CertiRecicla al máximo.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={dismiss} className="text-sage-400 hover:text-sage-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-sm mb-6 overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-sand-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-sage-100 text-sage-600">
            <Rocket className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-semibold text-sage-800 text-sm sm:text-base">
              Primeros pasos
            </h3>
            <p className="text-xs text-sage-500">
              {completedCount} de {STEPS.length} completados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24 h-2 bg-sand-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-sage-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-sage-400" />
          )}
        </div>
      </button>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-sand-100">
          {STEPS.map((step, i) => {
            const done = state.completed[step.id];
            const isNext = !done && STEPS.slice(0, i).every((s) => state.completed[s.id]);

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 px-4 sm:px-5 py-3.5 border-b border-sand-50 last:border-b-0 transition-colors ${
                  done ? "bg-sage-50/30" : isNext ? "bg-white" : "bg-white"
                }`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-sage-500" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isNext ? "text-sage-400" : "text-sand-300"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-sage-500 line-through" : "text-sage-800"
                    }`}
                  >
                    {step.title}
                  </p>
                  {isNext && (
                    <p className="text-xs text-sage-500 mt-0.5 mb-2">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Action */}
                {!done && isNext && (
                  <Button
                    size="sm"
                    onClick={() => router.push(step.href)}
                    className="flex-shrink-0 gap-1 text-xs"
                  >
                    {step.cta}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
                {!done && !isNext && (
                  <span className="flex-shrink-0 text-xs text-sand-400 mt-0.5">
                    Pendiente
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
