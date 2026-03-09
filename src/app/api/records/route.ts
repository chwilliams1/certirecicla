import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCo2 } from "@/lib/co2-calculator";
import { recordCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const records = await prisma.recyclingRecord.findMany({
    where: { companyId: session.user.companyId },
    include: { client: { select: { name: true } } },
    orderBy: { pickupDate: "desc" },
    take: 100,
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = recordCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const co2Saved = calculateCo2(parsed.data.material, parsed.data.quantityKg);

  const record = await prisma.recyclingRecord.create({
    data: {
      clientId: parsed.data.clientId,
      companyId: session.user.companyId,
      material: parsed.data.material,
      quantityKg: parsed.data.quantityKg,
      co2Saved,
      pickupDate: new Date(parsed.data.pickupDate),
      location: parsed.data.location,
    },
  });

  return NextResponse.json(record);
}
