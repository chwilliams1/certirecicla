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
  if (!hasPermission(session.user.role, "upload:data")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { data } = body as {
    data: Array<{
      nombre_cliente: string;
      nombre_sucursal?: string;
      material: string;
      cantidad_kg: number;
      fecha_retiro: string;
      ubicacion: string;
    }>;
  };

  if (!data || !Array.isArray(data)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const companyId = session.user.companyId;

  // Resolve client names to IDs (include sucursal names)
  const allClientNames = Array.from(new Set(
    data.flatMap((r) => r.nombre_sucursal ? [r.nombre_cliente, r.nombre_sucursal] : [r.nombre_cliente])
  ));
  const clients = await prisma.client.findMany({
    where: { companyId, name: { in: allClientNames } },
    select: { id: true, name: true, parentClientId: true },
  });
  // For sucursales, the effective client is the branch (sucursal name)
  const clientNameToId = new Map(clients.map((c) => [c.name, c.id]));

  // Get unique dates from the data
  const uniqueDates = Array.from(new Set(data.map((r) => r.fecha_retiro)));
  const dateObjects = uniqueDates.map((d) => new Date(d));

  // Fetch all existing records for these clients and dates in one query
  const clientIds = clients.map((c) => c.id);
  const existingRecords = clientIds.length > 0
    ? await prisma.recyclingRecord.findMany({
        where: {
          companyId,
          clientId: { in: clientIds },
          pickupDate: { in: dateObjects },
        },
        select: {
          clientId: true,
          pickupDate: true,
          material: true,
          quantityKg: true,
        },
      })
    : [];

  // Build lookup set for O(1) duplicate checking
  const existingKeys = new Set(
    existingRecords.map(
      (r) => `${r.clientId}|${r.pickupDate.toISOString().slice(0, 10)}|${r.material}|${r.quantityKg}`
    )
  );

  // Check each record (use sucursal name as client when available)
  const duplicates: boolean[] = data.map((row) => {
    const effectiveName = row.nombre_sucursal || row.nombre_cliente;
    const clientId = clientNameToId.get(effectiveName);
    if (!clientId) return false; // New client, can't be duplicate
    const key = `${clientId}|${row.fecha_retiro}|${row.material}|${row.cantidad_kg}`;
    return existingKeys.has(key);
  });

  const duplicateCount = duplicates.filter(Boolean).length;

  return NextResponse.json({ duplicates, duplicateCount });
}
