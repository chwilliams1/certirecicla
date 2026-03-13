import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),

  // Anthropic (AI)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Cron jobs
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 chars"),

  // Reveniu (payments)
  REVENIU_SECRET_KEY: z.string().min(8, "REVENIU_SECRET_KEY is required"),
  REVENIU_PLAN_STARTER: z.string().optional(),
  REVENIU_PLAN_PROFESIONAL: z.string().optional(),
  REVENIU_PLAN_BUSINESS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function env(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
