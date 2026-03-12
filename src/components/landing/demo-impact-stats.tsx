"use client";

import Link from "next/link";
import { TreePine, Car, Smartphone, Droplets, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

function BlurredStatCard({
  icon: Icon,
  label,
}: {
  icon: typeof TreePine;
  label: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <Icon className="mx-auto mb-2 h-6 w-6 text-sage-500/40" />
      <p className="text-2xl font-bold text-sage-800 blur-sm select-none">
        123
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function DemoImpactStats() {
  return (
    <div className="relative">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pointer-events-none">
        <BlurredStatCard icon={TreePine} label="Árboles equivalentes" />
        <BlurredStatCard icon={Car} label="Km no recorridos" />
        <BlurredStatCard icon={Smartphone} label="Smartphones cargados" />
        <BlurredStatCard icon={Droplets} label="Litros de agua ahorrados" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link href="/calculadora" onClick={() => analytics.ctaClick("demo_unlock_equivalencies")}>
          <Button variant="secondary" size="sm" className="gap-2 shadow-md">
            <Lock className="h-3.5 w-3.5" />
            Desbloquear equivalencias
          </Button>
        </Link>
      </div>
    </div>
  );
}
