import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import {
  calculateEquivalencies,
  calculateWaterSaved,
} from "@/lib/co2-calculator";
import { formatClientName } from "@/lib/format-client-name";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "reports:generate")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId"); // null or "all" = consolidated
  const periodStart = searchParams.get("periodStart");
  const periodEnd = searchParams.get("periodEnd");

  if (!periodStart || !periodEnd) {
    return NextResponse.json(
      { error: "Faltan periodStart y periodEnd" },
      { status: 400 }
    );
  }

  const companyId = session.user.companyId;
  const isConsolidated = !clientId || clientId === "all";

  const where: Record<string, unknown> = {
    companyId,
    pickupDate: {
      gte: new Date(periodStart),
      lte: new Date(periodEnd),
    },
  };
  if (!isConsolidated) {
    where.clientId = clientId;
  }

  // Fetch records with client info for ranking/branches
  const records = await prisma.recyclingRecord.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          parentClientId: true,
          parentClient: { select: { name: true } },
        },
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  if (records.length === 0) {
    return NextResponse.json(
      { error: "No hay registros en el periodo" },
      { status: 404 }
    );
  }

  // --- Aggregate ---
  const materials: Record<string, { kg: number; co2: number }> = {};
  const monthlyMap: Record<string, { kg: number; co2: number }> = {};
  const clientMap: Record<
    string,
    { name: string; kg: number; co2: number }
  > = {};
  const branchMap: Record<
    string,
    { name: string; kg: number; co2: number }
  > = {};
  let totalKg = 0;
  let totalCo2 = 0;
  const pickupSet = new Set<string>();

  // Detect if selected client has branches
  let selectedClientHasBranches = false;
  if (!isConsolidated) {
    // Check if the client is a parent with branches among records
    const branchIds = new Set(
      records
        .filter((r) => r.client.parentClientId === clientId)
        .map((r) => r.clientId)
    );
    // Also check if the clientId itself is a parent
    if (branchIds.size > 0) {
      selectedClientHasBranches = true;
    } else {
      // Check DB for branches
      const branchCount = await prisma.client.count({
        where: { parentClientId: clientId, companyId },
      });
      if (branchCount > 0) selectedClientHasBranches = true;
    }
  }

  // If viewing a parent client, also include branch records
  let effectiveRecords = records;
  if (!isConsolidated && selectedClientHasBranches) {
    const branchIds = await prisma.client.findMany({
      where: { parentClientId: clientId, companyId },
      select: { id: true },
    });
    const allIds = [clientId!, ...branchIds.map((b) => b.id)];

    // Re-fetch including branches
    effectiveRecords = await prisma.recyclingRecord.findMany({
      where: {
        companyId,
        clientId: { in: allIds },
        pickupDate: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            parentClientId: true,
            parentClient: { select: { name: true } },
          },
        },
      },
      orderBy: { pickupDate: "asc" },
    });
  }

  for (const r of effectiveRecords) {
    // Materials
    if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
    materials[r.material].kg += r.quantityKg;
    materials[r.material].co2 += r.co2Saved;

    // Monthly trend
    const month = r.pickupDate.toISOString().slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { kg: 0, co2: 0 };
    monthlyMap[month].kg += r.quantityKg;
    monthlyMap[month].co2 += r.co2Saved;

    // Totals
    totalKg += r.quantityKg;
    totalCo2 += r.co2Saved;
    pickupSet.add(
      `${r.pickupDate.toISOString().slice(0, 10)}|${r.location || ""}`
    );

    // Client ranking (for consolidated view)
    if (isConsolidated) {
      const cName = formatClientName(
        r.client.name,
        r.client.parentClient?.name
      );
      if (!clientMap[r.clientId]) {
        clientMap[r.clientId] = { name: cName, kg: 0, co2: 0 };
      }
      clientMap[r.clientId].kg += r.quantityKg;
      clientMap[r.clientId].co2 += r.co2Saved;
    }

    // Branch breakdown
    if (selectedClientHasBranches && r.client.parentClientId === clientId) {
      if (!branchMap[r.clientId]) {
        branchMap[r.clientId] = { name: r.client.name, kg: 0, co2: 0 };
      }
      branchMap[r.clientId].kg += r.quantityKg;
      branchMap[r.clientId].co2 += r.co2Saved;
    } else if (
      selectedClientHasBranches &&
      r.clientId === clientId
    ) {
      // Records directly on parent
      if (!branchMap[r.clientId]) {
        branchMap[r.clientId] = { name: "Sede principal", kg: 0, co2: 0 };
      }
      branchMap[r.clientId].kg += r.quantityKg;
      branchMap[r.clientId].co2 += r.co2Saved;
    }
  }

  const totalPickups = pickupSet.size;
  const waterSaved = calculateWaterSaved(
    Object.entries(materials).map(([material, v]) => ({
      material,
      kg: v.kg,
    }))
  );
  const equivalencies = calculateEquivalencies(totalCo2);

  const materialsList = Object.entries(materials)
    .map(([material, v]) => ({
      material,
      kg: Math.round(v.kg * 10) / 10,
      co2: Math.round(v.co2 * 10) / 10,
      percentage: totalKg > 0 ? Math.round((v.kg / totalKg) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.kg - a.kg);

  const monthlyTrend = Object.entries(monthlyMap)
    .map(([month, v]) => ({
      month,
      kg: Math.round(v.kg * 10) / 10,
      co2: Math.round(v.co2 * 10) / 10,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // --- Phase 2: Ranking ---
  let ranking: {
    clientId: string;
    clientName: string;
    kg: number;
    co2: number;
    percentage: number;
  }[] | undefined;

  if (isConsolidated) {
    ranking = Object.entries(clientMap)
      .map(([id, v]) => ({
        clientId: id,
        clientName: v.name,
        kg: Math.round(v.kg * 10) / 10,
        co2: Math.round(v.co2 * 10) / 10,
        percentage:
          totalKg > 0 ? Math.round((v.kg / totalKg) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.kg - a.kg);
  }

  // --- Phase 3: Period comparison ---
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1); // day before current start
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  const prevWhere: Record<string, unknown> = {
    companyId,
    pickupDate: { gte: prevStart, lte: prevEnd },
  };
  if (!isConsolidated) {
    // Include branches if applicable
    if (selectedClientHasBranches) {
      const branchIds = await prisma.client.findMany({
        where: { parentClientId: clientId!, companyId },
        select: { id: true },
      });
      prevWhere.clientId = { in: [clientId!, ...branchIds.map((b) => b.id)] };
    } else {
      prevWhere.clientId = clientId;
    }
  }

  const prevRecords = await prisma.recyclingRecord.findMany({
    where: prevWhere,
    select: { quantityKg: true, co2Saved: true, pickupDate: true, location: true, material: true },
  });

  let comparison: {
    prevTotalKg: number;
    prevTotalCo2: number;
    prevTotalPickups: number;
    prevWaterSaved: number;
    kgChange: number | null;
    co2Change: number | null;
    pickupsChange: number | null;
    waterChange: number | null;
    prevMonthlyTrend: { month: string; kg: number; co2: number }[];
  } | undefined;

  if (prevRecords.length > 0) {
    let prevKg = 0;
    let prevCo2 = 0;
    const prevPickupSet = new Set<string>();
    const prevMaterials: { material: string; kg: number }[] = [];
    const prevMonthlyMap: Record<string, { kg: number; co2: number }> = {};

    for (const r of prevRecords) {
      prevKg += r.quantityKg;
      prevCo2 += r.co2Saved;
      prevPickupSet.add(
        `${r.pickupDate.toISOString().slice(0, 10)}|${r.location || ""}`
      );
      prevMaterials.push({ material: r.material, kg: r.quantityKg });

      const month = r.pickupDate.toISOString().slice(0, 7);
      if (!prevMonthlyMap[month]) prevMonthlyMap[month] = { kg: 0, co2: 0 };
      prevMonthlyMap[month].kg += r.quantityKg;
      prevMonthlyMap[month].co2 += r.co2Saved;
    }

    const prevPickups = prevPickupSet.size;
    const prevWater = calculateWaterSaved(prevMaterials);

    const pctChange = (curr: number, prev: number) =>
      prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : null;

    comparison = {
      prevTotalKg: Math.round(prevKg * 10) / 10,
      prevTotalCo2: Math.round(prevCo2 * 10) / 10,
      prevTotalPickups: prevPickups,
      prevWaterSaved: prevWater,
      kgChange: pctChange(totalKg, prevKg),
      co2Change: pctChange(totalCo2, prevCo2),
      pickupsChange: pctChange(totalPickups, prevPickups),
      waterChange: pctChange(waterSaved, prevWater),
      prevMonthlyTrend: Object.entries(prevMonthlyMap)
        .map(([month, v]) => ({
          month,
          kg: Math.round(v.kg * 10) / 10,
          co2: Math.round(v.co2 * 10) / 10,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  // --- Phase 4: Branch breakdown ---
  let branches:
    | {
        branchId: string;
        branchName: string;
        kg: number;
        co2: number;
        percentage: number;
      }[]
    | undefined;

  if (selectedClientHasBranches && Object.keys(branchMap).length > 0) {
    branches = Object.entries(branchMap)
      .map(([id, v]) => ({
        branchId: id,
        branchName: v.name,
        kg: Math.round(v.kg * 10) / 10,
        co2: Math.round(v.co2 * 10) / 10,
        percentage:
          totalKg > 0 ? Math.round((v.kg / totalKg) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.kg - a.kg);
  }

  return NextResponse.json({
    isConsolidated,
    totalKg: Math.round(totalKg * 10) / 10,
    totalCo2: Math.round(totalCo2 * 10) / 10,
    totalPickups,
    waterSaved,
    equivalencies,
    materials: materialsList,
    monthlyTrend,
    ranking,
    comparison,
    branches,
  });
}
