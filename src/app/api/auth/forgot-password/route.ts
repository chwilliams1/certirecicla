import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/crypto-tokens";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { passwordResetEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  // Rate limit: 5 per IP per 15 min
  const ip = getClientIp(req);
  const rl = rateLimit(`forgot-password:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
      { status: 429 }
    );
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return successResponse;
  }

  const token = generateSecureToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const emailData = passwordResetEmail({ userName: user.name, resetUrl });
  sendTransactionalEmail({ to: user.email, subject: emailData.subject, html: emailData.html });

  return successResponse;
}
