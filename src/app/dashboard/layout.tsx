"use client";

import Link from "next/link";
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
import { NotificationBell } from "@/components/notification-bell";
import { ProductTour } from "@/components/product-tour";
import { usePermissions } from "@/hooks/use-permissions";
import { PlanProvider, usePlan } from "@/components/plan-provider";
import { Clock, ArrowRight, ShieldAlert, HeartHandshake } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setImpactKg(d?.kpis?.totalKg || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-sand-50 border-r border-sand-300">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onNavigate}>
          <Leaf className="h-6 w-6 text-sage-500 animate-breathe logo-leaf" strokeWidth={1.5} />
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

      <div className="p-4 border-t border-sand-300">
        {impactKg !== null && impactKg > 0 && (
          <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-[10px] px-3 py-2.5 mb-3">
            <p className="text-xs font-medium text-emerald-700">
              ♻️ {impactKg.toLocaleString("es-CL")} kg reciclados
            </p>
            <p className="text-[10px] text-emerald-600/50 mt-0.5">en {new Date().getFullYear()}</p>
          </div>
        )}
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-sage-500">
              {session?.user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sage-800 truncate">{session?.user?.name}</p>
            <p className="text-xs text-sage-800/30 truncate">{session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <NotificationBell />
            {can("settings:view") && (
              <Link href="/dashboard/settings" onClick={onNavigate}>
                <div
                  data-tour="nav-settings"
                  className={`relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[10px] transition-all ${
                    pathname?.startsWith("/dashboard/settings")
                      ? "text-sage-500 bg-sage-500/[0.08]"
                      : "text-sage-800/40 hover:text-sage-800/70 hover:bg-sand-100"
                  }`}
                >
                  <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-sage-800/30 hover:text-red-500 transition-colors w-full"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          Cerrar sesión
        </button>
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
            Elige un plan y retoma tu gestion en segundos
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
          puede hacer por tu gestion de reciclaje.
        </p>
        <p className="text-sm text-sage-800/60 mb-7 leading-relaxed">
          Elige el plan que mejor se adapte a tu operacion
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <PlanProvider>
    <div className="flex flex-col h-screen bg-sand-100">
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
              <Leaf className="h-5 w-5 text-sage-500 animate-breathe" strokeWidth={1.5} />
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
