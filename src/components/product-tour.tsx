"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileCheck,
  FileBarChart,
  Settings,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  Upload,
} from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "bottom" | "right" | "top" | "left" | "center";
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "__welcome__",
    title: "Bienvenido a CertiRecicla",
    description:
      "Te daremos un recorrido rapido por la plataforma para que conozcas todo lo que puedes hacer. Solo tomara un minuto.",
    icon: <Rocket className="h-6 w-6" />,
    position: "center",
  },
  {
    target: "nav-dashboard",
    title: "Dashboard",
    description:
      "Tu panel principal con KPIs de reciclaje, graficos de CO\u2082 evitado, ranking de materiales y retiros recientes.",
    icon: <LayoutDashboard className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "nav-clients",
    title: "Clientes",
    description:
      "Administra las empresas a las que les retiras residuos. Crealos manualmente o importalos desde Excel.",
    icon: <Users className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "nav-pickups",
    title: "Retiros",
    description:
      "Registra cada retiro de materiales: fecha, cliente, materiales y cantidades. El CO\u2082 se calcula automaticamente.",
    icon: <Truck className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "nav-certificates",
    title: "Certificados",
    description:
      "Genera certificados PDF profesionales de reciclaje para tus clientes y envialos por email directamente.",
    icon: <FileCheck className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "nav-reports",
    title: "Reportes",
    description:
      "Visualiza reportes detallados de tu operacion, exporta datos y analiza tendencias de reciclaje.",
    icon: <FileBarChart className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "nav-settings",
    title: "Configuracion",
    description:
      "Personaliza tu empresa: logo, datos de contacto, factores de CO\u2082 y gestion de usuarios.",
    icon: <Settings className="h-5 w-5" />,
    position: "right",
    desktopOnly: true,
  },
  {
    target: "quick-actions",
    title: "Acciones rapidas",
    description:
      "Sube datos, crea certificados o registra retiros con un solo clic. Tu atajo del dia a dia.",
    icon: <Upload className="h-5 w-5" />,
    position: "bottom",
    desktopOnly: true,
  },
  // Mobile-only steps (simplified tour without sidebar refs)
  {
    target: "__welcome__",
    title: "Tu plataforma de reciclaje",
    description:
      "Desde el menu lateral puedes acceder a: Clientes, Retiros, Certificados, Reportes y Configuracion. Explora cada seccion para conocer todo lo que puedes hacer.",
    icon: <LayoutDashboard className="h-5 w-5" />,
    position: "center",
    mobileOnly: true,
  },
  {
    target: "__welcome__",
    title: "Flujo principal",
    description:
      "1. Registra retiros de materiales\n2. Genera certificados para tus clientes\n3. Envialos por email con verificacion publica",
    icon: <FileCheck className="h-5 w-5" />,
    position: "center",
    mobileOnly: true,
  },
];

const STORAGE_KEY = "certirecicla_tour_completed";

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isNew = params.get("tour") === "1";
    const completed = localStorage.getItem(STORAGE_KEY);

    if (isNew && !completed) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Filter steps based on viewport
  const filteredSteps = TOUR_STEPS.filter((s) => {
    if (isMobile && s.desktopOnly) return false;
    if (!isMobile && s.mobileOnly) return false;
    return true;
  });

  const currentStep = filteredSteps[step];
  const isCenter = currentStep?.position === "center" || currentStep?.target === "__welcome__";
  const isLast = step === filteredSteps.length - 1;

  const positionTooltip = useCallback(() => {
    if (!currentStep || isCenter) {
      setTooltipStyle({});
      setSpotlightStyle({ display: "none" });
      return;
    }

    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad = 6;

    setSpotlightStyle({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      borderRadius: "12px",
    });

    const tooltip = tooltipRef.current;
    const tw = tooltip?.offsetWidth || 300;
    const th = tooltip?.offsetHeight || 200;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case "right":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + 16;
        break;
      case "bottom":
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - 16;
        break;
      case "top":
        top = rect.top - th - 16;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
    }

    // Clamp to viewport with mobile-friendly margins
    const margin = 12;
    top = Math.max(margin, Math.min(top, window.innerHeight - th - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));

    setTooltipStyle({ top, left });
  }, [currentStep, isCenter]);

  useEffect(() => {
    if (!active) return;
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [active, step, positionTooltip]);

  useEffect(() => {
    if (!active) return;
    const frame = requestAnimationFrame(positionTooltip);
    return () => cancelAnimationFrame(frame);
  }, [active, step, positionTooltip]);

  const close = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    router.replace(url.pathname, { scroll: false });
  }, [router]);

  const next = () => {
    if (isLast) {
      close();
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!active || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={close}
      />

      {/* Spotlight cutout */}
      {!isCenter && (
        <div
          className="absolute z-[101] transition-all duration-300 ease-out"
          style={{
            ...spotlightStyle,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={`absolute z-[102] bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden transition-all duration-300 ease-out ${
          isCenter
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[380px]"
            : "w-[calc(100%-1.5rem)] max-w-[320px]"
        }`}
        style={isCenter ? {} : tooltipStyle}
      >
        {/* Progress bar */}
        <div className="h-1 bg-sand-100">
          <div
            className="h-full bg-sage-500 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / filteredSteps.length) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-5">
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-3 right-3 text-sage-800/30 hover:text-sage-800/60 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl ${
              isCenter ? "bg-sage-100 text-sage-600" : "bg-sage-50 text-sage-500"
            }`}>
              {currentStep.icon}
            </div>
            <h3 className="font-serif text-base sm:text-lg text-sage-800 pr-6">
              {currentStep.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-600 leading-relaxed mb-4 sm:mb-5 whitespace-pre-line">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-sage-800/30">
              {step + 1} / {filteredSteps.length}
            </span>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="inline-flex items-center gap-1 text-xs text-sage-500 hover:text-sage-700 px-3 py-2.5 rounded-lg border border-sand-200 hover:bg-sand-50 transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Atras
                </button>
              )}
              {step === 0 && (
                <button
                  onClick={close}
                  className="text-xs text-sage-800/30 hover:text-sage-800/50 px-3 py-2.5 transition-colors min-h-[44px]"
                >
                  Omitir
                </button>
              )}
              <button
                onClick={next}
                className="inline-flex items-center gap-1 text-xs font-medium text-white bg-sage-500 hover:bg-sage-600 px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                {isLast ? "Empezar" : "Siguiente"}
                {!isLast && <ArrowRight className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
