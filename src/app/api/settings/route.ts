import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { checkFeatureAccess } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "settings:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { co2Factors: true },
  });

  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "settings:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { name, rut, address, phone, email, autoSendOnPublish, co2Factors, ecoEquivalencies, reminderDaysThreshold, sanitaryResolution, plantAddress,
    brandPrimaryColor, brandHidePlatform, brandClosingText, brandFont } = body;

  if (reminderDaysThreshold !== undefined && (Number(reminderDaysThreshold) < 1 || Number(reminderDaysThreshold) > 365)) {
    return NextResponse.json({ error: "El umbral debe ser entre 1 y 365 días" }, { status: 400 });
  }

  // Check if branding fields should be applied
  const currentCompany = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true },
  });
  const canBrand = currentCompany ? checkFeatureAccess(currentCompany.plan, "customBranding") : false;

  // Validate branding fields
  const brandingData: Record<string, unknown> = {};
  if (canBrand) {
    if (brandPrimaryColor !== undefined) {
      if (brandPrimaryColor && !/^#[0-9a-fA-F]{6}$/.test(brandPrimaryColor)) {
        return NextResponse.json({ error: "Color primario inválido" }, { status: 400 });
      }
      brandingData.brandPrimaryColor = brandPrimaryColor || null;
    }
    if (brandHidePlatform !== undefined) {
      brandingData.brandHidePlatform = Boolean(brandHidePlatform);
    }
    if (brandClosingText !== undefined) {
      if (brandClosingText && brandClosingText.length > 500) {
        return NextResponse.json({ error: "Texto de cierre máximo 500 caracteres" }, { status: 400 });
      }
      brandingData.brandClosingText = brandClosingText || null;
    }
    if (brandFont !== undefined) {
      const validFonts = ["Helvetica", "Times-Roman", "Courier"];
      if (brandFont && !validFonts.includes(brandFont)) {
        return NextResponse.json({ error: "Tipografía no válida" }, { status: 400 });
      }
      brandingData.brandFont = brandFont || null;
    }
  }

  const company = await prisma.company.update({
    where: { id: session.user.companyId },
    data: {
      ...(name && { name }),
      ...(rut !== undefined && { rut }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(autoSendOnPublish !== undefined && { autoSendOnPublish }),
      ...(reminderDaysThreshold !== undefined && { reminderDaysThreshold: Number(reminderDaysThreshold) }),
      ...(sanitaryResolution !== undefined && { sanitaryResolution }),
      ...(plantAddress !== undefined && { plantAddress }),
      ...(ecoEquivalencies !== undefined && { ecoEquivalencies: ecoEquivalencies ? JSON.stringify(ecoEquivalencies) : null }),
      ...brandingData,
    },
  });

  if (co2Factors && Array.isArray(co2Factors)) {
    for (const f of co2Factors) {
      await prisma.co2Factor.upsert({
        where: {
          companyId_material: {
            companyId: session.user.companyId,
            material: f.material,
          },
        },
        update: { factor: f.factor },
        create: {
          material: f.material,
          factor: f.factor,
          companyId: session.user.companyId,
        },
      });
    }
  }

  const updated = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: { co2Factors: true },
  });

  return NextResponse.json(updated);
}
