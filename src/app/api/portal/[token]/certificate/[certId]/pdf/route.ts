import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf/generate-certificate-pdf";
import { checkFeatureAccess } from "@/lib/plans";
import { derivePalette, DEFAULT_PALETTE } from "@/lib/pdf/branding-colors";
import { DEFAULT_BRANDING, type BrandingConfig } from "@/lib/pdf/branding-config";
import { groupRecordsIntoPickups, formatPickupsForPdf } from "@/lib/pickup-grouping";

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

  // Allow access to certificates from this client and its branches
  const branchIds = await prisma.client.findMany({
    where: { parentClientId: portalToken.clientId, companyId: portalToken.companyId, active: true },
    select: { id: true },
  });
  const allowedClientIds = [portalToken.clientId, ...branchIds.map((b) => b.id)];

  const certificate = await prisma.certificate.findFirst({
    where: {
      id: params.certId,
      clientId: { in: allowedClientIds },
      companyId: portalToken.companyId,
      status: { in: ["published", "sent"] },
    },
    include: {
      client: {
        select: {
          name: true,
          rut: true,
          parentClient: { select: { name: true } },
        },
      },
      company: {
        select: {
          name: true, rut: true, address: true,
          logo: true, sanitaryResolution: true, plantAddress: true,
          plan: true, signatureUrl: true,
          brandPrimaryColor: true, brandHidePlatform: true,
          brandSignatureUrl: true, brandSecondaryLogoUrl: true,
          brandClosingText: true, brandFont: true,
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
  }

  // Fetch pickups for the period (use certificate's actual clientId)
  const pickupRecords = await prisma.recyclingRecord.findMany({
    where: {
      clientId: certificate.clientId,
      companyId: portalToken.companyId,
      pickupDate: {
        gte: certificate.periodStart,
        lte: certificate.periodEnd,
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  const grouped = groupRecordsIntoPickups(pickupRecords);
  const pickups = formatPickupsForPdf(grouped);

  // Build branding config
  // Signature: brandSignatureUrl (Business) overrides signatureUrl (all plans)
  const signatureUrl = certificate.company.brandSignatureUrl || certificate.company.signatureUrl || undefined;
  const canBrand = checkFeatureAccess(certificate.company.plan, "customBranding");
  const branding: BrandingConfig = canBrand ? {
    palette: certificate.company.brandPrimaryColor
      ? derivePalette(certificate.company.brandPrimaryColor)
      : DEFAULT_PALETTE,
    fontFamily: (certificate.company.brandFont as BrandingConfig["fontFamily"]) || "Helvetica",
    hidePlatformBranding: certificate.company.brandHidePlatform,
    signatureImageUrl: signatureUrl,
    secondaryLogoUrl: certificate.company.brandSecondaryLogoUrl || undefined,
    closingText: certificate.company.brandClosingText || undefined,
  } : {
    ...DEFAULT_BRANDING,
    signatureImageUrl: signatureUrl,
  };

  const pdfBuffer = await generateCertificatePDF({
    uniqueCode: certificate.uniqueCode,
    clientName: certificate.client.parentClient
      ? `${certificate.client.parentClient.name} - ${certificate.client.name}`
      : certificate.client.name,
    clientRut: certificate.client.rut || "",
    companyName: certificate.company.name,
    companyRut: certificate.company.rut || "",
    companyAddress: certificate.company.address || "",
    companyLogo: certificate.company.logo || undefined,
    sanitaryResolution: certificate.company.sanitaryResolution || undefined,
    plantAddress: certificate.company.plantAddress || undefined,
    totalKg: certificate.totalKg,
    totalCo2: certificate.totalCo2,
    materials: JSON.parse(certificate.materials),
    periodStart: certificate.periodStart.toISOString(),
    periodEnd: certificate.periodEnd.toISOString(),
    createdAt: certificate.createdAt.toISOString(),
    status: certificate.status,
    pickups,
  }, branding);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.uniqueCode}.pdf"`,
    },
  });
}
