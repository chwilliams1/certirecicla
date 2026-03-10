import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { generateReportPdfBuffer } from "@/lib/pdf/generate-report-pdf";
import { formatClientName } from "@/lib/format-client-name";

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

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, rut: true, address: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  const where: Record<string, unknown> = {
    companyId,
    pickupDate: { gte: new Date(periodStart), lte: new Date(periodEnd) },
  };

  let clientName: string;
  let clientRut = "";

  if (isConsolidated) {
    clientName = "Reporte Consolidado";
  } else {
    const branches = await prisma.client.findMany({
      where: { parentClientId: clientId, companyId },
      select: { id: true },
    });
    if (branches.length > 0) {
      where.clientId = { in: [clientId, ...branches.map((b) => b.id)] };
    } else {
      where.clientId = clientId;
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId },
      select: { name: true, rut: true, parentClient: { select: { name: true } } },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    clientName = formatClientName(client.name, client.parentClient?.name);
    clientRut = client.rut || "";
  }

  const records = await prisma.recyclingRecord.findMany({
    where,
    include: isConsolidated
      ? { client: { select: { name: true, parentClient: { select: { name: true } } } } }
      : undefined,
    orderBy: { pickupDate: "asc" },
  });

  if (records.length === 0) {
    return NextResponse.json({ error: "No hay registros en el período" }, { status: 400 });
  }

  // Aggregate data
  const materials: Record<string, { kg: number; co2: number }> = {};
  const monthlyMap: Record<string, { kg: number; co2: number }> = {};
  const clientMap: Record<string, { name: string; kg: number; co2: number }> = {};
  let totalKg = 0;
  let totalCo2 = 0;

  for (const r of records) {
    if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
    materials[r.material].kg += r.quantityKg;
    materials[r.material].co2 += r.co2Saved;
    totalKg += r.quantityKg;
    totalCo2 += r.co2Saved;

    const month = r.pickupDate.toISOString().slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { kg: 0, co2: 0 };
    monthlyMap[month].kg += r.quantityKg;
    monthlyMap[month].co2 += r.co2Saved;

    if (isConsolidated && "client" in r) {
      const c = r.client as { name: string; parentClient?: { name: string } | null };
      const cName = formatClientName(c.name, c.parentClient?.name);
      if (!clientMap[r.clientId]) clientMap[r.clientId] = { name: cName, kg: 0, co2: 0 };
      clientMap[r.clientId].kg += r.quantityKg;
      clientMap[r.clientId].co2 += r.co2Saved;
    }
  }

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Count unique pickups (by date+location)
  const pickupSet = new Set(
    records.map((r) => `${r.pickupDate.toISOString().slice(0, 10)}|${r.location}`)
  );

  // Build ranking for consolidated
  let ranking: Array<{ clientName: string; kg: number; co2: number; percentage: number }> | undefined;
  if (isConsolidated) {
    ranking = Object.entries(clientMap)
      .map(([, v]) => ({
        clientName: v.name,
        kg: Math.round(v.kg * 10) / 10,
        co2: Math.round(v.co2 * 10) / 10,
        percentage: totalKg > 0 ? Math.round((v.kg / totalKg) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.kg - a.kg);
  }

  const pdfBuffer = await generateReportPdfBuffer({
    companyName: company.name,
    companyRut: company.rut || "",
    companyAddress: company.address || "",
    clientName,
    clientRut,
    periodStart,
    periodEnd,
    periodLabel: periodLabel || "Reporte",
    totalKg,
    totalCo2,
    totalPickups: pickupSet.size,
    materials,
    monthlyData,
    generatedAt: new Date().toISOString(),
    ranking,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-${clientName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    },
  });
}
