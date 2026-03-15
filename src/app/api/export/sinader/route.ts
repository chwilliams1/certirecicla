import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { checkFeatureAccess, getPlanConfig } from "@/lib/plans";
import { generateSinaderExport, type SinaderTipo } from "@/lib/sinader-export";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "export:sinader")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true },
  });
  if (!checkFeatureAccess(company?.plan || "trial", "sinaderExport")) {
    const requiredPlan = getPlanConfig("business");
    return NextResponse.json(
      { error: `Esta función requiere el plan ${requiredPlan.displayName}. Actualiza tu plan para acceder.` },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const periodo = searchParams.get("periodo");
  const tipo = searchParams.get("tipo") as SinaderTipo | null;

  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json(
      { error: "Parámetro 'periodo' requerido en formato YYYY-MM" },
      { status: 400 }
    );
  }

  if (!tipo || !["mensual", "anual"].includes(tipo)) {
    return NextResponse.json(
      { error: "Parámetro 'tipo' requerido: 'mensual' o 'anual'" },
      { status: 400 }
    );
  }

  const result = await generateSinaderExport(session.user.companyId, { periodo, tipo });

  if (result.rowCount === 0 && result.manualCount === 0) {
    return NextResponse.json(
      { error: "No hay registros de reciclaje en el período seleccionado" },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "X-Sinader-Rows": String(result.rowCount),
      "X-Sinader-Manual": String(result.manualCount),
    },
  });
}
