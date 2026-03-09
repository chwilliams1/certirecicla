import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "portal:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  // Verify client belongs to company
  const client = await prisma.client.findFirst({
    where: { id: clientId, companyId: session.user.companyId },
  });
  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  // Deactivate existing tokens for this client
  await prisma.clientPortalToken.updateMany({
    where: { clientId, companyId: session.user.companyId },
    data: { active: false },
  });

  // Create new token
  const portalToken = await prisma.clientPortalToken.create({
    data: {
      clientId,
      companyId: session.user.companyId,
    },
  });

  return NextResponse.json({
    token: portalToken.token,
    url: `/portal/${portalToken.token}`,
  });
}
