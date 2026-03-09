import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, companyName, rut, companyEmail, phone } = body;

  if (!name || !email || !password || !companyName || !rut || !companyEmail || !phone) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con este email" },
      { status: 409 }
    );
  }

  const hashedPassword = await hash(password, 12);

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      rut,
      email: companyEmail,
      phone,
      plan: "trial",
      trialEndsAt,
      users: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: "admin",
        },
      },
    },
    include: { users: { select: { id: true } } },
  });

  return NextResponse.json(
    { message: "Cuenta creada exitosamente", companyId: company.id },
    { status: 201 }
  );
}
