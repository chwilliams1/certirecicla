import crypto from "crypto";

/**
 * Generates a short, readable certificate code like CR-2025-A3B7X2
 */
export function generateCertCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid confusion
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `CR-${year}-${code}`;
}
