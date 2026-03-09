import { z } from "zod";

/**
 * Formatea un RUT chileno al formato 00.000.000-0 mientras se escribe.
 * Acepta entrada con o sin puntos/guión y la reformatea en tiempo real.
 */
export function formatRut(value: string): string {
  // Eliminar todo excepto dígitos y K/k
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase();

  // Limitar a 9 caracteres (8 dígitos + 1 dígito verificador)
  if (clean.length > 9) clean = clean.slice(0, 9);

  if (clean.length <= 1) return clean;

  // Separar cuerpo y dígito verificador
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  // Formatear cuerpo con puntos
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formatted}-${dv}`;
}

export const clientCreateSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  rut: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  parentClientId: z.string().nullable().optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const certificateCreateSchema = z.object({
  clientId: z.string().min(1, "Cliente es requerido"),
  periodStart: z.string().min(1, "Fecha inicio es requerida"),
  periodEnd: z.string().min(1, "Fecha fin es requerida"),
});

export const recordCreateSchema = z.object({
  clientId: z.string().min(1, "Cliente es requerido"),
  material: z.string().min(1, "Material es requerido"),
  quantityKg: z.number().positive("Cantidad debe ser positiva"),
  pickupDate: z.string().min(1, "Fecha de retiro es requerida"),
  location: z.string().optional(),
});

export const emailSendSchema = z.object({
  certificateId: z.string().min(1, "Certificado es requerido"),
  template: z.enum(["certificate", "welcome", "reminder"]).default("certificate"),
});
