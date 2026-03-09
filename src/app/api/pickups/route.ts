import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "pickups:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const companyId = session.user.companyId;

  // Fetch all records with client info
  const records = await prisma.recyclingRecord.findMany({
    where: { companyId },
    include: { client: { select: { id: true, name: true, parentClient: { select: { name: true } } } } },
    orderBy: { pickupDate: "desc" },
  });

  // Fetch all certificates for status lookup
  const certificates = await prisma.certificate.findMany({
    where: { companyId },
    select: {
      id: true,
      clientId: true,
      periodStart: true,
      periodEnd: true,
      status: true,
    },
  });

  // Group records into pickups by clientId + date + location
  const pickupMap = new Map<
    string,
    {
      key: string;
      clientId: string;
      clientName: string;
      parentClientName: string | null;
      date: string;
      location: string | null;
      materials: Array<{ material: string; quantityKg: number; co2Saved: number }>;
      totalKg: number;
      totalCo2: number;
    }
  >();

  for (const r of records) {
    const dateStr = r.pickupDate.toISOString().slice(0, 10);
    const key = `${r.clientId}|${dateStr}|${r.location || ""}`;

    if (!pickupMap.has(key)) {
      pickupMap.set(key, {
        key,
        clientId: r.clientId,
        clientName: r.client.name,
        parentClientName: r.client.parentClient?.name || null,
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

  // Determine certificate status for each pickup
  const pickups = Array.from(pickupMap.values()).map((pickup) => {
    const pickupDate = new Date(pickup.date);

    // Find best matching certificate for this client covering this date
    const statusRank: Record<string, number> = { none: 0, draft: 1, published: 2, sent: 3 };
    let certStatus = "none";
    let certId: string | null = null;
    for (const cert of certificates) {
      if (cert.clientId !== pickup.clientId) continue;
      if (pickupDate >= cert.periodStart && pickupDate <= cert.periodEnd) {
        if ((statusRank[cert.status] || 0) > (statusRank[certStatus] || 0)) {
          certStatus = cert.status;
          certId = cert.id;
        }
      }
    }

    return { ...pickup, certStatus, certId };
  });

  // Already sorted by date desc from the original query order
  return NextResponse.json(pickups);
}
