import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/reveniu";
import { getPlanConfig } from "@/lib/plans";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { reveniuSubscriptionId: true, subscriptionStatus: true },
  });

  if (company?.subscriptionStatus !== "active" || !company.reveniuSubscriptionId) {
    return NextResponse.json(
      { error: "No tienes una suscripción activa" },
      { status: 400 }
    );
  }

  await cancelSubscription(company.reveniuSubscriptionId);

  const trialConfig = getPlanConfig("trial");
  await prisma.company.update({
    where: { id: session.user.companyId },
    data: {
      plan: "trial",
      subscriptionStatus: "cancelled",
      trialEndsAt: new Date(Date.now() - 1000),
      reveniuSubscriptionId: null,
      maxClients: trialConfig.maxClients,
      maxCertificatesPerMonth: trialConfig.maxCertificatesPerMonth,
    },
  });

  return NextResponse.json({ ok: true });
}
