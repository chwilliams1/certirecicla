import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/reveniu";

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
      { error: "No tienes una suscripcion activa" },
      { status: 400 }
    );
  }

  await cancelSubscription(company.reveniuSubscriptionId);

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { subscriptionStatus: "cancelled" },
  });

  return NextResponse.json({ ok: true });
}
