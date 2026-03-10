"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileCheck,

  Settings,
  Leaf,
  LogOut,
  Menu,
  Truck,
  FileBarChart,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationBell } from "@/components/notification-bell";
import { ProductTour } from "@/components/product-tour";
import { usePermissions } from "@/hooks/use-permissions";
import { PlanProvider, usePlan } from "@/components/plan-provider";
import { Clock, ArrowRight, ShieldAlert, HeartHandshake, ChevronsUpDown, User, Mail } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "nav-dashboard", permission: "dashboard:view" as const },
  { href: "/dashboard/clients", label: "Clientes", icon: Users, tourId: "nav-clients", permission: "clients:view" as const },
  { href: "/dashboard/pickups", label: "Retiros", icon: Truck, tourId: "nav-pickups", permission: "pickups:view" as const },
  { href: "/dashboard/certificates", label: "Certificados", icon: FileCheck, tourId: "nav-certificates", permission: "certificates:view" as const },
  { href: "/dashboard/reports", label: "Reportes", icon: FileBarChart, tourId: "nav-reports", permission: "reports:view" as const },
];

// Settings moved to sidebar footer next to notifications

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { can } = usePermissions();
  const [impactKg, setImpactKg] = useState<number | null>(null);
  const [impactCo2, setImpactCo2] = useState<number | null>(null);
  const [showCo2, setShowCo2] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setImpactKg(d?.kpis?.totalKg || 0);
        setImpactCo2(d?.kpis?.totalCo2 || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setShowCo2((v) => !v), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-sand-50 border-r border-sand-300">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onNavigate}>
          <Image src="/logo.png" alt="CertiRecicla" width={24} height={24} className="animate-breathe logo-leaf" />
          <span className="font-serif text-lg text-sage-800">CertiRecicla</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.filter(item => can(item.permission)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                data-tour={item.tourId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all ${
                  isActive
                    ? "bg-sage-500/[0.08] text-sage-500 font-semibold nav-active-bar"
                    : "text-sage-800/40 hover:text-sage-800/70 hover:bg-sand-100"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sand-300">
        {impactKg !== null && impactKg > 0 && (
          <div className="mx-3 mt-3 bg-emerald-50/60 border border-emerald-200/60 rounded-[10px] px-3 py-2 mb-1">
            {!showCo2 ? (
              <p key="kg" className="text-[11px] font-medium text-emerald-700 equiv-enter">
                ♻️ {impactKg.toLocaleString("es-CL")} kg reciclados en {new Date().getFullYear()}
              </p>
            ) : (
              <p key="co2" className="text-[11px] font-medium text-emerald-700 equiv-enter">
                🌿 {(impactCo2 ?? 0).toLocaleString("es-CL")} ton CO₂ no emitidos en {new Date().getFullYear()}
              </p>
            )}
          </div>
        )}

        {/* Quick actions row */}
        <div className="flex items-center px-3 py-2">
          <NotificationBell />
        </div>

        {/* User profile — popover trigger (Linear/Notion pattern) */}
        <div className="px-3 pb-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] hover:bg-sand-100 transition-colors text-left group">
                <div className="h-8 w-8 rounded-full bg-sage-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-sage-500">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sage-800 truncate leading-tight">{session?.user?.name}</p>
                  <p className="text-[11px] text-sage-800/30 truncate leading-tight">{session?.user?.email}</p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-sage-800/20 group-hover:text-sage-800/40 transition-colors shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-[200px] p-1.5 rounded-[12px] border-sand-300 shadow-lg"
            >
              <Link
                href="/dashboard/settings"
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-sage-800 hover:bg-sand-100 transition-colors"
              >
                <User className="h-4 w-4 text-sage-800/40" strokeWidth={1.5} />
                Mi cuenta
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-sage-800 hover:bg-sand-100 transition-colors"
              >
                <Settings className="h-4 w-4 text-sage-800/40" strokeWidth={1.5} />
                Configuración
              </Link>
              <div className="my-1 border-t border-sand-200" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Cerrar sesión
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

function TrialTopBar() {
  const plan = usePlan();

  if (!plan) return null;

  const expired = plan.trialExpired;
  const cancelled = plan.subscriptionStatus === "cancelled";
  const trialDays = plan.plan === "trial" ? plan.trialDaysRemaining : null;

  if (trialDays === null && !expired) return null;

  if (expired && cancelled) {
    return (
      <div className="bg-sage-700 text-white text-center py-1.5 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
        <HeartHandshake className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Tu plan fue cancelado. Te extrañamos.</span>
        <Link href="/dashboard/billing" className="underline hover:no-underline inline-flex items-center gap-0.5">
          Reactivar plan <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="bg-red-600 text-white text-center py-1.5 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Tu periodo de prueba ha terminado.</span>
        <Link href="/dashboard/billing" className="underline hover:no-underline inline-flex items-center gap-0.5">
          Seleccionar plan <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-white text-center py-1.5 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Periodo de prueba: {trialDays} {trialDays === 1 ? "dia" : "dias"} restantes</span>
      <Link href="/dashboard/billing" className="underline hover:no-underline inline-flex items-center gap-0.5">
        Ver planes <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function TrialBlockOverlay() {
  const plan = usePlan();
  const pathname = usePathname();

  if (!plan) return null;

  const blockReason = plan.trialExpired && plan.subscriptionStatus !== "active"
    ? (plan.subscriptionStatus === "cancelled" ? "cancelled" : "trial_expired")
    : null;

  // Allow access to billing page even when blocked
  if (!blockReason || pathname === "/dashboard/billing") return null;

  if (blockReason === "cancelled") {
    return (
      <div className="fixed inset-0 z-50 bg-sand-100/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[16px] shadow-xl border border-sand-200 max-w-md w-full p-8 text-center">
          <div className="mx-auto w-14 h-14 bg-sage-50 rounded-full flex items-center justify-center mb-5">
            <HeartHandshake className="h-7 w-7 text-sage-500" />
          </div>
          <h2 className="text-xl font-serif text-sage-800 mb-3">
            Tu plan ha sido cancelado
          </h2>
          <p className="text-sm text-sage-800/60 mb-2 leading-relaxed">
            Sabemos que las cosas cambian, y esta bien.
            Tu trabajo y el impacto que has generado siguen siendo valiosos.
          </p>
          <p className="text-sm text-sage-800/60 mb-7 leading-relaxed">
            Cuando estes listo para volver, tu cuenta y todos tus datos
            te estaran esperando exactamente como los dejaste.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 bg-sage-500 text-white px-7 py-2.5 rounded-[8px] text-sm font-medium hover:bg-sage-600 transition-colors"
          >
            Reactivar mi plan <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-sage-800/30 mt-4">
            Elige un plan y retoma tu gestión en segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-sand-100/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] shadow-xl border border-sand-200 max-w-md w-full p-8 text-center">
        <div className="mx-auto w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-5">
          <Clock className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-serif text-sage-800 mb-3">
          Tu periodo de prueba ha finalizado
        </h2>
        <p className="text-sm text-sage-800/60 mb-2 leading-relaxed">
          Esperamos que hayas disfrutado explorar todo lo que CertiRecicla
          puede hacer por tu gestión de reciclaje.
        </p>
        <p className="text-sm text-sage-800/60 mb-7 leading-relaxed">
          Elige el plan que mejor se adapte a tu operación
          y sigue generando impacto ambiental con tus clientes.
        </p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 bg-sage-500 text-white px-7 py-2.5 rounded-[8px] text-sm font-medium hover:bg-sage-600 transition-colors"
        >
          Ver planes disponibles <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-sage-800/30 mt-4">
          Activa tu plan en menos de 2 minutos
        </p>
      </div>
    </div>
  );
}

function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!session?.user || session.user.emailVerified) return null;

  async function handleResend() {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } catch {
      // Silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 text-blue-800 text-center py-2 px-4 text-xs sm:text-sm flex items-center justify-center gap-2">
      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Verifica tu email para acceder a todas las funciones.</span>
      {sent ? (
        <span className="font-medium">Correo enviado</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={sending}
          className="underline hover:no-underline font-medium"
        >
          {sending ? "Enviando..." : "Reenviar correo"}
        </button>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <PlanProvider>
    <div className="flex flex-col h-screen bg-sand-100">
      <EmailVerificationBanner />
      <TrialTopBar />
      <TrialBlockOverlay />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-[228px] flex-shrink-0">
          <Sidebar />
        </aside>

        <Sheet open={open} onOpenChange={setOpen}>
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sand-50 border-b border-sand-300 px-3 py-2.5 flex items-center gap-2 trial-mobile-header">
            <SheetTrigger asChild>
              <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sage-800/40 hover:text-sage-800 transition-colors rounded-lg">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <div className="flex items-center gap-2 flex-1">
              <Image src="/logo.png" alt="CertiRecicla" width={20} height={20} className="animate-breathe" />
              <span className="font-serif text-sage-800">CertiRecicla</span>
            </div>
            <div className="flex items-center gap-0.5">
              <NotificationBell />
              <Link href="/dashboard/settings">
                <div className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[10px] text-sage-800/40 hover:text-sage-800/70 hover:bg-sand-100 transition-all">
                  <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>
              </Link>
            </div>
          </div>
          <SheetContent side="left" className="p-0 w-[260px] sm:w-[228px] bg-sand-50 border-sand-300">
            <Sidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto lg:pt-0 pt-14">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
      <ProductTour />
    </div>
    </PlanProvider>
  );
}
