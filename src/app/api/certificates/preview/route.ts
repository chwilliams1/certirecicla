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
  if (!hasPermission(session.user.role, "certificates:create")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { clientIds, periodStart, periodEnd } = body as {
    clientIds: string[];
    periodStart: string;
    periodEnd: string;
  };

  if (!clientIds || clientIds.length === 0 || !periodStart || !periodEnd) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const companyId = session.user.companyId;

  // Fetch clients info
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds }, companyId },
    select: { id: true, name: true, parentClient: { select: { name: true } } },
  });

  // Fetch all records for these clients in the period
  const records = await prisma.recyclingRecord.findMany({
    where: {
      companyId,
      clientId: { in: clientIds },
      pickupDate: {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      },
    },
    orderBy: { pickupDate: "desc" },
  });

  // Check for existing certificates in this period for these clients
  const existingCerts = await prisma.certificate.findMany({
    where: {
      companyId,
      clientId: { in: clientIds },
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    },
    select: { clientId: true, status: true },
  });
  const existingCertMap = new Map(existingCerts.map((c) => [c.clientId, c.status]));

  // Build preview per client
  const clientNameMap = new Map(clients.map((c) => [c.id, c.name]));
  const clientParentMap = new Map(clients.map((c) => [c.id, c.parentClient?.name || null]));

  const previews = clientIds.map((clientId) => {
    const clientRecords = records.filter((r) => r.clientId === clientId);
    const clientName = clientNameMap.get(clientId) || "Desconocido";
    const existingStatus = existingCertMap.get(clientId) || null;

    const materialTotals: Record<string, { kg: number; co2: number }> = {};
    let totalKg = 0;
    let totalCo2 = 0;

    clientRecords.forEach((r) => {
      if (!materialTotals[r.material]) {
        materialTotals[r.material] = { kg: 0, co2: 0 };
      }
      materialTotals[r.material].kg += r.quantityKg;
      materialTotals[r.material].co2 += r.co2Saved;
      totalKg += r.quantityKg;
      totalCo2 += r.co2Saved;
    });

    // Group records into pickups for display
    const pickupMap = new Map<string, { date: string; location: string | null; materials: Array<{ material: string; kg: number }> }>();
    clientRecords.forEach((r) => {
      const dateStr = r.pickupDate.toISOString().slice(0, 10);
      const key = `${dateStr}|${r.location || ""}`;
      if (!pickupMap.has(key)) {
        pickupMap.set(key, { date: dateStr, location: r.location, materials: [] });
      }
      pickupMap.get(key)!.materials.push({ material: r.material, kg: r.quantityKg });
    });

    return {
      clientId,
      clientName,
      parentClientName: clientParentMap.get(clientId) || null,
      recordCount: clientRecords.length,
      pickups: Array.from(pickupMap.values()).sort((a, b) => b.date.localeCompare(a.date)),
      materials: materialTotals,
      totalKg,
      totalCo2,
      existingCertStatus: existingStatus,
    };
  });

  return NextResponse.json({ previews });
}
