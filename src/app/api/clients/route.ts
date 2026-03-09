import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientCreateSchema } from "@/lib/validations";
import { checkClientLimit, isTrialExpired } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { companyId: session.user.companyId, active: true },
    include: {
      _count: { select: { records: true, certificates: true } },
      parentClient: { select: { id: true, name: true } },
      branches: {
        where: { active: true },
        include: {
          _count: { select: { records: true, certificates: true } },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Count distinct pickups (unique date+location combos) per client
  const pickupCounts = await prisma.recyclingRecord.groupBy({
    by: ["clientId", "pickupDate", "location"],
    where: { companyId: session.user.companyId },
  });

  const pickupCountMap: Record<string, number> = {};
  for (const row of pickupCounts) {
    pickupCountMap[row.clientId] = (pickupCountMap[row.clientId] || 0) + 1;
  }

  const enriched = clients.map((c) => ({
    ...c,
    pickupCount: pickupCountMap[c.id] || 0,
    branches: (c.branches || []).map((b) => ({
      ...b,
      pickupCount: pickupCountMap[b.id] || 0,
    })),
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const companyId = session.user.companyId;

  // Check plan limits
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { plan: true, trialEndsAt: true },
  });

  if (company?.plan === "trial" && isTrialExpired(company.trialEndsAt)) {
    return NextResponse.json(
      { error: "Tu periodo de prueba ha terminado. Selecciona un plan para continuar." },
      { status: 403 }
    );
  }

  const activeClientCount = await prisma.client.count({
    where: { companyId, active: true, parentClientId: null },
  });

  const limitCheck = checkClientLimit(activeClientCount, company?.plan || "trial");
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.reason }, { status: 403 });
  }

  // New format: empresa + sucursal (optional)
  if (body.empresa) {
    const empresaName = String(body.empresa).trim();
    const sucursalName = body.sucursal ? String(body.sucursal).trim() : "";

    if (!empresaName) {
      return NextResponse.json({ error: "El nombre de la empresa es requerido" }, { status: 400 });
    }

    const details = {
      ...(body.rut && { rut: String(body.rut).trim() }),
      ...(body.email && { email: String(body.email).trim() }),
      ...(body.phone && { phone: String(body.phone).trim() }),
      ...(body.contactName && { contactName: String(body.contactName).trim() }),
      ...(body.address && { address: String(body.address).trim() }),
    };

    if (sucursalName) {
      // Find or create parent empresa
      let parent = await prisma.client.findFirst({
        where: { name: empresaName, companyId, parentClientId: null },
      });
      if (!parent) {
        parent = await prisma.client.create({
          data: { name: empresaName, companyId },
        });
      }

      // Create sucursal as branch
      const branch = await prisma.client.create({
        data: {
          name: sucursalName,
          companyId,
          parentClientId: parent.id,
          ...details,
        },
      });
      return NextResponse.json(branch);
    } else {
      // No sucursal: create standalone client
      const client = await prisma.client.create({
        data: {
          name: empresaName,
          companyId,
          ...details,
        },
      });
      return NextResponse.json(client);
    }
  }

  // Legacy format: name + parentClientId
  const parsed = clientCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  if (parsed.data.parentClientId) {
    const parent = await prisma.client.findFirst({
      where: { id: parsed.data.parentClientId, companyId, active: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Cliente padre no encontrado" }, { status: 400 });
    }
  }

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      companyId,
    },
  });

  return NextResponse.json(client);
}
