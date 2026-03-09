import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig, getTrialDaysRemaining, isTrialExpired } from "@/lib/plans";

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
