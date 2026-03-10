import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/crypto-tokens";
import { rateLimit } from "@/lib/rate-limit";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { verificationEmail } from "@/lib/email/templates";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limit: 3 per hour per user
  const rl = rateLimit(`resend-verification:${session.user.email}`, { limit: 3, windowSeconds: 3600 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente más tarde." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email ya verificado" }, { status: 400 });
  }

  const token = generateSecureToken();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: token,
      verificationTokenExpiry: expiry,
    },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  const email = verificationEmail({ userName: user.name, verificationUrl: verifyUrl });
  await sendTransactionalEmail({ to: user.email, subject: email.subject, html: email.html });

  return NextResponse.json({ message: "Correo de verificación enviado" });
}
