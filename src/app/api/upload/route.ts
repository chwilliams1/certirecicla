import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCo2 } from "@/lib/co2-calculator";
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
  const { data, newClientDetails } = body as {
    data: Array<{
      nombre_cliente: string;
      nombre_sucursal?: string;
      material: string;
      cantidad_kg: number;
      fecha_retiro: string;
      ubicacion: string;
    }>;
    newClientDetails?: Record<string, {
      rut?: string;
      email?: string;
      phone?: string;
      address?: string;
      contactName?: string;
    }>;
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ error: "No hay datos para importar" }, { status: 400 });
  }

  const companyId = session.user.companyId;
  const batchId = `batch-${Date.now()}`;
  let recordsCreated = 0;
  let clientsCreated = 0;
  let duplicatesSkipped = 0;

  // Pre-fetch existing records for duplicate detection
  const allClientNames = Array.from(new Set(
    data.flatMap((r) => r.nombre_sucursal ? [r.nombre_cliente, r.nombre_sucursal] : [r.nombre_cliente])
  ));
  const existingClients = await prisma.client.findMany({
    where: { companyId, name: { in: allClientNames } },
    select: { id: true, name: true, parentClientId: true },
  });
  const clientNameToId = new Map(existingClients.map((c) => [c.name, c.id]));

  const existingClientIds = existingClients.map((c) => c.id);
  const uniqueDates = Array.from(new Set(data.map((r) => r.fecha_retiro)));
  const dateObjects = uniqueDates.map((d) => new Date(d + "T12:00:00"));

  const existingRecords = existingClientIds.length > 0
    ? await prisma.recyclingRecord.findMany({
        where: {
          companyId,
          clientId: { in: existingClientIds },
          pickupDate: { in: dateObjects },
        },
        select: { clientId: true, pickupDate: true, material: true, quantityKg: true },
      })
    : [];

  const existingKeys = new Set(
    existingRecords.map(
      (r) => `${r.clientId}|${r.pickupDate.toISOString().slice(0, 10)}|${r.material}|${r.quantityKg}`
    )
  );

  // Use transaction for atomicity
  try {
  await prisma.$transaction(async (tx) => {
    const parentCache = new Map<string, string>();
    const branchCache = new Map<string, string>();
    const recordsBatch: Array<{
      clientId: string;
      companyId: string;
      material: string;
      quantityKg: number;
      co2Saved: number;
      pickupDate: Date;
      location: string | null;
      batchId: string;
    }> = [];

    for (const row of data) {
      let clientId: string;

      if (row.nombre_sucursal) {
        // Find or create parent client
        let parentId = parentCache.get(row.nombre_cliente);
        if (!parentId) {
          let parent = await tx.client.findFirst({
            where: { name: row.nombre_cliente, companyId, parentClientId: null },
          });
          if (!parent) {
            const details = newClientDetails?.[row.nombre_cliente];
            parent = await tx.client.create({
              data: {
                name: row.nombre_cliente,
                companyId,
                ...(details?.rut && { rut: details.rut }),
                ...(details?.email && { email: details.email }),
                ...(details?.phone && { phone: details.phone }),
                ...(details?.address && { address: details.address }),
                ...(details?.contactName && { contactName: details.contactName }),
              },
            });
            clientsCreated++;
          }
          parentId = parent.id;
          parentCache.set(row.nombre_cliente, parentId);
        }

        // Find or create branch client
        const branchKey = `${parentId}|${row.nombre_sucursal}`;
        const cachedBranchId = branchCache.get(branchKey);
        if (cachedBranchId) {
          clientId = cachedBranchId;
        } else {
          let branch = await tx.client.findFirst({
            where: { name: row.nombre_sucursal, companyId, parentClientId: parentId },
          });
          if (!branch) {
            const branchDetails = newClientDetails?.[row.nombre_sucursal];
            branch = await tx.client.create({
              data: {
                name: row.nombre_sucursal,
                companyId,
                parentClientId: parentId,
                ...(branchDetails?.rut && { rut: branchDetails.rut }),
                ...(branchDetails?.email && { email: branchDetails.email }),
                ...(branchDetails?.phone && { phone: branchDetails.phone }),
                ...(branchDetails?.address && { address: branchDetails.address }),
                ...(branchDetails?.contactName && { contactName: branchDetails.contactName }),
              },
            });
            clientsCreated++;
          }
          clientId = branch.id;
          branchCache.set(branchKey, clientId);
        }
      } else {
        // No sucursal: original behavior
        let client = await tx.client.findFirst({
          where: { name: row.nombre_cliente, companyId },
        });

        if (!client) {
          const details = newClientDetails?.[row.nombre_cliente];
          client = await tx.client.create({
            data: {
              name: row.nombre_cliente,
              companyId,
              ...(details?.rut && { rut: details.rut }),
              ...(details?.email && { email: details.email }),
              ...(details?.phone && { phone: details.phone }),
              ...(details?.address && { address: details.address }),
              ...(details?.contactName && { contactName: details.contactName }),
            },
          });
          clientsCreated++;
        }
        clientId = client.id;
      }

      // Check for duplicate
      const dupKey = `${clientId}|${row.fecha_retiro}|${row.material}|${row.cantidad_kg}`;
      if (existingKeys.has(dupKey)) {
        duplicatesSkipped++;
        continue;
      }

      const co2Saved = calculateCo2(row.material, row.cantidad_kg);
      recordsBatch.push({
        clientId,
        companyId,
        material: row.material,
        quantityKg: row.cantidad_kg,
        co2Saved,
        pickupDate: new Date(row.fecha_retiro + "T12:00:00"),
        location: row.ubicacion || null,
        batchId,
      });
      existingKeys.add(dupKey);
    }

    // Batch insert all records at once
    if (recordsBatch.length > 0) {
      await tx.recyclingRecord.createMany({ data: recordsBatch });
      recordsCreated = recordsBatch.length;
    }
  }, { timeout: 30000 });
  } catch {
    return NextResponse.json(
      { error: "Error al importar los datos" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    recordsCreated,
    clientsCreated,
    duplicatesSkipped,
    batchId,
  });
}
