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
      company: { select: { name: true, rut: true, address: true, phone: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  const pdfBuffer = await generateCertificatePDF({
    uniqueCode: certificate.uniqueCode,
    clientName: certificate.client.name,
    clientRut: certificate.client.rut || "",
    companyName: certificate.company.name,
    companyRut: certificate.company.rut || "",
    companyAddress: certificate.company.address || "",
    totalKg: certificate.totalKg,
    totalCo2: certificate.totalCo2,
    materials: (() => { try { return JSON.parse(certificate.materials); } catch { return {}; } })(),
    periodStart: certificate.periodStart.toISOString(),
    periodEnd: certificate.periodEnd.toISOString(),
    createdAt: certificate.createdAt.toISOString(),
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.uniqueCode}.pdf"`,
    },
  });
}
