export type WizardStep =
  | "IDLE"
  | "SELECT_CLIENT"
  | "SELECT_PERIOD"
  | "REVIEW_DATA"
  | "CONFIRM"
  | "DONE";

export interface WizardState {
  step: WizardStep;
  clientId?: string;
  clientName?: string;
  periodStart?: string;
  periodEnd?: string;
  materials?: Record<string, { kg: number; co2: number }>;
  totalKg?: number;
  totalCo2?: number;
  certificateId?: string;
}

export interface WizardAction {
  type: "SELECT_CLIENT" | "SELECT_PERIOD" | "CONFIRM" | "START" | "RESET";
  payload?: Record<string, unknown>;
}

export function getInitialState(): WizardState {
  return { step: "IDLE" };
}

export function applyAction(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "START":
      return { step: "SELECT_CLIENT" };
    case "SELECT_CLIENT":
      return {
        ...state,
        step: "SELECT_PERIOD",
        clientId: action.payload?.clientId as string,
        clientName: action.payload?.clientName as string,
      };
    case "SELECT_PERIOD":
      return {
        ...state,
        step: "REVIEW_DATA",
        periodStart: action.payload?.periodStart as string,
        periodEnd: action.payload?.periodEnd as string,
      };
    case "CONFIRM":
      return { ...state, step: "DONE" };
    case "RESET":
      return getInitialState();
    default:
      return state;
  }
}

export function getStepMessage(state: WizardState): string {
  switch (state.step) {
    case "IDLE":
      return "¡Hola! Soy tu asistente de CertiRecicla. Puedo ayudarte a crear certificados de reciclaje, consultar datos de clientes o responder preguntas sobre CO₂. ¿Qué deseas hacer?";
    case "SELECT_CLIENT":
      return "Selecciona el cliente para el que deseas generar el certificado:";
    case "SELECT_PERIOD":
      return `Perfecto, vamos a crear un certificado para **${state.clientName}**. Selecciona el período que deseas cubrir:`;
    case "REVIEW_DATA":
      return `Revisando los datos de reciclaje de **${state.clientName}** para el período seleccionado...`;
    case "CONFIRM":
      return "Revisa el resumen del certificado y confirma para generarlo:";
    case "DONE":
      return "¡Certificado creado exitosamente! Puedes verlo en la sección de certificados, descargarlo como PDF o enviarlo por email al cliente.";
    default:
      return "";
  }
}
