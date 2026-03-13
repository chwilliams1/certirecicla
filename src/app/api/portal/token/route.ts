import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { checkFeatureAccess } from "@/lib/plans";
import crypto from "crypto";

function generatePortalSlug(companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const code = crypto.randomBytes(16).toString("base64url");
  return `${slug}-${code}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "portal:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Check plan access for client portal
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true, name: true },
  });
  if (!company || !checkFeatureAccess(company.plan, "clientPortal")) {
    return NextResponse.json(
      { error: "Portal de clientes disponible desde el plan Profesional" },
      { status: 403 }
    );
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

  // Reuse existing active token if available (permanent link)
  const existing = await prisma.clientPortalToken.findFirst({
    where: { clientId, companyId: session.user.companyId, active: true },
  });

  if (existing) {
    return NextResponse.json({
      token: existing.token,
      url: `/portal/${existing.token}`,
    });
  }

  // Create new token with readable slug
  const portalToken = await prisma.clientPortalToken.create({
    data: {
      clientId,
      companyId: session.user.companyId,
      token: generatePortalSlug(company.name),
    },
  });

  return NextResponse.json({
    token: portalToken.token,
    url: `/portal/${portalToken.token}`,
  });
}
