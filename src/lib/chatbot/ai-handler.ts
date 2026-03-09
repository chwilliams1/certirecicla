import Anthropic from "@anthropic-ai/sdk";
import { WizardState, WizardAction } from "./wizard-engine";
import { buildSystemPrompt } from "./system-prompt";

interface ClientInfo {
  id: string;
  name: string;
  email: string | null;
}

interface AIResponse {
  message: string;
  action: WizardAction | null;
}

export async function processWithAI(
  userMessage: string,
  wizardState: WizardState,
  clients: ClientInfo[],
  companyName: string
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      message: "La API de IA no está configurada. Por favor, usa los botones del wizard para crear el certificado.",
      action: null,
    };
  }

  try {
    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(wizardState, clients, companyName);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || text,
          action: parsed.action || null,
        };
      }
    } catch {
      // If JSON parsing fails, return as plain text
    }

    return { message: text, action: null };
  } catch (error) {
    console.error("AI handler error:", error);
    return {
      message: "Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o usa los botones del wizard.",
      action: null,
    };
  }
}
