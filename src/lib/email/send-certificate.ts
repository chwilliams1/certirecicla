import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf/generate-certificate-pdf";

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
  company: { id: string; name: string; rut: string | null; address: string | null; phone: string | null; email: string | null };
}

export async function sendCertificateEmail(certificate: CertificateWithRelations) {
  const clientEmail = certificate.client.email;
  if (!clientEmail) {
    return { success: false, error: "Cliente sin email" };
  }

  const emailLog = await prisma.emailLog.create({
    data: {
      companyId: certificate.company.id,
      clientId: certificate.client.id,
      certificateId: certificate.id,
      to: clientEmail,
      subject: `Certificado de Reciclaje - ${certificate.client.name}`,
      template: "certificate",
      status: "pending",
    },
  });

  try {
    const pdfBuffer = await generateCertificatePDF({
      uniqueCode: certificate.uniqueCode,
      clientName: certificate.client.name,
      clientRut: certificate.client.rut || "",
      companyName: certificate.company.name,
      companyRut: certificate.company.rut || "",
      companyAddress: certificate.company.address || "",
      totalKg: certificate.totalKg,
      totalCo2: certificate.totalCo2,
      materials: JSON.parse(certificate.materials),
      periodStart: certificate.periodStart.toISOString(),
      periodEnd: certificate.periodEnd.toISOString(),
      createdAt: certificate.createdAt.toISOString(),
    });

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `CertiRecicla <onboarding@resend.dev>`,
      to: [clientEmail],
      subject: `Certificado de Reciclaje - ${certificate.client.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6b4e;">Certificado de Reciclaje</h2>
          <p>Estimado/a equipo de <strong>${certificate.client.name}</strong>,</p>
          <p>Adjunto encontrarán su certificado de reciclaje correspondiente al período
          ${certificate.periodStart.toLocaleDateString("es-CL")} - ${certificate.periodEnd.toLocaleDateString("es-CL")}.</p>
          <div style="background: #f4f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Total reciclado:</strong> ${certificate.totalKg.toLocaleString("es-CL")} kg</p>
            <p style="margin: 8px 0 0;"><strong>CO₂ evitado:</strong> ${certificate.totalCo2.toLocaleString("es-CL")} kg</p>
          </div>
          <p>Gracias por su compromiso con el medio ambiente.</p>
          <p style="color: #888; font-size: 12px;">Emitido por ${certificate.company.name} a través de CertiRecicla</p>
        </div>
      `,
      attachments: [
        {
          filename: `certificado-${certificate.uniqueCode}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

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
