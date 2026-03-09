import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCertificateLimit, isTrialExpired } from "@/lib/plans";
import { generateCertCode } from "@/lib/generate-cert-code";
import { hasPermission } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { companyId: session.user.companyId };
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { uniqueCode: { contains: search } },
      { client: { name: { contains: search } } },
    ];
  }

  const certificates = await prisma.certificate.findMany({
    where,
    include: {
      client: { select: { name: true, email: true, parentClient: { select: { name: true } } } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(certificates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:create")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, periodStart, periodEnd } = body;

  if (!clientId || !periodStart || !periodEnd) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Check plan limits
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true, trialEndsAt: true },
  });

  if (company?.plan === "trial" && isTrialExpired(company.trialEndsAt)) {
    return NextResponse.json(
      { error: "Tu periodo de prueba ha terminado. Selecciona un plan para continuar." },
      { status: 403 }
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentMonthCerts = await prisma.certificate.count({
    where: {
      companyId: session.user.companyId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  });

  const certLimitCheck = checkCertificateLimit(currentMonthCerts, company?.plan || "trial");
  if (!certLimitCheck.allowed) {
    return NextResponse.json({ error: certLimitCheck.reason }, { status: 403 });
  }

  const records = await prisma.recyclingRecord.findMany({
    where: {
      clientId,
      companyId: session.user.companyId,
      pickupDate: {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      },
    },
  });

  if (records.length === 0) {
    return NextResponse.json({ error: "No hay registros en el período seleccionado" }, { status: 400 });
  }

  const materialTotals: Record<string, { kg: number; co2: number }> = {};
  let totalKg = 0;
  let totalCo2 = 0;

  records.forEach((r) => {
    if (!materialTotals[r.material]) {
      materialTotals[r.material] = { kg: 0, co2: 0 };
    }
    materialTotals[r.material].kg += r.quantityKg;
    materialTotals[r.material].co2 += r.co2Saved;
    totalKg += r.quantityKg;
    totalCo2 += r.co2Saved;
  });

  // Generate descriptive name: "ClientName - Mes Año"
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true, parentClient: { select: { name: true } } },
  });

  const { formatPeriod } = await import("@/lib/format-period");

  const clientLabel = client?.parentClient
    ? `${client.parentClient.name} (${client.name})`
    : client?.name || "Cliente";

  const certName = `${clientLabel} — ${formatPeriod(periodStart)}`;

  const certificate = await prisma.certificate.create({
    data: {
      uniqueCode: generateCertCode(),
      clientId,
      companyId: session.user.companyId,
      name: certName,
      totalKg,
      totalCo2,
      materials: JSON.stringify(materialTotals),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      status: "draft",
    },
    include: { client: { select: { name: true } } },
  });

  return NextResponse.json(certificate);
}
