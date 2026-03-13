import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertCode } from "@/lib/generate-cert-code";
import {
  WizardState,
  WizardAction,
  applyAction,
  getStepMessage,
  getInitialState,
} from "@/lib/chatbot/wizard-engine";
import { processWithAI } from "@/lib/chatbot/ai-handler";
import { hasPermission } from "@/lib/roles";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "chatbot:use")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const rl = rateLimit(`chatbot:${session.user.id}`, { limit: 30, windowSeconds: 900 });
  if (!rl.success) {
    return NextResponse.json({ error: "Límite de mensajes alcanzado, espera unos minutos" }, { status: 429 });
  }

  const companyId = session.user.companyId;
  const body = await req.json();
  const { sessionId, message, action: directAction } = body;

  // Load or create session
  let chatSession;
  if (sessionId) {
    chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, companyId },
    });
  }

  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        companyId,
        userId: session.user.id,
        type: "certificate",
        status: "active",
        context: JSON.stringify(getInitialState()),
      },
    });
  }

  let wizardState: WizardState = getInitialState();
  if (chatSession.context) {
    try { wizardState = JSON.parse(chatSession.context); } catch { /* use initial state */ }
  }

  // Save user message
  if (message) {
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "user",
        content: message,
      },
    });
  }

  const clients = await prisma.client.findMany({
    where: { companyId, active: true },
    select: { id: true, name: true, email: true },
  });

  let responseMessage = "";
  let responseMetadata: Record<string, unknown> | null = null;

  // Direct wizard action (from button clicks)
  if (directAction) {
    wizardState = applyAction(wizardState, directAction as WizardAction);

    if (wizardState.step === "REVIEW_DATA" && wizardState.clientId && wizardState.periodStart && wizardState.periodEnd) {
      // Fetch records for the period
      const records = await prisma.recyclingRecord.findMany({
        where: {
          clientId: wizardState.clientId,
          companyId,
          pickupDate: {
            gte: new Date(wizardState.periodStart),
            lte: new Date(wizardState.periodEnd),
          },
        },
      });

      const materials: Record<string, { kg: number; co2: number }> = {};
      let totalKg = 0;
      let totalCo2 = 0;

      records.forEach((r) => {
        if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
        materials[r.material].kg += r.quantityKg;
        materials[r.material].co2 += r.co2Saved;
        totalKg += r.quantityKg;
        totalCo2 += r.co2Saved;
      });

      wizardState.materials = materials;
      wizardState.totalKg = totalKg;
      wizardState.totalCo2 = totalCo2;
      wizardState.step = "CONFIRM";

      if (records.length === 0) {
        responseMessage = `No se encontraron registros de reciclaje para **${wizardState.clientName}** en el período seleccionado. Intenta con otro período.`;
        wizardState.step = "SELECT_PERIOD";
      } else {
        responseMessage = getStepMessage(wizardState);
        responseMetadata = {
          type: "wizard_step",
          step: "CONFIRM",
          data: { materials, totalKg, totalCo2 },
        };
      }
    } else if (directAction.type === "CONFIRM" && wizardState.step === "DONE") {
      // Create the certificate
      const certificate = await prisma.certificate.create({
        data: {
          uniqueCode: generateCertCode(),
          clientId: wizardState.clientId!,
          companyId,
          totalKg: wizardState.totalKg!,
          totalCo2: wizardState.totalCo2!,
          materials: JSON.stringify(wizardState.materials),
          periodStart: new Date(wizardState.periodStart!),
          periodEnd: new Date(wizardState.periodEnd!),
          status: "draft",
        },
      });

      wizardState.certificateId = certificate.id;
      responseMessage = getStepMessage(wizardState);
      responseMetadata = {
        type: "wizard_step",
        step: "DONE",
        data: { certificateId: certificate.id },
      };
    } else {
      responseMessage = getStepMessage(wizardState);
      responseMetadata = {
        type: "wizard_step",
        step: wizardState.step,
        data: wizardState.step === "SELECT_CLIENT" ? { clients } : null,
      };
    }
  } else if (message) {
    // Process with AI
    const companyName = session.user.companyName || "CertiRecicla";
    const aiResponse = await processWithAI(message, wizardState, clients, companyName);

    if (aiResponse.action) {
      wizardState = applyAction(wizardState, aiResponse.action);

      // If AI selected a period, fetch review data
      if (wizardState.step === "REVIEW_DATA" && wizardState.clientId && wizardState.periodStart && wizardState.periodEnd) {
        const records = await prisma.recyclingRecord.findMany({
          where: {
            clientId: wizardState.clientId,
            companyId,
            pickupDate: {
              gte: new Date(wizardState.periodStart),
              lte: new Date(wizardState.periodEnd),
            },
          },
        });

        const materials: Record<string, { kg: number; co2: number }> = {};
        let totalKg = 0;
        let totalCo2 = 0;

        records.forEach((r) => {
          if (!materials[r.material]) materials[r.material] = { kg: 0, co2: 0 };
          materials[r.material].kg += r.quantityKg;
          materials[r.material].co2 += r.co2Saved;
          totalKg += r.quantityKg;
          totalCo2 += r.co2Saved;
        });

        wizardState.materials = materials;
        wizardState.totalKg = totalKg;
        wizardState.totalCo2 = totalCo2;
        wizardState.step = records.length > 0 ? "CONFIRM" : "SELECT_PERIOD";
      }

      responseMessage = aiResponse.message;
      responseMetadata = {
        type: "wizard_step",
        step: wizardState.step,
        data:
          wizardState.step === "SELECT_CLIENT" ? { clients } :
          wizardState.step === "CONFIRM" ? { materials: wizardState.materials, totalKg: wizardState.totalKg, totalCo2: wizardState.totalCo2 } :
          null,
      };
    } else {
      responseMessage = aiResponse.message;
    }
  }

  // Save assistant message
  await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: "assistant",
      content: responseMessage,
      metadata: responseMetadata ? JSON.stringify(responseMetadata) : null,
    },
  });

  // Update session context
  await prisma.chatSession.update({
    where: { id: chatSession.id },
    data: { context: JSON.stringify(wizardState) },
  });

  return NextResponse.json({
    sessionId: chatSession.id,
    message: responseMessage,
    metadata: responseMetadata,
    wizardState,
  });
}
