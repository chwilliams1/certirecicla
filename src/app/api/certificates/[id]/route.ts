import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      client: { include: { parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true, address: true, phone: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  return NextResponse.json(certificate);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { status, materials } = body as {
    status?: string;
    materials?: Record<string, { kg: number; co2: number }>;
  };

  // Fetch current certificate to check status
  const current = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!current) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  // Status change
  if (status) {
    if (!["draft", "published", "sent"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    updateData.status = status;
  }

  // Materials edit (only allowed for draft)
  if (materials) {
    if (current.status !== "draft") {
      return NextResponse.json({ error: "Solo se pueden editar certificados en borrador" }, { status: 400 });
    }

    // Recalculate totals from materials
    let totalKg = 0;
    let totalCo2 = 0;
    for (const vals of Object.values(materials)) {
      totalKg += vals.kg;
      totalCo2 += vals.co2;
    }

    updateData.materials = JSON.stringify(materials);
    updateData.totalKg = totalKg;
    updateData.totalCo2 = totalCo2;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No hay cambios" }, { status: 400 });
  }

  await prisma.certificate.update({
    where: { id: current.id },
    data: updateData,
  });

  const updated = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      client: { include: { parentClient: { select: { name: true } } } },
      company: { select: { name: true, rut: true, address: true, phone: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cert = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!cert) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  if (cert.status !== "draft") {
    return NextResponse.json({ error: "Solo se pueden eliminar certificados en borrador" }, { status: 400 });
  }

  await prisma.certificate.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
