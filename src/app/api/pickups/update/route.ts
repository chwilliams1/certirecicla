import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCo2, VALID_MATERIALS } from "@/lib/co2-calculator";
import { hasPermission } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "pickups:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, originalDate, originalLocation, pickupDate, location, materials } = body as {
    clientId: string;
    originalDate: string;
    originalLocation: string;
    pickupDate: string;
    location?: string;
    materials: Array<{ material: string; quantityKg: number }>;
  };

  if (!clientId || !originalDate || !pickupDate || !materials || materials.length === 0) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  for (const m of materials) {
    if (!VALID_MATERIALS.includes(m.material)) {
      return NextResponse.json({ error: `Material inválido: ${m.material}` }, { status: 400 });
    }
    if (!m.quantityKg || m.quantityKg <= 0) {
      return NextResponse.json({ error: `Cantidad inválida para ${m.material}` }, { status: 400 });
    }
  }

  const companyId = session.user.companyId;
  const origDayStart = new Date(originalDate + "T00:00:00.000Z");
  const origDayEnd = new Date(originalDate + "T23:59:59.999Z");
  const newDateObj = new Date(pickupDate + "T12:00:00");

  // Check if any certificate covers this pickup date
  const overlappingCert = await prisma.certificate.findFirst({
    where: {
      companyId,
      clientId,
      periodStart: { lte: origDayEnd },
      periodEnd: { gte: origDayStart },
    },
  });

  if (overlappingCert) {
    return NextResponse.json(
      { error: "No se puede editar un retiro que ya tiene certificado asociado" },
      { status: 400 }
    );
  }

  // Transaction: delete old records, create new ones
  await prisma.$transaction(async (tx) => {
    await tx.recyclingRecord.deleteMany({
      where: {
        companyId,
        clientId,
        pickupDate: { gte: origDayStart, lte: origDayEnd },
        location: originalLocation || null,
      },
    });

    const batchId = `edit-${Date.now()}`;
    for (const m of materials) {
      const co2Saved = calculateCo2(m.material, m.quantityKg);
      await tx.recyclingRecord.create({
        data: {
          clientId,
          companyId,
          material: m.material,
          quantityKg: m.quantityKg,
          co2Saved,
          pickupDate: newDateObj,
          location: location || null,
          batchId,
        },
      });
    }
  });

  return NextResponse.json({ updated: materials.length });
}
