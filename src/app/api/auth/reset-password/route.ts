import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/crypto-tokens";

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 });
  }

  // Password validation
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json(
      { error: "La contraseña debe incluir mayúsculas, minúsculas y números" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  if (isTokenExpired(user.resetTokenExpiry)) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: "Contraseña actualizada exitosamente" });
}
