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
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "nav-dashboard" },
  { href: "/dashboard/clients", label: "Clientes", icon: Users, tourId: "nav-clients" },
  { href: "/dashboard/pickups", label: "Retiros", icon: Truck, tourId: "nav-pickups" },
  { href: "/dashboard/certificates", label: "Certificados", icon: FileCheck, tourId: "nav-certificates" },
  { href: "/dashboard/reports", label: "Reportes", icon: FileBarChart, tourId: "nav-reports" },
];

const secondaryNavItems = [
  { href: "/dashboard/settings", label: "Configuración", icon: Settings, tourId: "nav-settings" },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
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
        {navItems.map((item) => {
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
        <div className="border-t border-sand-200 my-2 mx-3" />
        {secondaryNavItems.map((item) => {
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
        <div className="flex items-center justify-between px-2 mb-3">
          <NotificationBell />
        </div>
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
          <div className="min-w-0">
            <p className="text-sm font-medium text-sage-800 truncate">{session?.user?.name}</p>
            <p className="text-xs text-sage-800/30 truncate">{session?.user?.email}</p>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-sand-100">
      <aside className="hidden lg:block w-[228px] flex-shrink-0">
        <Sidebar />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sand-50 border-b border-sand-300 px-3 py-2.5 flex items-center gap-2">
          <SheetTrigger asChild>
            <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sage-800/40 hover:text-sage-800 transition-colors rounded-lg">
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <div className="flex items-center gap-2 flex-1">
            <Leaf className="h-5 w-5 text-sage-500 animate-breathe" strokeWidth={1.5} />
            <span className="font-serif text-sage-800">CertiRecicla</span>
          </div>
          <NotificationBell />
        </div>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[228px] bg-sand-50 border-sand-300">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto lg:pt-0 pt-14">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>

      <ProductTour />
    </div>
  );
}
