import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCo2, VALID_MATERIALS } from "@/lib/co2-calculator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, pickupDate, location, materials } = body as {
    clientId: string;
    pickupDate: string;
    location?: string;
    materials: Array<{ material: string; quantityKg: number }>;
  };

  if (!clientId || !pickupDate || !materials || materials.length === 0) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Validate materials
  for (const m of materials) {
    if (!VALID_MATERIALS.includes(m.material)) {
      return NextResponse.json({ error: `Material inválido: ${m.material}` }, { status: 400 });
    }
    if (!m.quantityKg || m.quantityKg <= 0) {
      return NextResponse.json({ error: `Cantidad inválida para ${m.material}` }, { status: 400 });
    }
  }

  const companyId = session.user.companyId;
  const dateObj = new Date(pickupDate);

  // Check client exists
  const client = await prisma.client.findFirst({
    where: { id: clientId, companyId },
  });
  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  // Check for duplicates
  const existingRecords = await prisma.recyclingRecord.findMany({
    where: {
      companyId,
      clientId,
      pickupDate: dateObj,
    },
    select: { material: true, quantityKg: true },
  });

  const existingKeys = new Set(
    existingRecords.map((r) => `${r.material}|${r.quantityKg}`)
  );

  const duplicates: string[] = [];
  const toCreate: Array<{ material: string; quantityKg: number }> = [];

  for (const m of materials) {
    const key = `${m.material}|${m.quantityKg}`;
    if (existingKeys.has(key)) {
      duplicates.push(m.material);
    } else {
      toCreate.push(m);
    }
  }

  if (toCreate.length === 0) {
    return NextResponse.json({
      error: "Todos los materiales ya están registrados para esta fecha y cliente",
      duplicates,
    }, { status: 409 });
  }

  // Create records
  const batchId = `manual-${Date.now()}`;
  let recordsCreated = 0;

  for (const m of toCreate) {
    const co2Saved = calculateCo2(m.material, m.quantityKg);
    await prisma.recyclingRecord.create({
      data: {
        clientId,
        companyId,
        material: m.material,
        quantityKg: m.quantityKg,
        co2Saved,
        pickupDate: dateObj,
        location: location || null,
        batchId,
      },
    });
    recordsCreated++;
  }

  return NextResponse.json({
    recordsCreated,
    duplicatesSkipped: duplicates.length,
    duplicates,
  });
}
