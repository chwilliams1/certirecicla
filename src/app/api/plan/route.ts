import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig, getTrialDaysRemaining, isTrialExpired } from "@/lib/plans";
import { getSubscription, getReveniuPlanKey, normalizeReveniuStatus } from "@/lib/reveniu";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      plan: true,
      planStartDate: true,
      trialEndsAt: true,
      maxClients: true,
      maxCertificatesPerMonth: true,
      subscriptionStatus: true,
      reveniuSubscriptionId: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  // Sync con Reveniu en paralelo con los counts para no agregar latencia
  let syncDebug: { action?: string; reveniuStatus?: string; reveniuPlanId?: number; error?: string } = {};
  const syncReveniu = async () => {
    // Plan cancelado pero nunca revertido a trial (estado inconsistente)
    if (!company.reveniuSubscriptionId) {
      if (company.subscriptionStatus !== "active" && company.plan !== "trial") {
        syncDebug = { action: "revert_to_expired_trial_no_sub_id" };
        const trialConfig = getPlanConfig("trial");
        await prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            plan: "trial",
            subscriptionStatus: company.subscriptionStatus || "cancelled",
            trialEndsAt: new Date(Date.now() - 1000),
            maxClients: trialConfig.maxClients,
            maxCertificatesPerMonth: trialConfig.maxCertificatesPerMonth,
          },
        });
        company.plan = "trial";
        company.trialEndsAt = new Date(Date.now() - 1000);
      } else {
        syncDebug = { action: "skip_no_sub_id" };
      }
      return;
    }
    try {
      const sub = await getSubscription(company.reveniuSubscriptionId);
      const reveniuStatus = normalizeReveniuStatus(sub.status);
      syncDebug.reveniuStatus = `${sub.status} (${reveniuStatus})`;
      syncDebug.reveniuPlanId = sub.plan_id;
      const reveniuPlanKey = getReveniuPlanKey(sub.plan_id);

      // Reveniu dice active pero DB no lo refleja
      if (reveniuStatus === "active" && company.subscriptionStatus !== "active" && reveniuPlanKey) {
        syncDebug.action = "activate_from_reveniu";
        const planConfig = getPlanConfig(reveniuPlanKey);
        await prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            plan: reveniuPlanKey,
            subscriptionStatus: "active",
            planStartDate: company.planStartDate || new Date(),
            maxClients: planConfig.maxClients,
            maxCertificatesPerMonth: planConfig.maxCertificatesPerMonth,
          },
        });
        company.plan = reveniuPlanKey;
        company.subscriptionStatus = "active";
      }

      // Reveniu dice inactive/cancelled pero plan no revertido a trial
      if ((reveniuStatus === "inactive" || reveniuStatus === "cancelled") && company.plan !== "trial") {
        syncDebug.action = "revert_to_trial_reveniu_cancelled";
        const trialConfig = getPlanConfig("trial");
        await prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            plan: "trial",
            subscriptionStatus: "cancelled",
            reveniuSubscriptionId: null,
            trialEndsAt: new Date(Date.now() - 1000),
            maxClients: trialConfig.maxClients,
            maxCertificatesPerMonth: trialConfig.maxCertificatesPerMonth,
          },
        });
        company.plan = "trial";
        company.subscriptionStatus = "cancelled";
        company.trialEndsAt = new Date(Date.now() - 1000);
      }

      if (!syncDebug.action) syncDebug.action = "no_change";
    } catch (e) {
      syncDebug = { action: "reveniu_api_error", error: e instanceof Error ? e.message : String(e) };
    }
  };

  const [activeClients, monthCertificates] = await Promise.all([
    prisma.client.count({
      where: { companyId: session.user.companyId, active: true, parentClientId: null },
    }),
    prisma.certificate.count({
      where: {
        companyId: session.user.companyId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
    }),
    syncReveniu(),
  ]);

  // Calcular después del sync para reflejar cambios
  const config = getPlanConfig(company.plan);
  const trialExpired = (company.plan === "trial" && isTrialExpired(company.trialEndsAt))
    || (company.plan !== "trial" && company.subscriptionStatus !== "active");
  const trialDaysRemaining = company.plan === "trial"
    ? getTrialDaysRemaining(company.trialEndsAt)
    : null;

  return NextResponse.json({
    plan: company.plan,
    displayName: config.displayName,
    priceClp: config.priceClp,
    trialExpired,
    trialDaysRemaining,
    subscriptionStatus: company.subscriptionStatus,
    limits: {
      maxClients: config.maxClients,
      maxCertificatesPerMonth: config.maxCertificatesPerMonth,
      multiUser: config.multiUser,
      subClients: config.subClients,
      clientPortal: config.clientPortal,
      fullReports: config.fullReports,
      sinaderExport: config.sinaderExport,
      customBranding: config.customBranding,
    },
    usage: {
      activeClients,
      monthCertificates,
    },
  });
}
