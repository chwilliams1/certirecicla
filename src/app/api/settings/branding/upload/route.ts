import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { checkFeatureAccess } from "@/lib/plans";
import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const VALID_FIELDS = ["signature", "secondaryLogo"] as const;
type FieldType = (typeof VALID_FIELDS)[number];

const FIELD_TO_COLUMN: Record<FieldType, "brandSignatureUrl" | "brandSecondaryLogoUrl"> = {
  signature: "brandSignatureUrl",
  secondaryLogo: "brandSecondaryLogoUrl",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "settings:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true, brandSignatureUrl: true, brandSecondaryLogoUrl: true },
  });

  if (!company || !checkFeatureAccess(company.plan, "customBranding")) {
    return NextResponse.json(
      { error: "Funcionalidad disponible solo en plan Business" },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const field = formData.get("field") as string | null;

  if (!file || !field || !VALID_FIELDS.includes(field as FieldType)) {
    return NextResponse.json({ error: "Archivo y campo requeridos" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido. Use PNG, JPG o WebP" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande. Máximo 2MB" }, { status: 400 });
  }

  const column = FIELD_TO_COLUMN[field as FieldType];
  const oldUrl = company[column];

  // Delete previous image if exists
  if (oldUrl) {
    try {
      await del(oldUrl);
    } catch {
      // Ignore deletion errors
    }
  }

  // Whitelist file extension
  const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "png";
  const blob = await put(
    `branding/${session.user.companyId}/${field}-${Date.now()}.${ext}`,
    file,
    { access: "public" }
  );

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { [column]: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "settings:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const field = searchParams.get("field");

  if (!field || !VALID_FIELDS.includes(field as FieldType)) {
    return NextResponse.json({ error: "Campo inválido" }, { status: 400 });
  }

  const column = FIELD_TO_COLUMN[field as FieldType];
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { brandSignatureUrl: true, brandSecondaryLogoUrl: true },
  });

  const currentUrl = company?.[column] ?? null;
  if (currentUrl) {
    try {
      await del(currentUrl);
    } catch {
      // Ignore
    }
  }

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { [column]: null },
  });

  return NextResponse.json({ ok: true });
}
