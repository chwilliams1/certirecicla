import * as fs from "fs";
import * as path from "path";

// Load .env manually
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

import { sendTransactionalEmail } from "../src/lib/email/send-email";
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  trialExpiringEmail,
  trialExpiredEmail,
  subscriptionActivatedEmail,
  subscriptionCancelledEmail,
  paymentFailedEmail,
  teamInvitationEmail,
  portalLinkEmail,
} from "../src/lib/email/templates";

const TO = "charlesduarte97@gmail.com";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function testAllEmails() {
  const emails = [
    { name: "Welcome", ...welcomeEmail({ userName: "Charles", trialDays: 14 }) },
    { name: "Verification", ...verificationEmail({ userName: "Charles", verificationUrl: `${BASE_URL}/api/auth/verify-email?token=test123` }) },
    { name: "Password Reset", ...passwordResetEmail({ userName: "Charles", resetUrl: `${BASE_URL}/reset-password?token=test123` }) },
    { name: "Trial Expiring", ...trialExpiringEmail({ companyName: "EcoTest SpA", daysLeft: 3 }) },
    { name: "Trial Expired", ...trialExpiredEmail({ companyName: "EcoTest SpA" }) },
    { name: "Subscription Activated", ...subscriptionActivatedEmail({ companyName: "EcoTest SpA", planName: "profesional" }) },
    { name: "Subscription Cancelled", ...subscriptionCancelledEmail({ companyName: "EcoTest SpA" }) },
    { name: "Payment Failed", ...paymentFailedEmail({ companyName: "EcoTest SpA" }) },
    { name: "Team Invitation", ...teamInvitationEmail({ inviterName: "Carlos Admin", companyName: "EcoTest SpA", tempPassword: "TempPass123", loginUrl: `${BASE_URL}/login` }) },
    { name: "Portal Link", ...portalLinkEmail({ companyName: "EcoTest SpA", clientName: "Cliente Demo", portalUrl: `${BASE_URL}/portal/test-token` }) },
  ];

  for (const email of emails) {
    console.log(`Sending: ${email.name}...`);
    const result = await sendTransactionalEmail({
      to: TO,
      subject: `[TEST] ${email.subject}`,
      html: email.html,
    });
    console.log(`  ${result.success ? "OK" : "FAIL"} ${result.error || result.resendId || ""}`);
    // Respect Resend rate limit (2 req/sec)
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log("\nDone! Check your inbox.");
}

testAllEmails().catch(console.error);
