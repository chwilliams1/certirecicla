import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCertificateEmail } from "@/lib/email/send-certificate";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { certificateId } = body;

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

  if (!certificate.client.email) {
    return NextResponse.json({ error: "El cliente no tiene email configurado" }, { status: 400 });
  }

  const result = await sendCertificateEmail(certificate);

  if (result.success) {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: { status: "sent", sentAt: new Date() },
    });
  }

  return NextResponse.json(result);
}
