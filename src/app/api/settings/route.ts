import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { co2Factors: true },
  });

  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, rut, address, phone, email, autoSendOnPublish, co2Factors, ecoEquivalencies, reminderDaysThreshold, sanitaryResolution, plantAddress } = body;

  const company = await prisma.company.update({
    where: { id: session.user.companyId },
    data: {
      ...(name && { name }),
      ...(rut !== undefined && { rut }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(autoSendOnPublish !== undefined && { autoSendOnPublish }),
      ...(reminderDaysThreshold !== undefined && { reminderDaysThreshold: Number(reminderDaysThreshold) }),
      ...(sanitaryResolution !== undefined && { sanitaryResolution }),
      ...(plantAddress !== undefined && { plantAddress }),
      ...(ecoEquivalencies !== undefined && { ecoEquivalencies: ecoEquivalencies ? JSON.stringify(ecoEquivalencies) : null }),
    },
  });

  if (co2Factors && Array.isArray(co2Factors)) {
    for (const f of co2Factors) {
      await prisma.co2Factor.upsert({
        where: {
          companyId_material: {
            companyId: session.user.companyId,
            material: f.material,
          },
        },
        update: { factor: f.factor },
        create: {
          material: f.material,
          factor: f.factor,
          companyId: session.user.companyId,
        },
      });
    }
  }

  const updated = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { co2Factors: true },
  });

  return NextResponse.json(updated);
}
