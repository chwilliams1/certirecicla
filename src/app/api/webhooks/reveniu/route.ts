import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubscription, getReveniuPlanKey, REVENIU_PLAN_MAP } from "@/lib/reveniu";
import { getPlanConfig } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const secretKey = req.headers.get("Reveniu-Secret-Key");
  if (!secretKey || secretKey !== process.env.REVENIU_SECRET_KEY) {
    console.error("Webhook auth failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("Webhook received:", JSON.stringify(body));
  const { event, subscription_id } = body;

  if (!subscription_id) {
    return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { reveniuSubscriptionId: subscription_id },
    select: { id: true, subscriptionStatus: true },
  });

  if (!company) {
    console.error(`Webhook: no company found for subscription ${subscription_id}`);
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  switch (event) {
    case "subscription_activated": {
      // Get plan info from Reveniu to determine which plan was activated
      let planKey = "starter";
      try {
        const sub = await getSubscription(subscription_id);
        planKey = getReveniuPlanKey(sub.plan_id) || "starter";
      } catch {
        // Fallback: try to determine from existing data
      }

      const planConfig = getPlanConfig(planKey);
      await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: planKey,
          subscriptionStatus: "active",
          planStartDate: new Date(),
          maxClients: planConfig.maxClients,
          maxCertificatesPerMonth: planConfig.maxCertificatesPerMonth,
        },
      });
      break;
    }

    case "subscription_payment_succeeded": {
      await prisma.company.update({
        where: { id: company.id },
        data: { subscriptionStatus: "active" },
      });
      break;
    }

    case "subscription_payment_in_recovery": {
      await prisma.company.update({
        where: { id: company.id },
        data: { subscriptionStatus: "failed" },
      });
      break;
    }

    case "subscription_deactivated": {
      // Si está en proceso de cambio de plan, no revertir a trial
      if (company.subscriptionStatus === "switching") {
        break;
      }
      const deactivatedTrialConfig = getPlanConfig("trial");
      await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: "trial",
          subscriptionStatus: "cancelled",
          trialEndsAt: new Date(Date.now() - 1000),
          maxClients: deactivatedTrialConfig.maxClients,
          maxCertificatesPerMonth: deactivatedTrialConfig.maxCertificatesPerMonth,
        },
      });
      break;
    }

    case "subscription_renewal_cancelled": {
      const cancelledTrialConfig = getPlanConfig("trial");
      await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: "trial",
          subscriptionStatus: "cancelled",
          trialEndsAt: new Date(Date.now() - 1000),
          maxClients: cancelledTrialConfig.maxClients,
          maxCertificatesPerMonth: cancelledTrialConfig.maxCertificatesPerMonth,
        },
      });
      break;
    }

    default:
      console.log(`Webhook: unhandled event ${event}`);
  }

  return NextResponse.json({ ok: true });
}
