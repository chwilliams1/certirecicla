import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { leadNurtureDay3Email, leadNurtureDay7Email } from "@/lib/email/templates";

const NURTURE_STEPS = [
  { day: 3, field: "nurtureDay3SentAt" as const, template: leadNurtureDay3Email },
  { day: 7, field: "nurtureDay7SentAt" as const, template: leadNurtureDay7Email },
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const results: { leadId: string; day: number; status: string }[] = [];

  for (const step of NURTURE_STEPS) {
    const cutoff = new Date(now.getTime() - step.day * 24 * 60 * 60 * 1000);

    const leads = await prisma.calculatorLead.findMany({
      where: {
        createdAt: { lte: cutoff },
        [step.field]: null,
      },
    });

    for (const lead of leads) {
      // Skip if this email already registered as a user
      const existingUser = await prisma.user.findUnique({ where: { email: lead.email } });
      if (existingUser) {
        // Mark as sent so we don't check again
        await prisma.calculatorLead.update({
          where: { id: lead.id },
          data: { [step.field]: now },
        });
        results.push({ leadId: lead.id, day: step.day, status: "skipped-registered" });
        continue;
      }

      const emailData = step.template({ userName: lead.name, totalCo2: lead.totalCo2 });
      try {
        await sendTransactionalEmail({
          to: lead.email,
          subject: emailData.subject,
          html: emailData.html,
          replyTo: "hola@certirecicla.cl",
        });
        await prisma.calculatorLead.update({
          where: { id: lead.id },
          data: { [step.field]: now },
        });
        results.push({ leadId: lead.id, day: step.day, status: "sent" });
      } catch {
        results.push({ leadId: lead.id, day: step.day, status: "error" });
      }
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
