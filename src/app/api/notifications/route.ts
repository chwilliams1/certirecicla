import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "notifications:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const companyId = session.user.companyId;

  // Get company settings for reminder threshold
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { reminderDaysThreshold: true },
  });
  const threshold = company?.reminderDaysThreshold || 30;

  // Find clients without recent pickups
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - threshold);

  const activeClients = await prisma.client.findMany({
    where: { companyId, active: true, parentClientId: null },
    select: {
      id: true,
      name: true,
      records: {
        orderBy: { pickupDate: "desc" },
        take: 1,
        select: { pickupDate: true },
      },
      branches: {
        select: {
          id: true,
          name: true,
          records: {
            orderBy: { pickupDate: "desc" },
            take: 1,
            select: { pickupDate: true },
          },
        },
      },
    },
  });

  const inactiveClients: Array<{ id: string; name: string; lastPickup: string | null; daysSince: number }> = [];

  for (const client of activeClients) {
    // Collect all pickup dates: parent's own + all branches'
    const allPickupDates: Date[] = [];
    if (client.records[0]?.pickupDate) allPickupDates.push(client.records[0].pickupDate);
    for (const branch of client.branches) {
      if (branch.records[0]?.pickupDate) allPickupDates.push(branch.records[0].pickupDate);
    }

    // Check parent client using the most recent pickup across parent + branches
    const mostRecentPickup = allPickupDates.length > 0
      ? allPickupDates.reduce((latest, d) => (d > latest ? d : latest))
      : null;

    if (!mostRecentPickup || mostRecentPickup < cutoffDate) {
      const daysSince = mostRecentPickup
        ? Math.floor((Date.now() - mostRecentPickup.getTime()) / (1000 * 60 * 60 * 24))
        : -1;
      inactiveClients.push({
        id: client.id,
        name: client.name,
        lastPickup: mostRecentPickup?.toISOString() || null,
        daysSince,
      });
    }
  }

  // Sort by most inactive first
  inactiveClients.sort((a, b) => b.daysSince - a.daysSince);

  // Get draft certificates pending action
  const pendingCertificates = await prisma.certificate.count({
    where: { companyId, status: "draft" },
  });

  // Get published certificates not yet sent
  const unsent = await prisma.certificate.findMany({
    where: { companyId, status: "published" },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const unsentCertificates = unsent.map((c) => ({
    id: c.id,
    clientName: c.client.name,
    createdAt: c.createdAt.toISOString(),
  }));

  // Saved notifications from DB
  const savedNotifications = await prisma.notification.findMany({
    where: { companyId, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    inactiveClients,
    pendingCertificates,
    unsentCertificates,
    savedNotifications,
    threshold,
  });
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "notifications:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { ids } = await req.json();
  if (ids && Array.isArray(ids)) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, companyId: session.user.companyId },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
