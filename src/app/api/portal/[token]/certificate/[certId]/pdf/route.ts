import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf/generate-certificate-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string; certId: string } }
) {
  const portalToken = await prisma.clientPortalToken.findUnique({
    where: { token: params.token },
  });

  if (!portalToken || !portalToken.active) {
    return NextResponse.json({ error: "Enlace invalido" }, { status: 404 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      id: params.certId,
      clientId: portalToken.clientId,
      companyId: portalToken.companyId,
      status: { in: ["published", "sent"] },
    },
    include: {
      client: { select: { name: true, rut: true } },
      company: { select: { name: true, rut: true, address: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
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
    materials: JSON.parse(certificate.materials),
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
