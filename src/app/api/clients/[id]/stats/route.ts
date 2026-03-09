import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const records = await prisma.recyclingRecord.findMany({
    where: { clientId: params.id, companyId: session.user.companyId },
    orderBy: { pickupDate: "desc" },
  });

  const totalKg = records.reduce((sum, r) => sum + r.quantityKg, 0);
  const totalCo2 = records.reduce((sum, r) => sum + r.co2Saved, 0);

  const materialBreakdown: Record<string, { kg: number; co2: number }> = {};
  const monthlyTrend: Record<string, number> = {};

  records.forEach((r) => {
    if (!materialBreakdown[r.material]) {
      materialBreakdown[r.material] = { kg: 0, co2: 0 };
    }
    materialBreakdown[r.material].kg += r.quantityKg;
    materialBreakdown[r.material].co2 += r.co2Saved;

    const month = r.pickupDate.toISOString().slice(0, 7);
    monthlyTrend[month] = (monthlyTrend[month] || 0) + r.co2Saved;
  });

  return NextResponse.json({
    totalKg,
    totalCo2,
    recordsCount: records.length,
    materialBreakdown,
    monthlyTrend: Object.entries(monthlyTrend)
      .map(([month, co2]) => ({ month, co2: Math.round(co2) }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  });
}
