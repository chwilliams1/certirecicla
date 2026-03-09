import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
    // Check parent client
    const lastPickup = client.records[0]?.pickupDate;
    if (!lastPickup || lastPickup < cutoffDate) {
      const daysSince = lastPickup
        ? Math.floor((Date.now() - lastPickup.getTime()) / (1000 * 60 * 60 * 24))
        : -1;
      inactiveClients.push({
        id: client.id,
        name: client.name,
        lastPickup: lastPickup?.toISOString() || null,
        daysSince,
      });
    }

    // Check branches
    for (const branch of client.branches) {
      const branchLastPickup = branch.records[0]?.pickupDate;
      if (!branchLastPickup || branchLastPickup < cutoffDate) {
        const daysSince = branchLastPickup
          ? Math.floor((Date.now() - branchLastPickup.getTime()) / (1000 * 60 * 60 * 24))
          : -1;
        inactiveClients.push({
          id: branch.id,
          name: `${client.name} › ${branch.name}`,
          lastPickup: branchLastPickup?.toISOString() || null,
          daysSince,
        });
      }
    }
  }

  // Sort by most inactive first
  inactiveClients.sort((a, b) => b.daysSince - a.daysSince);

  // Get draft certificates pending action
  const pendingCertificates = await prisma.certificate.count({
    where: { companyId, status: "draft" },
  });

  // Saved notifications from DB
  const savedNotifications = await prisma.notification.findMany({
    where: { companyId, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    inactiveClients,
    pendingCertificates,
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

  const { ids } = await req.json();
  if (ids && Array.isArray(ids)) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, companyId: session.user.companyId },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
