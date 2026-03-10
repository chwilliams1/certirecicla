import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, email, password, phone } = body;

  if (!name || !email || !password || !phone) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 }
    );
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` },
      { status: 400 }
    );
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "La contraseña debe incluir mayúsculas, minúsculas y números" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Generic message to prevent email enumeration
    return NextResponse.json(
      { error: "No se pudo crear la cuenta. Verifica los datos e intenta nuevamente." },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 12);

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const company = await prisma.company.create({
    data: {
      name: `Empresa de ${name}`,
      email,
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
