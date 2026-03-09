export type PlanType = "trial" | "starter" | "profesional" | "business";

export interface PlanConfig {
  name: string;
  displayName: string;
  priceUsd: number;
  maxClients: number;
  maxCertificatesPerMonth: number; // -1 = unlimited
  multiUser: boolean;
  sinaderExport: boolean;
  description: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  trial: {
    name: "trial",
    displayName: "Trial",
    priceUsd: 0,
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    multiUser: false,
    sinaderExport: false,
    description: "30 dias gratis con plan Profesional completo",
  },
  starter: {
    name: "starter",
    displayName: "Starter",
    priceUsd: 29,
    maxClients: 15,
    maxCertificatesPerMonth: 30,
    multiUser: false,
    sinaderExport: false,
    description: "Para gestoras que empiezan a digitalizar",
  },
  profesional: {
    name: "profesional",
    displayName: "Profesional",
    priceUsd: 69,
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    multiUser: false,
    sinaderExport: false,
    description: "Para gestoras PyME con operacion activa",
  },
  business: {
    name: "business",
    displayName: "Business",
    priceUsd: 149,
    maxClients: 200,
    maxCertificatesPerMonth: -1,
    multiUser: true,
    sinaderExport: true,
    description: "Para gestoras medianas con alto volumen",
  },
};

export const TRIAL_DURATION_DAYS = 30;

export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[plan as PlanType] || PLANS.trial;
}

export function isTrialExpired(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() > trialEndsAt;
}

export function getTrialDaysRemaining(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  const diff = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export interface PlanLimitCheck {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}

export function checkClientLimit(
  currentClients: number,
  plan: string
): PlanLimitCheck {
  const config = getPlanConfig(plan);
  if (currentClients >= config.maxClients) {
    return {
      allowed: false,
      reason: `Tu plan ${config.displayName} permite hasta ${config.maxClients} clientes. Actualiza tu plan para agregar mas.`,
      currentCount: currentClients,
      limit: config.maxClients,
    };
  }
  return { allowed: true, currentCount: currentClients, limit: config.maxClients };
}

export function checkCertificateLimit(
  currentMonthCertificates: number,
  plan: string
): PlanLimitCheck {
  const config = getPlanConfig(plan);
  if (config.maxCertificatesPerMonth === -1) {
    return { allowed: true, currentCount: currentMonthCertificates, limit: -1 };
  }
  if (currentMonthCertificates >= config.maxCertificatesPerMonth) {
    return {
      allowed: false,
      reason: `Tu plan ${config.displayName} permite hasta ${config.maxCertificatesPerMonth} certificados por mes. Actualiza tu plan para emitir mas.`,
      currentCount: currentMonthCertificates,
      limit: config.maxCertificatesPerMonth,
    };
  }
  return {
    allowed: true,
    currentCount: currentMonthCertificates,
    limit: config.maxCertificatesPerMonth,
  };
}
