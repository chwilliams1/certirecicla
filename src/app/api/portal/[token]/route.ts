import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEquivalencies, calculateWaterSaved } from "@/lib/co2-calculator";
import { checkFeatureAccess } from "@/lib/plans";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const portalToken = await prisma.clientPortalToken.findUnique({
    where: { token: params.token },
    include: {
      client: { select: { id: true, name: true, rut: true, parentClient: { select: { id: true, name: true, rut: true } } } },
      company: { select: { name: true, logo: true, ecoEquivalencies: true, plan: true } },
    },
  });

  if (!portalToken || !portalToken.active) {
    return NextResponse.json(
      { error: "Enlace invalido o expirado" },
      { status: 404 }
    );
  }

  if (portalToken.expiresAt && portalToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Enlace expirado" }, { status: 410 });
  }

  // Gate: portal de clientes requiere plan Profesional o superior
  if (!checkFeatureAccess(portalToken.company.plan, "clientPortal")) {
    return NextResponse.json(
      { error: "El portal de clientes no esta disponible en el plan actual de esta empresa." },
      { status: 403 }
    );
  }

  const clientId = portalToken.clientId;
  const companyId = portalToken.companyId;

  // Check if this client is a parent company with branches
  const branches = await prisma.client.findMany({
    where: { parentClientId: clientId, companyId, active: true },
    select: { id: true, name: true, rut: true },
  });

  // Include records from parent + all branches
  const clientIds = [clientId, ...branches.map((b) => b.id)];

  // Get all records for this client (and branches if parent)
  const records = await prisma.recyclingRecord.findMany({
    where: { clientId: { in: clientIds }, companyId },
    orderBy: { pickupDate: "desc" },
  });

  const totalKg = records.reduce((sum, r) => sum + r.quantityKg, 0);
  const totalCo2 = records.reduce((sum, r) => sum + r.co2Saved, 0);

  // Material distribution
  const materialDist: Record<string, number> = {};
  const monthlyData: Record<string, number> = {};

  records.forEach((r) => {
    materialDist[r.material] = (materialDist[r.material] || 0) + r.quantityKg;
    const month = r.pickupDate.toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + r.co2Saved;
  });

  // Get certificates (parent + branches)
  const certificates = await prisma.certificate.findMany({
    where: { clientId: { in: clientIds }, companyId, status: { in: ["published", "sent"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      uniqueCode: true,
      name: true,
      totalKg: true,
      totalCo2: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      createdAt: true,
    },
  });

  // Calculate equivalencies
  let customEq;
  if (portalToken.company.ecoEquivalencies) {
    try {
      customEq = JSON.parse(portalToken.company.ecoEquivalencies);
    } catch {
      // ignore parse errors
    }
  }
  const equivalencies = calculateEquivalencies(totalCo2, customEq);

  // Calculate water saved from material distribution
  const waterMaterials = Object.entries(materialDist).map(([material, kg]) => ({ material, kg }));
  const waterSaved = calculateWaterSaved(waterMaterials);

  // Build pickups list (grouped by date + location)
  const pickups = records.map((r) => ({
    date: r.pickupDate.toISOString(),
    material: r.material,
    kg: r.quantityKg,
    co2: r.co2Saved,
    location: r.location || null,
  }));

  return NextResponse.json({
    client: portalToken.client,
    parentClient: portalToken.client.parentClient || null,
    branches: branches.map((b) => ({ id: b.id, name: b.name, rut: b.rut })),
    company: { name: portalToken.company.name, logo: portalToken.company.logo },
    kpis: {
      totalKg,
      totalCo2: totalCo2 / 1000,
      totalPickups: records.length,
    },
    equivalencies,
    waterSaved,
    materialDistribution: Object.entries(materialDist).map(
      ([name, value]) => ({ name, value: Math.round(value) })
    ),
    monthlyCo2: Object.entries(monthlyData)
      .map(([month, co2]) => ({ month, co2: Math.round(co2) }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    certificates,
    pickups,
  });
}
