import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReportPdfBuffer } from "@/lib/pdf/generate-report-pdf";
import { formatClientName } from "@/lib/format-client-name";
import { getResend } from "@/lib/resend";
import { buildEmailHtml } from "@/lib/email/email-template";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();

  const dueSchedules = await prisma.scheduledReport.findMany({
    where: {
      active: true,
      nextSendAt: { lte: now },
    },
    include: {
      client: { select: { name: true, rut: true, parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true, address: true } },
    },
  });

  const results: { id: string; status: string; error?: string }[] = [];

  for (const schedule of dueSchedules) {
    try {
      // Calculate period based on frequency
      let periodStart: Date;
      let periodEnd: Date;
      let periodLabel: string;

      if (schedule.frequency === "monthly") {
        // Previous month
        periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
        periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
        const months = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
        ];
        periodLabel = `${months[periodStart.getMonth()]} ${periodStart.getFullYear()}`;
      } else {
        // Previous quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const prevQ = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const prevYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        periodStart = new Date(prevYear, prevQ * 3, 1);
        periodEnd = new Date(prevYear, prevQ * 3 + 3, 0);
        periodLabel = `Q${prevQ + 1} ${prevYear}`;
      }

      // Get records
      const where: Record<string, unknown> = {
        companyId: schedule.companyId,
        pickupDate: { gte: periodStart, lte: periodEnd },
      };
      if (schedule.clientId) {
        // Include branches
        const branches = await prisma.client.findMany({
          where: { parentClientId: schedule.clientId, companyId: schedule.companyId },
          select: { id: true },
        });
        const ids = [schedule.clientId, ...branches.map((b) => b.id)];
        where.clientId = { in: ids };
      }

      const records = await prisma.recyclingRecord.findMany({
        where,
        orderBy: { pickupDate: "asc" },
      });

      if (records.length === 0) {
        results.push({ id: schedule.id, status: "skipped", error: "No records" });
        // Still advance the next send date
        await advanceNextSend(schedule.id, schedule.frequency, now);
        continue;
      }

      // Aggregate
      const materials: Record<string, { kg: number; co2: number }> = {};
      let totalKg = 0;
      let totalCo2 = 0;
      const pickupSet = new Set<string>();
      const monthlyMap: Record<string, { kg: number; co2: number }> = {};

      for (const r of records) {
        if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
        materials[r.material].kg += r.quantityKg;
        materials[r.material].co2 += r.co2Saved;
        totalKg += r.quantityKg;
        totalCo2 += r.co2Saved;
        pickupSet.add(`${r.pickupDate.toISOString().slice(0, 10)}|${r.location || ""}`);
        const month = r.pickupDate.toISOString().slice(0, 7);
        if (!monthlyMap[month]) monthlyMap[month] = { kg: 0, co2: 0 };
        monthlyMap[month].kg += r.quantityKg;
        monthlyMap[month].co2 += r.co2Saved;
      }

      const monthlyData = Object.entries(monthlyMap)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const clientName = schedule.clientId
        ? formatClientName(schedule.client!.name, schedule.client!.parentClient?.name)
        : "Todos los clientes";

      const pdfBuffer = await generateReportPdfBuffer({
        companyName: schedule.company.name,
        companyRut: schedule.company.rut || "",
        companyAddress: schedule.company.address || "",
        clientName,
        clientRut: schedule.client?.rut || "",
        periodStart: periodStart.toISOString().slice(0, 10),
        periodEnd: periodEnd.toISOString().slice(0, 10),
        periodLabel,
        totalKg,
        totalCo2,
        totalPickups: pickupSet.size,
        materials,
        monthlyData,
        generatedAt: new Date().toISOString(),
      });

      // Send email
      const emails: string[] = JSON.parse(schedule.emails);

      const bodyText = `Adjunto encontrarás el reporte de impacto ambiental para <strong>${clientName}</strong> correspondiente al periodo <strong>${periodLabel}</strong>.

<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 0;"><strong>Total reciclado:</strong> ${totalKg.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg</p>
<p style="margin: 8px 0 0;"><strong>CO₂ evitado:</strong> ${totalCo2.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg</p>
<p style="margin: 8px 0 0;"><strong>Retiros realizados:</strong> ${pickupSet.size}</p>
</div>

Gracias por su compromiso con el medio ambiente.`;

      const resend = getResend();
      await resend.emails.send({
        from: `CertiRecicla <onboarding@resend.dev>`,
        to: emails,
        subject: `Reporte de Impacto - ${periodLabel} - ${clientName}`,
        html: buildEmailHtml(bodyText, schedule.company.name),
        attachments: [
          {
            filename: `reporte-${periodLabel.replace(/\s+/g, "-")}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      // Update last sent and advance next
      await prisma.scheduledReport.update({
        where: { id: schedule.id },
        data: { lastSentAt: now },
      });
      await advanceNextSend(schedule.id, schedule.frequency, now);

      results.push({ id: schedule.id, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ id: schedule.id, status: "error", error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

async function advanceNextSend(id: string, frequency: string, from: Date) {
  let next: Date;
  if (frequency === "monthly") {
    next = new Date(from.getFullYear(), from.getMonth() + 1, 1, 8, 0, 0);
  } else {
    const currentQuarter = Math.floor(from.getMonth() / 3);
    const nextQuarterMonth = (currentQuarter + 1) * 3;
    next = new Date(from.getFullYear(), nextQuarterMonth, 1, 8, 0, 0);
  }
  await prisma.scheduledReport.update({
    where: { id },
    data: { nextSendAt: next },
  });
}
