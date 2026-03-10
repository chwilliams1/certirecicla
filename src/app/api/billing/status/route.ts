import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscription, getReveniuPlanKey } from "@/lib/reveniu";
import { getPlanConfig } from "@/lib/plans";

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
      reveniuSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  let reveniuData = null;
  if (company.reveniuSubscriptionId) {
    try {
      const sub = await getSubscription(company.reveniuSubscriptionId);
      const reveniuPlanKey = getReveniuPlanKey(sub.plan_id);
      reveniuData = {
        status: sub.status,
        planId: sub.plan_id,
        planName: reveniuPlanKey,
        nextPaymentDate: sub.next_payment_date,
      };

      // Sync: Reveniu says active but DB doesn't reflect it
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

      // Sync: Reveniu says inactive/cancelled but DB still active
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
      // Reveniu may be unavailable, return DB data
    }
  }

  return NextResponse.json({
    plan: company.plan,
    planStartDate: company.planStartDate,
    subscriptionStatus: company.subscriptionStatus,
    reveniuSubscriptionId: company.reveniuSubscriptionId,
    reveniu: reveniuData,
  });
}
