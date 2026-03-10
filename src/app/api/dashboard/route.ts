import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { formatClientName } from "@/lib/format-client-name";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "dashboard:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const companyId = session.user.companyId;

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  const now = new Date();
  const prevYearStart = new Date(`${currentYear - 1}-01-01T00:00:00.000Z`);
  const prevYearSameDate = new Date(now);
  prevYearSameDate.setFullYear(currentYear - 1);

  // Parallelize independent DB queries
  const [records, allClients, certificatesCount, prevYearAgg] = await Promise.all([
    prisma.recyclingRecord.findMany({
      where: { companyId, pickupDate: { gte: yearStart, lte: yearEnd } },
      include: { client: { select: { name: true, parentClient: { select: { name: true } } } } },
      orderBy: { pickupDate: "desc" },
    }),
    prisma.client.findMany({
      where: { companyId, active: true },
      select: { id: true, parentClientId: true },
    }),
    prisma.certificate.count({ where: { companyId, createdAt: { gte: yearStart, lte: yearEnd } } }),
    prisma.recyclingRecord.aggregate({
      where: { companyId, pickupDate: { gte: prevYearStart, lte: prevYearSameDate } },
      _sum: { quantityKg: true },
    }),
  ]);

  const totalCo2 = records.reduce((sum, r) => sum + r.co2Saved, 0);
  const totalKg = records.reduce((sum, r) => sum + r.quantityKg, 0);
  // Count only leaf clients (branches or standalone) — exclude parent empresas that are just containers
  const parentIds = new Set(allClients.filter((c) => c.parentClientId).map((c) => c.parentClientId!));
  const activeClients = allClients.filter((c) => !parentIds.has(c.id)).length;
  const prevYearKg = prevYearAgg._sum.quantityKg || 0;

  const materialDist: Record<string, number> = {};
  const clientKgMap: Record<string, { name: string; kg: number }> = {};

  records.forEach((r) => {
    materialDist[r.material] = (materialDist[r.material] || 0) + r.quantityKg;
    if (!clientKgMap[r.clientId]) {
      clientKgMap[r.clientId] = { name: formatClientName(r.client.name, r.client.parentClient?.name), kg: 0 };
    }
    clientKgMap[r.clientId].kg += r.quantityKg;
  });

  // Last 12 months chart: fetch records spanning 12 months back from today
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const chartRecords = await prisma.recyclingRecord.findMany({
    where: { companyId, pickupDate: { gte: twelveMonthsAgo } },
    select: { pickupDate: true, co2Saved: true, quantityKg: true, material: true },
  });

  // Initialize all 12 months with 0
  const monthlyData: Record<string, number> = {};
  const monthlyMaterialData: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (11 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  chartRecords.forEach((r) => {
    const month = r.pickupDate.toISOString().slice(0, 7);
    if (month in monthlyData) {
      monthlyData[month] = (monthlyData[month] || 0) + r.co2Saved;
    }

    if (!monthlyMaterialData[month]) monthlyMaterialData[month] = {};
    monthlyMaterialData[month][r.material] = (monthlyMaterialData[month][r.material] || 0) + r.quantityKg;
  });

  // Group records into pickups (by client + date + location)
  const pickupMap = new Map<string, {
    key: string;
    clientName: string;
    date: string;
    location: string | null;
    materials: Array<{ material: string; quantityKg: number; co2Saved: number }>;
    totalKg: number;
    totalCo2: number;
  }>();

  for (const r of records) {
    const dateStr = r.pickupDate.toISOString().slice(0, 10);
    const key = `${r.clientId}|${dateStr}|${r.location || ""}`;

    if (!pickupMap.has(key)) {
      pickupMap.set(key, {
        key,
        clientName: formatClientName(r.client.name, r.client.parentClient?.name),
        date: dateStr,
        location: r.location,
        materials: [],
        totalKg: 0,
        totalCo2: 0,
      });
    }

    const pickup = pickupMap.get(key)!;
    pickup.materials.push({
      material: r.material,
      quantityKg: r.quantityKg,
      co2Saved: r.co2Saved,
    });
    pickup.totalKg += r.quantityKg;
    pickup.totalCo2 += r.co2Saved;
  }

  const recentPickups = Array.from(pickupMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return NextResponse.json({
    kpis: {
      totalCo2: totalCo2 / 1000,
      totalKg,
      activeClients,
      certificatesCount,
      totalPickups: pickupMap.size,
      prevYearKg,
    },
    monthlyco2: Object.entries(monthlyData)
      .map(([month, co2]) => ({ month, co2: Math.round(co2) }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    materialDistribution: Object.entries(materialDist).map(([name, value]) => ({
      name,
      value: Math.round(value),
    })),
    monthlyMaterials: Object.entries(monthlyMaterialData)
      .map(([month, materials]) => ({ month, ...materials }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    recentPickups,
    kgPerClient: Object.values(clientKgMap)
      .map((c) => ({ name: c.name, kg: Math.round(c.kg) }))
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 10),
  });
}
