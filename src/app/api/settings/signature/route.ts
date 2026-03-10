import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "settings:edit")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido. Use PNG, JPG o WebP" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande. Máximo 2MB" }, { status: 400 });
  }

  // Delete previous signature if exists
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { signatureUrl: true },
  });

  if (company?.signatureUrl) {
    try {
      await del(company.signatureUrl);
    } catch {
      // Ignore deletion errors
    }
  }

  const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "png";

  const blob = await put(
    `signatures/${session.user.companyId}/firma-${Date.now()}.${ext}`,
    file,
    { access: "public" }
  );

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { signatureUrl: blob.url },
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

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { signatureUrl: true },
  });

  if (company?.signatureUrl) {
    try {
      await del(company.signatureUrl);
    } catch {
      // Ignore
    }
  }

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { signatureUrl: null },
  });

  return NextResponse.json({ ok: true });
}
