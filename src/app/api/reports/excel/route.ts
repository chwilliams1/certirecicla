import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { calculateEquivalencies, calculateWaterSaved } from "@/lib/co2-calculator";
import { formatClientName } from "@/lib/format-client-name";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "reports:generate")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { clientId, periodStart, periodEnd, periodLabel } = await req.json();

  if (!periodStart || !periodEnd) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const companyId = session.user.companyId;
  const isConsolidated = !clientId || clientId === "all";

  const where: Record<string, unknown> = {
    companyId,
    pickupDate: { gte: new Date(periodStart), lte: new Date(periodEnd) },
  };

  // If specific client, include branches
  let allClientIds: string[] | undefined;
  if (!isConsolidated) {
    const branches = await prisma.client.findMany({
      where: { parentClientId: clientId, companyId },
      select: { id: true },
    });
    if (branches.length > 0) {
      allClientIds = [clientId, ...branches.map((b) => b.id)];
      where.clientId = { in: allClientIds };
    } else {
      where.clientId = clientId;
    }
  }

  const records = await prisma.recyclingRecord.findMany({
    where,
    include: {
      client: {
        select: {
          name: true,
          parentClient: { select: { name: true } },
        },
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  if (records.length === 0) {
    return NextResponse.json({ error: "No hay registros en el periodo" }, { status: 400 });
  }

  // Aggregate
  const materials: Record<string, { kg: number; co2: number }> = {};
  const monthlyMap: Record<string, { kg: number; co2: number }> = {};
  let totalKg = 0;
  let totalCo2 = 0;
  const pickupSet = new Set<string>();

  for (const r of records) {
    if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
    materials[r.material].kg += r.quantityKg;
    materials[r.material].co2 += r.co2Saved;
    totalKg += r.quantityKg;
    totalCo2 += r.co2Saved;
    pickupSet.add(`${r.pickupDate.toISOString().slice(0, 10)}|${r.location || ""}`);

    const month = r.pickupDate.toISOString().slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { kg: 0, co2: 0 };
    monthlyMap[month].kg += r.quantityKg;
    monthlyMap[month].co2 += r.co2Saved;
  }

  const waterSaved = calculateWaterSaved(
    Object.entries(materials).map(([material, v]) => ({ material, kg: v.kg }))
  );
  const eq = calculateEquivalencies(totalCo2);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen
  const summaryData = [
    ["Reporte de Impacto Ambiental", ""],
    ["Periodo", periodLabel || `${periodStart} a ${periodEnd}`],
    [""],
    ["KPI", "Valor"],
    ["Total Reciclado (kg)", Math.round(totalKg * 10) / 10],
    ["CO2 Evitado (kg)", Math.round(totalCo2 * 10) / 10],
    ["Retiros Realizados", pickupSet.size],
    ["Agua Ahorrada (litros)", waterSaved],
    [""],
    ["Equivalencias Ecologicas", ""],
    ["Arboles preservados", eq.trees],
    ["Km no conducidos", eq.kmNotDriven],
    ["Dias hogar energizado", eq.homesEnergized],
    ["Smartphones cargados", eq.smartphonesCharged],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(summaryData);
  wsResumen["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // Sheet 2: Detalle por Material
  const materialRows = Object.entries(materials)
    .sort((a, b) => b[1].kg - a[1].kg)
    .map(([mat, v]) => [
      mat,
      Math.round(v.kg * 10) / 10,
      Math.round(v.co2 * 10) / 10,
      totalKg > 0 ? `${((v.kg / totalKg) * 100).toFixed(1)}%` : "0%",
    ]);
  const wsMaterial = XLSX.utils.aoa_to_sheet([
    ["Material", "Cantidad (kg)", "CO2 Evitado (kg)", "% del Total"],
    ...materialRows,
  ]);
  wsMaterial["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsMaterial, "Por Material");

  // Sheet 3: Tendencia Mensual
  const { MONTH_NAMES_FULL } = await import("@/lib/constants");
  const monthlyRows = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, v]) => {
      const [y, mo] = m.split("-");
      return [
        `${MONTH_NAMES_FULL[parseInt(mo, 10) - 1]} ${y}`,
        Math.round(v.kg * 10) / 10,
        Math.round(v.co2 * 10) / 10,
      ];
    });
  const wsTrend = XLSX.utils.aoa_to_sheet([
    ["Mes", "Reciclado (kg)", "CO2 Evitado (kg)"],
    ...monthlyRows,
  ]);
  wsTrend["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsTrend, "Tendencia Mensual");

  // Sheet 4: Detalle de Retiros
  const detailRows = records.map((r) => [
    r.pickupDate.toISOString().slice(0, 10),
    formatClientName(r.client.name, r.client.parentClient?.name),
    r.material,
    r.quantityKg,
    r.co2Saved,
    r.location || "",
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([
    ["Fecha", "Cliente", "Material", "Cantidad (kg)", "CO2 Evitado (kg)", "Ubicacion"],
    ...detailRows,
  ]);
  wsDetail["!cols"] = [
    { wch: 12 }, { wch: 30 }, { wch: 20 },
    { wch: 15 }, { wch: 18 }, { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detalle Retiros");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-${(periodLabel || "impacto").replace(/\s+/g, "-")}.xlsx"`,
    },
  });
}
