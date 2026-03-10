import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCertificateEmail } from "@/lib/email/send-certificate";
import { hasPermission } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:send")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { certificateId, to, cc, subject, body: emailBody, publish } = body;

  if (!certificateId) {
    return NextResponse.json({ error: "certificateId es requerido" }, { status: 400 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, companyId: session.user.companyId },
    include: { client: true, company: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  // Use override email or fall back to client email
  const recipientEmail = to || certificate.client.email;
  if (!recipientEmail) {
    return NextResponse.json({ error: "El cliente no tiene email configurado" }, { status: 400 });
  }

  // Publish draft if requested
  if (publish && certificate.status === "draft") {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: { status: "published" },
    });
  }

  const result = await sendCertificateEmail(certificate, {
    to: recipientEmail,
    cc: cc || undefined,
    subject: subject || undefined,
    body: emailBody || undefined,
  });

  if (result.success) {
    // Use transaction to atomically update status
    await prisma.$transaction([
      prisma.certificate.update({
        where: { id: certificateId },
        data: { status: "sent", sentAt: new Date() },
      }),
    ]);
  }

  return NextResponse.json(result);
}
