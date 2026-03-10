import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { portalLinkEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { clientId, email: overrideEmail } = await req.json();

  if (!clientId) {
    return NextResponse.json({ error: "clientId es requerido" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, companyId: session.user.companyId },
    select: { id: true, name: true, email: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const recipientEmail = overrideEmail || client.email;
  if (!recipientEmail) {
    return NextResponse.json({ error: "El cliente no tiene email configurado" }, { status: 400 });
  }

  // Get or create portal token
  let portalToken = await prisma.clientPortalToken.findFirst({
    where: { clientId: client.id, companyId: session.user.companyId, active: true },
  });

  if (!portalToken) {
    portalToken = await prisma.clientPortalToken.create({
      data: {
        clientId: client.id,
        companyId: session.user.companyId,
      },
    });
  }

  const portalUrl = `${process.env.NEXTAUTH_URL}/portal/${portalToken.token}`;
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { name: true },
  });

  const emailData = portalLinkEmail({
    companyName: company?.name || "",
    clientName: client.name,
    portalUrl,
  });

  const result = await sendTransactionalEmail({
    to: recipientEmail,
    subject: emailData.subject,
    html: emailData.html,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: "Enlace de portal enviado", portalUrl });
}
