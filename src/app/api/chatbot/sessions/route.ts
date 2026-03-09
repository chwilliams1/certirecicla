import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInitialState, getStepMessage } from "@/lib/chatbot/wizard-engine";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { companyId: session.user.companyId, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return NextResponse.json(sessions);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const initialState = getInitialState();
  const welcomeMessage = getStepMessage(initialState);

  const chatSession = await prisma.chatSession.create({
    data: {
      companyId: session.user.companyId,
      userId: session.user.id,
      type: "certificate",
      status: "active",
      context: JSON.stringify(initialState),
      messages: {
        create: {
          role: "assistant",
          content: welcomeMessage,
          metadata: JSON.stringify({
            type: "wizard_step",
            step: "IDLE",
          }),
        },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(chatSession);
}
