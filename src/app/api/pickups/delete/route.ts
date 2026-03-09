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
  if (!hasPermission(session.user.role, "pickups:delete")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { clientId, date, location } = await req.json();

  if (!clientId || !date) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const dayStart = new Date(date + "T00:00:00.000Z");
  const dayEnd = new Date(date + "T23:59:59.999Z");

  // Check if any certificate covers this pickup date
  const overlappingCert = await prisma.certificate.findFirst({
    where: {
      companyId: session.user.companyId,
      clientId,
      periodStart: { lte: dayEnd },
      periodEnd: { gte: dayStart },
    },
  });

  if (overlappingCert) {
    return NextResponse.json(
      { error: "No se puede eliminar un retiro que ya tiene certificado asociado" },
      { status: 400 }
    );
  }

  const result = await prisma.recyclingRecord.deleteMany({
    where: {
      companyId: session.user.companyId,
      clientId,
      pickupDate: { gte: dayStart, lte: dayEnd },
      location: location || null,
    },
  });

  return NextResponse.json({ deleted: result.count });
}
