import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { groupRecordsIntoPickups, formatPickupsForPdf } from "@/lib/pickup-grouping";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      client: { include: { parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true, address: true, phone: true, logo: true, sanitaryResolution: true, plantAddress: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  // Fetch pickups for the period
  const pickupRecords = await prisma.recyclingRecord.findMany({
    where: {
      clientId: certificate.clientId,
      companyId: session.user.companyId,
      pickupDate: {
        gte: certificate.periodStart,
        lte: certificate.periodEnd,
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  const grouped = groupRecordsIntoPickups(pickupRecords);
  const pickups = formatPickupsForPdf(grouped);

  return NextResponse.json({ ...certificate, pickups });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:create")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { status, materials } = body as {
    status?: string;
    materials?: Record<string, { kg: number; co2: number }>;
  };

  // Fetch current certificate to check status
  const current = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!current) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  // Status change
  if (status) {
    if (!["draft", "published", "sent"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    updateData.status = status;
  }

  // Materials edit (only allowed for draft)
  if (materials) {
    if (current.status !== "draft") {
      return NextResponse.json({ error: "Solo se pueden editar certificados en borrador" }, { status: 400 });
    }

    // Fetch company CO2 factors for server-side recalculation
    const co2Factors = await prisma.co2Factor.findMany({
      where: { companyId: session.user.companyId },
    });
    const factorMap: Record<string, number> = {};
    for (const f of co2Factors) {
      factorMap[f.material] = f.factor;
    }

    // Recalculate CO2 from kg using company factors
    const { DEFAULT_CO2_FACTORS } = await import("@/lib/co2-calculator");
    const recalculated: Record<string, { kg: number; co2: number }> = {};
    let totalKg = 0;
    let totalCo2 = 0;
    for (const [mat, vals] of Object.entries(materials)) {
      const factor = factorMap[mat] ?? DEFAULT_CO2_FACTORS[mat] ?? 0;
      const co2 = Math.round(vals.kg * factor * 100) / 100;
      recalculated[mat] = { kg: vals.kg, co2 };
      totalKg += vals.kg;
      totalCo2 += co2;
    }

    updateData.materials = JSON.stringify(recalculated);
    updateData.totalKg = totalKg;
    updateData.totalCo2 = totalCo2;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No hay cambios" }, { status: 400 });
  }

  await prisma.certificate.update({
    where: { id: current.id },
    data: updateData,
  });

  const updated = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      client: { include: { parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true, address: true, phone: true, logo: true, sanitaryResolution: true, plantAddress: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "certificates:delete")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const cert = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!cert) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  if (cert.status !== "draft") {
    return NextResponse.json({ error: "Solo se pueden eliminar certificados en borrador" }, { status: 400 });
  }

  await prisma.certificate.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
