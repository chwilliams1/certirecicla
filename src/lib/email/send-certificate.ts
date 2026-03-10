import { getResend } from "@/lib/resend";
import { formatPeriod } from "@/lib/format-period";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf/generate-certificate-pdf";
import { DEFAULT_BRANDING } from "@/lib/pdf/branding-config";
import { groupRecordsIntoPickups, formatPickupsForPdf } from "@/lib/pickup-grouping";

interface CertificateWithRelations {
  id: string;
  uniqueCode: string;
  totalKg: number;
  totalCo2: number;
  materials: string;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  client: { id: string; name: string; email: string | null; rut: string | null };
  company: { id: string; name: string; rut: string | null; address: string | null; phone: string | null; email: string | null; logo: string | null; sanitaryResolution: string | null; plantAddress: string | null; signatureUrl?: string | null };
}

interface EmailOverrides {
  to?: string;
  cc?: string;
  subject?: string;
  body?: string;
}

function buildEmailHtml(bodyText: string, companyName: string): string {
  const htmlBody = bodyText.replace(/\n/g, "<br>");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="border-bottom: 2px solid #4a6b4e; padding-bottom: 12px; margin-bottom: 24px;">
        <h2 style="color: #4a6b4e; margin: 0;">Certificado de Reciclaje</h2>
      </div>
      <div style="line-height: 1.6;">
        ${htmlBody}
      </div>
      <div style="border-top: 1px solid #e8e4dc; margin-top: 32px; padding-top: 12px;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          Emitido por ${companyName} a través de CertiRecicla
        </p>
      </div>
    </div>
  `;
}

export async function sendCertificateEmail(
  certificate: CertificateWithRelations,
  overrides?: EmailOverrides
) {
  const recipientEmail = overrides?.to || certificate.client.email;
  if (!recipientEmail) {
    return { success: false, error: "Cliente sin email" };
  }

  const defaultSubject = `Certificado de Reciclaje - ${certificate.client.name}`;
  const finalSubject = overrides?.subject || defaultSubject;

  const emailLog = await prisma.emailLog.create({
    data: {
      companyId: certificate.company.id,
      clientId: certificate.client.id,
      certificateId: certificate.id,
      to: recipientEmail,
      subject: finalSubject,
      template: "certificate",
      status: "pending",
    },
  });

  try {
    // Fetch pickups for the period
    const pickupRecords = await prisma.recyclingRecord.findMany({
      where: {
        clientId: certificate.client.id,
        companyId: certificate.company.id,
        pickupDate: {
          gte: certificate.periodStart,
          lte: certificate.periodEnd,
        },
      },
      orderBy: { pickupDate: "asc" },
    });

    const grouped = groupRecordsIntoPickups(pickupRecords);
    const pickups = formatPickupsForPdf(grouped);

    // Build branding with signature (available to all plans)
    const signatureUrl = certificate.company.signatureUrl || undefined;
    const branding = signatureUrl
      ? { ...DEFAULT_BRANDING, signatureImageUrl: signatureUrl }
      : DEFAULT_BRANDING;

    const pdfBuffer = await generateCertificatePDF({
      uniqueCode: certificate.uniqueCode,
      clientName: certificate.client.name,
      clientRut: certificate.client.rut || "",
      companyName: certificate.company.name,
      companyRut: certificate.company.rut || "",
      companyAddress: certificate.company.address || "",
      companyLogo: certificate.company.logo || undefined,
      sanitaryResolution: certificate.company.sanitaryResolution || undefined,
      plantAddress: certificate.company.plantAddress || undefined,
      totalKg: certificate.totalKg,
      totalCo2: certificate.totalCo2,
      materials: JSON.parse(certificate.materials),
      periodStart: certificate.periodStart.toISOString(),
      periodEnd: certificate.periodEnd.toISOString(),
      createdAt: certificate.createdAt.toISOString(),
      status: "sent",
      pickups,
    }, branding);

    // Build HTML: use custom body or default
    let html: string;
    if (overrides?.body) {
      html = buildEmailHtml(overrides.body, certificate.company.name);
    } else {
      const period = formatPeriod(certificate.periodStart);
      const defaultBody = `Estimado/a equipo de <strong>${certificate.client.name}</strong>,\n\nAdjunto encontrarán su certificado de reciclaje correspondiente a <strong>${period}</strong>.\n\n<div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0;"><strong>Total reciclado:</strong> ${certificate.totalKg.toLocaleString("es-CL")} kg</p><p style="margin: 8px 0 0;"><strong>CO₂ evitado:</strong> ${certificate.totalCo2.toLocaleString("es-CL")} kg</p></div>\n\nGracias por su compromiso con el medio ambiente.`;
      html = buildEmailHtml(defaultBody, certificate.company.name);
    }

    const resend = getResend();
    const emailPayload: {
      from: string;
      to: string[];
      cc?: string[];
      subject: string;
      html: string;
      attachments: Array<{ filename: string; content: Buffer }>;
    } = {
      from: `CertiRecicla <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: finalSubject,
      html,
      attachments: [
        {
          filename: `certificado-${certificate.uniqueCode}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    if (overrides?.cc) {
      emailPayload.cc = [overrides.cc];
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: "failed", error: error.message },
      });
      return { success: false, error: error.message };
    }

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: "sent", resendId: data?.id, sentAt: new Date() },
    });

    return { success: true, emailLogId: emailLog.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: "failed", error: message },
    });
    return { success: false, error: message };
  }
}
