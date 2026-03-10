import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
