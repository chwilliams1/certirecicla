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
  if (!hasPermission(session.user.role, "reports:generate")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const schedules = await prisma.scheduledReport.findMany({
    where: { companyId: session.user.companyId },
    include: { client: { select: { name: true, parentClient: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "reports:generate")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { clientId, frequency, emails } = await req.json();

  if (!frequency || !emails || emails.length === 0) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  if (!["monthly", "quarterly"].includes(frequency)) {
    return NextResponse.json(
      { error: "Frecuencia invalida" },
      { status: 400 }
    );
  }

  // Validate client belongs to company if specified
  if (clientId && clientId !== "all") {
    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId: session.user.companyId },
    });
    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }
  }

  // Calculate next send date
  const now = new Date();
  let nextSendAt: Date;
  if (frequency === "monthly") {
    nextSendAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0);
  } else {
    // Quarterly: next quarter start
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const nextQuarterMonth = (currentQuarter + 1) * 3;
    nextSendAt = new Date(now.getFullYear(), nextQuarterMonth, 1, 8, 0, 0);
    if (nextQuarterMonth >= 12) {
      nextSendAt = new Date(now.getFullYear() + 1, nextQuarterMonth - 12, 1, 8, 0, 0);
    }
  }

  const schedule = await prisma.scheduledReport.create({
    data: {
      companyId: session.user.companyId,
      clientId: clientId && clientId !== "all" ? clientId : null,
      frequency,
      emails: JSON.stringify(emails),
      nextSendAt,
      active: true,
    },
    include: { client: { select: { name: true, parentClient: { select: { name: true } } } } },
  });

  return NextResponse.json(schedule, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const schedule = await prisma.scheduledReport.findFirst({
    where: { id, companyId: session.user.companyId },
  });
  if (!schedule) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.scheduledReport.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
