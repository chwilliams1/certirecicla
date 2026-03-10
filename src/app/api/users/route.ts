import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { hasPermission } from "@/lib/roles";
import { checkUserLimit } from "@/lib/plans";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { teamInvitationEmail } from "@/lib/email/templates";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:view")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Check user limit based on plan
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { plan: true },
  });
  const currentUserCount = await prisma.user.count({
    where: { companyId: session.user.companyId },
  });
  const userLimitCheck = checkUserLimit(currentUserCount, company?.plan || "trial");
  if (!userLimitCheck.allowed) {
    return NextResponse.json({ error: userLimitCheck.reason }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Nombre, email, contraseña y rol son requeridos" }, { status: 400 });
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const validRoles = ["admin", "operator", "viewer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "operator",
      companyId: session.user.companyId,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Send team invitation email (fire-and-forget)
  try {
    const loginUrl = `${process.env.NEXTAUTH_URL}/login`;
    const emailData = teamInvitationEmail({
      inviterName: session.user.name,
      companyName: session.user.companyName,
      tempPassword: password,
      loginUrl,
    });
    sendTransactionalEmail({ to: email, subject: emailData.subject, html: emailData.html });
  } catch { /* fire-and-forget */ }

  return NextResponse.json(user);
}
