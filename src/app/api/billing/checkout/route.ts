import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription, cancelSubscription } from "@/lib/reveniu";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { plan } = await req.json();
  if (!["starter", "profesional", "business"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalido" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true, reveniuSubscriptionId: true, subscriptionStatus: true },
  });

  if (company?.subscriptionStatus === "active") {
    if (company.plan === plan) {
      return NextResponse.json(
        { error: "Ya tienes este plan activo" },
        { status: 400 }
      );
    }

    // Cambio de plan: cancelar suscripcion anterior
    if (company.reveniuSubscriptionId) {
      await cancelSubscription(company.reveniuSubscriptionId);
    }
    await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        subscriptionStatus: "switching",
        reveniuSubscriptionId: null,
      },
    });
  }

  try {
    const result = await createSubscription(
      plan,
      session.user.email!,
      session.user.name || session.user.email!,
      session.user.companyId
    );

    await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        reveniuSubscriptionId: result.id,
        subscriptionStatus: company?.subscriptionStatus === "active" ? "switching" : "none",
      },
    });

    return NextResponse.json({
      completion_url: result.completion_url,
      security_token: result.security_token,
    });
  } catch (error) {
    console.error("Error al crear suscripción en Reveniu:", error);
    return NextResponse.json(
      { error: "Error al crear la suscripción" },
      { status: 500 }
    );
  }
}
