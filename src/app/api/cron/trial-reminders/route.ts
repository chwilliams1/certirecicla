import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { trialExpiringEmail, trialExpiredEmail } from "@/lib/email/templates";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const results: { companyId: string; type: string; status: string }[] = [];

  // Query 1: Trial expiring soon (within 3 days) — not yet notified
  const expiringSoon = await prisma.company.findMany({
    where: {
      plan: "trial",
      trialEndsAt: {
        gte: now,
        lte: threeDaysFromNow,
      },
      trialExpiringSentAt: null,
    },
    include: {
      users: {
        where: { role: "admin" },
        select: { email: true },
      },
    },
  });

  for (const company of expiringSoon) {
    const daysLeft = Math.ceil(
      (company.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const adminEmails = company.users.map((u) => u.email);
    if (adminEmails.length === 0) continue;

    const emailData = trialExpiringEmail({ companyName: company.name, daysLeft });
    try {
      await sendTransactionalEmail({
        to: adminEmails,
        subject: emailData.subject,
        html: emailData.html,
      });
      await prisma.company.update({
        where: { id: company.id },
        data: { trialExpiringSentAt: now },
      });
      results.push({ companyId: company.id, type: "expiring", status: "sent" });
    } catch {
      results.push({ companyId: company.id, type: "expiring", status: "error" });
    }
  }

  // Query 2: Trial expired — not yet notified
  const expired = await prisma.company.findMany({
    where: {
      plan: "trial",
      trialEndsAt: { lt: now },
      trialExpiredSentAt: null,
    },
    include: {
      users: {
        where: { role: "admin" },
        select: { email: true },
      },
    },
  });

  for (const company of expired) {
    const adminEmails = company.users.map((u) => u.email);
    if (adminEmails.length === 0) continue;

    const emailData = trialExpiredEmail({ companyName: company.name });
    try {
      await sendTransactionalEmail({
        to: adminEmails,
        subject: emailData.subject,
        html: emailData.html,
      });
      await prisma.company.update({
        where: { id: company.id },
        data: { trialExpiredSentAt: now },
      });
      results.push({ companyId: company.id, type: "expired", status: "sent" });
    } catch {
      results.push({ companyId: company.id, type: "expired", status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
