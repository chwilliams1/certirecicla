import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientUpdateSchema } from "@/lib/validations";
import { hasPermission } from "@/lib/roles";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "clients:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      records: { orderBy: { pickupDate: "desc" } },
      certificates: { orderBy: { createdAt: "desc" } },
      _count: { select: { records: true, certificates: true } },
      parentClient: { select: { id: true, name: true } },
      branches: {
        where: { active: true },
        include: {
          _count: { select: { records: true, certificates: true } },
          records: { orderBy: { pickupDate: "desc" } },
          certificates: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  // Enrich branches with aggregated stats
  const enrichedBranches = client.branches.map((branch) => {
    const totalKg = branch.records.reduce((s, r) => s + r.quantityKg, 0);
    const totalCo2 = branch.records.reduce((s, r) => s + r.co2Saved, 0);
    const materialMap: Record<string, number> = {};
    for (const r of branch.records) {
      materialMap[r.material] = (materialMap[r.material] || 0) + r.quantityKg;
    }
    const topMaterials = Object.entries(materialMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([material, kg]) => ({ material, kg }));
    const lastPickup = branch.records.length > 0
      ? branch.records.reduce((latest, r) => r.pickupDate > latest ? r.pickupDate : latest, branch.records[0].pickupDate)
      : null;
    const certsSent = branch.certificates.filter((c) => c.status === "sent").length;
    const certsPublished = branch.certificates.filter((c) => c.status === "published").length;

    // eslint-disable-next-line no-unused-vars
    const { records: _r, certificates: _c, ...branchBase } = branch;
    return {
      ...branchBase,
      totalKg,
      totalCo2,
      topMaterials,
      lastPickup,
      certsSent,
      certsPublished,
    };
  });

  // Consolidated stats (empresa + all branches)
  const branchTotalKg = enrichedBranches.reduce((s, b) => s + b.totalKg, 0);
  const branchTotalCo2 = enrichedBranches.reduce((s, b) => s + b.totalCo2, 0);
  const branchTotalRecords = enrichedBranches.reduce((s, b) => s + b._count.records, 0);
  const branchTotalCerts = enrichedBranches.reduce((s, b) => s + b._count.certificates, 0);
  const ownTotalKg = client.records.reduce((s, r) => s + r.quantityKg, 0);
  const ownTotalCo2 = client.records.reduce((s, r) => s + r.co2Saved, 0);

  const consolidated = client.branches.length > 0 ? {
    totalKg: ownTotalKg + branchTotalKg,
    totalCo2: ownTotalCo2 + branchTotalCo2,
    totalRecords: client._count.records + branchTotalRecords,
    totalCertificates: client._count.certificates + branchTotalCerts,
  } : null;

  // Merge branch records & certificates into parent for consolidated tabs
  let allRecords = client.records;
  let allCertificates = client.certificates;
  if (client.branches.length > 0) {
    for (const branch of client.branches) {
      // Add branchName to each record for display
      const branchRecords = branch.records.map((r) => ({ ...r, branchName: branch.name }));
      allRecords = [...allRecords, ...branchRecords];
      const branchCerts = branch.certificates.map((c) => ({ ...c, branchName: branch.name }));
      allCertificates = [...allCertificates, ...branchCerts];
    }
    allRecords.sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());
    allCertificates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({
    ...client,
    records: allRecords,
    certificates: allCertificates,
    branches: enrichedBranches,
    consolidated,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "clients:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = clientUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Validate parentClientId if provided
  if (parsed.data.parentClientId) {
    if (parsed.data.parentClientId === params.id) {
      return NextResponse.json({ error: "Un cliente no puede ser su propio padre" }, { status: 400 });
    }
    const parent = await prisma.client.findFirst({
      where: { id: parsed.data.parentClientId, companyId: session.user.companyId, active: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Cliente padre no encontrado" }, { status: 400 });
    }
  }

  const existing = await prisma.client.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: parsed.data,
  });

  // If this is a parent empresa (no parentClientId) and RUT was updated,
  // propagate RUT to all branches
  if (!existing.parentClientId && parsed.data.rut !== undefined) {
    await prisma.client.updateMany({
      where: { parentClientId: params.id, companyId: session.user.companyId },
      data: { rut: parsed.data.rut },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "clients:delete")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  await prisma.client.updateMany({
    where: { id: params.id, companyId: session.user.companyId },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
