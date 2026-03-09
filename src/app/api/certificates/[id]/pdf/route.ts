import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf/generate-certificate-pdf";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      client: true,
      company: {
        select: {
          name: true, rut: true, address: true, phone: true,
          logo: true, sanitaryResolution: true, plantAddress: true,
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  // Fetch pickups for the period
  const pickupRecords = await prisma.recyclingRecord.findMany({
    where: {
      clientId: certificate.clientId,
      companyId: session.user.companyId,
      pickupDate: {
        gte: certificate.periodStart,
        lte: certificate.periodEnd,
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  // Group pickups by date+location
  const pickupMap = new Map<string, { date: string; location: string; materials: string[]; kg: number }>();
  for (const r of pickupRecords) {
    const key = `${r.pickupDate.toISOString().slice(0, 10)}_${r.location || ""}`;
    const existing = pickupMap.get(key);
    if (existing) {
      existing.materials.push(r.material);
      existing.kg += r.quantityKg;
    } else {
      pickupMap.set(key, {
        date: r.pickupDate.toISOString(),
        location: r.location || "",
        materials: [r.material],
        kg: r.quantityKg,
      });
    }
  }

  const pickups = Array.from(pickupMap.values()).map((p) => ({
    date: p.date,
    location: p.location,
    materials: Array.from(new Set(p.materials)).join(", "),
    kg: p.kg,
  }));

  const pdfBuffer = await generateCertificatePDF({
    uniqueCode: certificate.uniqueCode,
    clientName: certificate.client.name,
    clientRut: certificate.client.rut || "",
    companyName: certificate.company.name,
    companyRut: certificate.company.rut || "",
    companyAddress: certificate.company.address || "",
    companyLogo: certificate.company.logo || undefined,
    sanitaryResolution: certificate.company.sanitaryResolution || undefined,
    plantAddress: certificate.company.plantAddress || undefined,
    totalKg: certificate.totalKg,
    totalCo2: certificate.totalCo2,
    materials: (() => { try { return JSON.parse(certificate.materials); } catch { return {}; } })(),
    periodStart: certificate.periodStart.toISOString(),
    periodEnd: certificate.periodEnd.toISOString(),
    createdAt: certificate.createdAt.toISOString(),
    status: certificate.status,
    pickups,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.uniqueCode}.pdf"`,
    },
  });
}
