"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface PlanData {
  plan: string;
  displayName: string;
  trialExpired: boolean;
  trialDaysRemaining: number | null;
  subscriptionStatus: string;
  limits: {
    maxClients: number;
    maxCertificatesPerMonth: number;
    multiUser: boolean;
    subClients: boolean;
    clientPortal: boolean;
    fullReports: boolean;
    sinaderExport: boolean;
    customBranding: boolean;
  };
  usage: {
    activeClients: number;
    monthCertificates: number;
  };
}

const PlanContext = createContext<PlanData | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const pathname = usePathname();

  const fetchPlan = useCallback(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then(setPlan)
      .catch(() => {});
  }, []);

  // Fetch on mount and on navigation
  useEffect(() => {
    fetchPlan();
  }, [pathname, fetchPlan]);

  return (
    <PlanContext.Provider value={plan}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
