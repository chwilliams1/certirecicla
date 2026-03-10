import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig, getTrialDaysRemaining, isTrialExpired } from "@/lib/plans";
import { getSubscription, getReveniuPlanKey } from "@/lib/reveniu";

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

  const config = getPlanConfig(company.plan);
  const trialExpired = company.plan === "trial" && isTrialExpired(company.trialEndsAt);
  const trialDaysRemaining = company.plan === "trial"
    ? getTrialDaysRemaining(company.trialEndsAt)
    : null;

  // Sync con Reveniu en paralelo con los counts para no agregar latencia
  const syncReveniu = async () => {
    if (!company.reveniuSubscriptionId) return;
    try {
      const sub = await getSubscription(company.reveniuSubscriptionId);
      const reveniuPlanKey = getReveniuPlanKey(sub.plan_id);

      // Reveniu dice active pero DB no lo refleja
      if (sub.status === "active" && company.subscriptionStatus !== "active" && reveniuPlanKey) {
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

      // Reveniu dice inactive/cancelled pero DB sigue active
      if ((sub.status === "inactive" || sub.status === "cancelled") && company.subscriptionStatus === "active") {
        const trialConfig = getPlanConfig("trial");
        await prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            plan: "trial",
            subscriptionStatus: "cancelled",
            reveniuSubscriptionId: null,
            maxClients: trialConfig.maxClients,
            maxCertificatesPerMonth: trialConfig.maxCertificatesPerMonth,
          },
        });
        company.plan = "trial";
        company.subscriptionStatus = "cancelled";
      }
    } catch {
      // Reveniu no disponible, seguir con datos de DB
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
      sinaderExport: config.sinaderExport,
    },
    usage: {
      activeClients,
      monthCertificates,
    },
  });
}
