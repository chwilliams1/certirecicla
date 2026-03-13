import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { checkFeatureAccess, getPlanConfig } from "@/lib/plans";

const LER_CODES: Record<string, string> = {
  "Plástico PET": "200139",
  "Plástico HDPE": "200139",
  "Plástico LDPE": "200139",
  "Plástico PP": "200139",
  "Plástico PS": "200139",
  "Cartón": "200101",
  "Papel": "200101",
  "Vidrio": "200102",
  "Aluminio": "200140",
  "Acero": "200140",
  "Madera": "200138",
  "Electrónicos": "200136",
  "RAE": "200136",
  "TetraPak": "150105",
  "Textil": "200111",
  "Aceite vegetal": "200125",
  "Orgánico": "200108",
  "Neumáticos": "160103",
  "Baterías": "200134",
  "Escombros": "170107",
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "export:sinader")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Gate: SINADER export requiere plan Business
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true },
  });
  if (!checkFeatureAccess(company?.plan || "trial", "sinaderExport")) {
    const requiredPlan = getPlanConfig("business");
    return NextResponse.json(
      { error: `Esta funcion requiere el plan ${requiredPlan.displayName}. Actualiza tu plan para acceder.` },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;
  const clientId = searchParams.get("clientId");

  const companyId = session.user.companyId;

  // Build date range
  let dateStart: Date, dateEnd: Date;
  if (month) {
    dateStart = new Date(year, month - 1, 1);
    dateEnd = new Date(year, month, 0, 23, 59, 59);
  } else {
    dateStart = new Date(year, 0, 1);
    dateEnd = new Date(year, 11, 31, 23, 59, 59);
  }

  const where: Record<string, unknown> = {
    companyId,
    pickupDate: { gte: dateStart, lte: dateEnd },
  };
  if (clientId) where.clientId = clientId;

  const records = await prisma.recyclingRecord.findMany({
    where,
    include: {
      client: { select: { name: true, rut: true, parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true } },
    },
    orderBy: { pickupDate: "asc" },
  });

  // Build CSV
  const headers = [
    "Fecha",
    "RUT Generador",
    "Nombre Generador",
    "Tipo Residuo",
    "Cantidad (kg)",
    "Unidad",
    "Código LER",
    "Tratamiento",
    "RUT Gestor",
    "Nombre Gestor",
    "CO2 Evitado (kg)",
    "Observaciones",
  ];

  const rows = records.map((r) => [
    r.pickupDate.toISOString().slice(0, 10),
    r.client.rut || "",
    r.client.parentClient ? `${r.client.parentClient.name} - ${r.client.name}` : r.client.name,
    r.material,
    r.quantityKg.toString(),
    "kg",
    LER_CODES[r.material] || "",
    "Reciclaje",
    r.company.rut || "",
    r.company.name,
    r.co2Saved.toFixed(2),
    r.location || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => {
      const safe = /^[=+\-@|\t\r]/.test(cell) ? `'${cell}` : cell;
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(",")),
  ].join("\n");

  const filename = month
    ? `sinader_${year}_${String(month).padStart(2, "0")}.csv`
    : `sinader_${year}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
