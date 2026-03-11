import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import {
  onboardingDay1Email,
  onboardingDay3Email,
  onboardingDay7Email,
  onboardingDay12Email,
} from "@/lib/email/templates";

const ONBOARDING_STEPS = [
  { day: 1, field: "onboardingDay1SentAt" as const, template: onboardingDay1Email },
  { day: 3, field: "onboardingDay3SentAt" as const, template: onboardingDay3Email },
  { day: 7, field: "onboardingDay7SentAt" as const, template: onboardingDay7Email },
  { day: 12, field: "onboardingDay12SentAt" as const, template: onboardingDay12Email },
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const results: { userId: string; day: number; status: string }[] = [];

  for (const step of ONBOARDING_STEPS) {
    const cutoff = new Date(now.getTime() - step.day * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        createdAt: { lte: cutoff },
        [step.field]: null,
        company: {
          plan: "trial",
        },
      },
      include: {
        company: { select: { plan: true } },
      },
    });

    for (const user of users) {
      const emailData = step.template({ userName: user.name });
      try {
        await sendTransactionalEmail({
          to: [user.email],
          subject: emailData.subject,
          html: emailData.html,
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { [step.field]: now },
        });
        results.push({ userId: user.id, day: step.day, status: "sent" });
      } catch {
        results.push({ userId: user.id, day: step.day, status: "error" });
      }
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
