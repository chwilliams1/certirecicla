import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { generateReportPdfBuffer } from "@/lib/pdf/generate-report-pdf";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "reports:generate")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { clientId, periodStart, periodEnd, periodLabel } = await req.json();

  if (!clientId || !periodStart || !periodEnd) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const companyId = session.user.companyId;

  const [client, company, records] = await Promise.all([
    prisma.client.findFirst({
      where: { id: clientId, companyId },
      select: { name: true, rut: true, parentClient: { select: { name: true } } },
    }),
    prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, rut: true, address: true },
    }),
    prisma.recyclingRecord.findMany({
      where: {
        clientId,
        companyId,
        pickupDate: { gte: new Date(periodStart), lte: new Date(periodEnd) },
      },
      orderBy: { pickupDate: "asc" },
    }),
  ]);

  if (!client || !company) {
    return NextResponse.json({ error: "Cliente o empresa no encontrada" }, { status: 404 });
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "No hay registros en el período" }, { status: 400 });
  }

  // Aggregate data
  const materials: Record<string, { kg: number; co2: number }> = {};
  const monthlyMap: Record<string, { kg: number; co2: number }> = {};
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
  }

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const clientName = client.parentClient
    ? `${client.parentClient.name} (${client.name})`
    : client.name;

  // Count unique pickups (by date+location)
  const pickupSet = new Set(
    records.map((r) => `${r.pickupDate.toISOString().slice(0, 10)}|${r.location}`)
  );

  const pdfBuffer = await generateReportPdfBuffer({
    companyName: company.name,
    companyRut: company.rut || "",
    companyAddress: company.address || "",
    clientName,
    clientRut: client.rut || "",
    periodStart,
    periodEnd,
    periodLabel: periodLabel || "Reporte",
    totalKg,
    totalCo2,
    totalPickups: pickupSet.size,
    materials,
    monthlyData,
    generatedAt: new Date().toISOString(),
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-${clientName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    },
  });
}
