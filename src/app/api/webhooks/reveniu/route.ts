import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSubscription, getReveniuPlanKey, REVENIU_PLAN_MAP } from "@/lib/reveniu";
import { getPlanConfig } from "@/lib/plans";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import {
  subscriptionActivatedEmail,
  subscriptionCancelledEmail,
  paymentFailedEmail,
} from "@/lib/email/templates";

async function getCompanyAdminEmails(companyId: string): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { companyId, role: "admin" },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}

export async function POST(req: NextRequest) {
  const secretKey = req.headers.get("Reveniu-Secret-Key") || "";
  const expected = process.env.REVENIU_SECRET_KEY || "";
  const isValid = expected.length > 0 && secretKey.length === expected.length && crypto.timingSafeEqual(Buffer.from(secretKey), Buffer.from(expected));
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { event, subscription_id } = body;

  if (!subscription_id) {
    return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { reveniuSubscriptionId: subscription_id },
    select: { id: true, subscriptionStatus: true },
  });

  if (!company) {
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
      const updatedCompany = await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: planKey,
          subscriptionStatus: "active",
          planStartDate: new Date(),
          maxClients: planConfig.maxClients,
          maxCertificatesPerMonth: planConfig.maxCertificatesPerMonth,
        },
      });

      // Send activation email
      try {
        const emails = await getCompanyAdminEmails(company.id);
        if (emails.length > 0) {
          const emailData = subscriptionActivatedEmail({ companyName: updatedCompany.name, planName: planKey });
          sendTransactionalEmail({ to: emails, subject: emailData.subject, html: emailData.html });
        }
      } catch { /* fire-and-forget */ }
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
      const failedCompany = await prisma.company.update({
        where: { id: company.id },
        data: { subscriptionStatus: "failed" },
      });

      try {
        const emails = await getCompanyAdminEmails(company.id);
        if (emails.length > 0) {
          const emailData = paymentFailedEmail({ companyName: failedCompany.name });
          sendTransactionalEmail({ to: emails, subject: emailData.subject, html: emailData.html });
        }
      } catch { /* fire-and-forget */ }
      break;
    }

    case "subscription_deactivated": {
      // Si está en proceso de cambio de plan, no revertir a trial
      if (company.subscriptionStatus === "switching") {
        break;
      }
      const deactivatedTrialConfig = getPlanConfig("trial");
      const deactivatedCompany = await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: "trial",
          subscriptionStatus: "cancelled",
          trialEndsAt: new Date(Date.now() - 1000),
          maxClients: deactivatedTrialConfig.maxClients,
          maxCertificatesPerMonth: deactivatedTrialConfig.maxCertificatesPerMonth,
        },
      });

      try {
        const emails = await getCompanyAdminEmails(company.id);
        if (emails.length > 0) {
          const emailData = subscriptionCancelledEmail({ companyName: deactivatedCompany.name });
          sendTransactionalEmail({ to: emails, subject: emailData.subject, html: emailData.html });
        }
      } catch { /* fire-and-forget */ }
      break;
    }

    case "subscription_renewal_cancelled": {
      const cancelledTrialConfig = getPlanConfig("trial");
      const cancelledCompany = await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: "trial",
          subscriptionStatus: "cancelled",
          trialEndsAt: new Date(Date.now() - 1000),
          maxClients: cancelledTrialConfig.maxClients,
          maxCertificatesPerMonth: cancelledTrialConfig.maxCertificatesPerMonth,
        },
      });

      try {
        const emails = await getCompanyAdminEmails(company.id);
        if (emails.length > 0) {
          const emailData = subscriptionCancelledEmail({ companyName: cancelledCompany.name });
          sendTransactionalEmail({ to: emails, subject: emailData.subject, html: emailData.html });
        }
      } catch { /* fire-and-forget */ }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
