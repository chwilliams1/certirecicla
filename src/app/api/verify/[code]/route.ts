import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const certificate = await prisma.certificate.findUnique({
    where: { uniqueCode: params.code },
    include: {
      client: {
        select: {
          name: true,
          rut: true,
          parentClient: { select: { name: true } },
        },
      },
      company: {
        select: {
          name: true,
          rut: true,
          address: true,
          logo: true,
          sanitaryResolution: true,
          plantAddress: true,
        },
      },
    },
  });

  if (!certificate || certificate.status === "draft") {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
  }

  // Fetch pickups for the period
  const pickupRecords = await prisma.recyclingRecord.findMany({
    where: {
      clientId: certificate.clientId,
      companyId: certificate.companyId,
      pickupDate: {
        gte: certificate.periodStart,
        lte: certificate.periodEnd,
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  const pickupMap = new Map<
    string,
    { date: string; location: string; materials: string[]; kg: number }
  >();
  for (const r of pickupRecords) {
    const key = `${r.pickupDate.toISOString().slice(0, 10)}_${r.location || ""}`;
    const existing = pickupMap.get(key);
    if (existing) {
      existing.materials.push(r.material);
      existing.kg += r.quantityKg;
    } else {
      pickupMap.set(key, {
        date: r.pickupDate.toISOString(),
        location: r.location || "",
        materials: [r.material],
        kg: r.quantityKg,
      });
    }
  }

  const pickups = Array.from(pickupMap.values()).map((p) => ({
    date: p.date,
    location: p.location,
    materials: Array.from(new Set(p.materials)).join(", "),
    kg: p.kg,
  }));

  let materials: Record<string, { kg: number; co2: number }> = {};
  try {
    materials = JSON.parse(certificate.materials);
  } catch {
    /* empty */
  }

  return NextResponse.json({
    uniqueCode: certificate.uniqueCode,
    status: certificate.status,
    clientName: certificate.client.parentClient
      ? `${certificate.client.parentClient.name} - ${certificate.client.name}`
      : certificate.client.name,
    clientRut: certificate.client.rut,
    companyName: certificate.company.name,
    companyRut: certificate.company.rut,
    companyAddress: certificate.company.address,
    companyLogo: certificate.company.logo,
    sanitaryResolution: certificate.company.sanitaryResolution,
    plantAddress: certificate.company.plantAddress,
    totalKg: certificate.totalKg,
    totalCo2: certificate.totalCo2,
    materials,
    periodStart: certificate.periodStart.toISOString(),
    periodEnd: certificate.periodEnd.toISOString(),
    createdAt: certificate.createdAt.toISOString(),
    sentAt: certificate.sentAt?.toISOString() || null,
    pickups,
  });
}
