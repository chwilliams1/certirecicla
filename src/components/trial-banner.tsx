"use client";

import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/components/plan-provider";

export function TrialBanner() {
  const planInfo = usePlan();

  if (!planInfo || planInfo.plan !== "trial") return null;

  if (planInfo.trialExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[10px] px-3 sm:px-4 py-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">
              Tu periodo de prueba ha terminado
            </p>
          </div>
          <Link href="/dashboard/billing" className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors self-end sm:self-auto">
            Seleccionar plan
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
              Quedan {planInfo.trialDaysRemaining} dias de prueba gratuita
            </p>
          </div>
          <Link href="/dashboard/billing" className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors self-end sm:self-auto">
            Ver planes
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
