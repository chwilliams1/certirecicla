import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const date = searchParams.get("date");
  const location = searchParams.get("location");

  if (!clientId || !date) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const dayStart = new Date(date + "T00:00:00.000Z");
  const dayEnd = new Date(date + "T23:59:59.999Z");

  const records = await prisma.recyclingRecord.findMany({
    where: {
      companyId: session.user.companyId,
      clientId,
      pickupDate: { gte: dayStart, lte: dayEnd },
      location: location || null,
    },
    include: { client: { select: { name: true } } },
    orderBy: { material: "asc" },
  });

  return NextResponse.json(records);
}
