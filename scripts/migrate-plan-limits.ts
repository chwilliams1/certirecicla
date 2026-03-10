/**
 * One-time migration script to update all existing companies
 * with the new plan limits.
 *
 * Usage: npx tsx scripts/migrate-plan-limits.ts
 */

import { PrismaClient } from "@prisma/client";

const PLAN_LIMITS: Record<string, { maxClients: number; maxCertificatesPerMonth: number }> = {
  trial: { maxClients: 10, maxCertificatesPerMonth: 15 },
  starter: { maxClients: 25, maxCertificatesPerMonth: 50 },
  profesional: { maxClients: 80, maxCertificatesPerMonth: -1 },
  business: { maxClients: 300, maxCertificatesPerMonth: -1 },
};

async function main() {
  const prisma = new PrismaClient();

  try {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true, plan: true, maxClients: true, maxCertificatesPerMonth: true },
    });

    console.log(`Found ${companies.length} companies to migrate.\n`);

    for (const company of companies) {
      const limits = PLAN_LIMITS[company.plan] || PLAN_LIMITS.trial;

      console.log(
        `[${company.name}] plan=${company.plan} | ` +
        `clients: ${company.maxClients} -> ${limits.maxClients} | ` +
        `certs: ${company.maxCertificatesPerMonth} -> ${limits.maxCertificatesPerMonth}`
      );

      await prisma.company.update({
        where: { id: company.id },
        data: {
          maxClients: limits.maxClients,
          maxCertificatesPerMonth: limits.maxCertificatesPerMonth,
        },
      });
    }

    console.log(`\nMigration complete. ${companies.length} companies updated.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
