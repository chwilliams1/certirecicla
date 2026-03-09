export type PlanType = "trial" | "starter" | "profesional" | "business";

export interface PlanConfig {
  name: string;
  displayName: string;
  priceClp: number;
  maxClients: number;
  maxCertificatesPerMonth: number; // -1 = unlimited
  maxUsers: number; // -1 = unlimited
  multiUser: boolean;
  sinaderExport: boolean;
  description: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  trial: {
    name: "trial",
    displayName: "Trial",
    priceClp: 0,
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    maxUsers: 1,
    multiUser: false,
    sinaderExport: false,
    description: "14 dias gratis con plan Profesional completo",
  },
  starter: {
    name: "starter",
    displayName: "Starter",
    priceClp: 19900,
    maxClients: 15,
    maxCertificatesPerMonth: 30,
    maxUsers: 1,
    multiUser: false,
    sinaderExport: false,
    description: "Para gestoras que empiezan a digitalizar",
  },
  profesional: {
    name: "profesional",
    displayName: "Profesional",
    priceClp: 49900,
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    maxUsers: 3,
    multiUser: true,
    sinaderExport: false,
    description: "Para gestoras con operacion activa",
  },
  business: {
    name: "business",
    displayName: "Business",
    priceClp: 99900,
    maxClients: 200,
    maxCertificatesPerMonth: -1,
    maxUsers: -1,
    multiUser: true,
    sinaderExport: true,
    description: "Para gestoras con alto volumen",
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

export function checkUserLimit(
  currentUsers: number,
  plan: string
): PlanLimitCheck {
  const config = getPlanConfig(plan);
  if (config.maxUsers === -1) {
    return { allowed: true, currentCount: currentUsers, limit: -1 };
  }
  if (currentUsers >= config.maxUsers) {
    return {
      allowed: false,
      reason: `Tu plan ${config.displayName} permite hasta ${config.maxUsers} usuario${config.maxUsers === 1 ? "" : "s"}. Actualiza tu plan para agregar mas.`,
      currentCount: currentUsers,
      limit: config.maxUsers,
    };
  }
  return { allowed: true, currentCount: currentUsers, limit: config.maxUsers };
}
