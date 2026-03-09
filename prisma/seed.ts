import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import crypto from "crypto";

function generateCertCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `CR-${year}-${code}`;
}

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.recyclingRecord.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.co2Factor.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create company with trial plan (30 days from now)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const company = await prisma.company.create({
    data: {
      name: "EcoRecicla SpA",
      rut: "76.543.210-K",
      address: "Av. Providencia 1234, Oficina 501, Santiago, Chile",
      phone: "+56 2 2345 6789",
      email: "contacto@ecorecicla.cl",
      plan: "trial",
      trialEndsAt,
      maxClients: 60,
      maxCertificatesPerMonth: -1,
    },
  });

  // Create admin user
  const hashedPassword = await hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      email: "admin@reciclaia.cl",
      password: hashedPassword,
      name: "Carolina Mendoza",
      companyId: company.id,
      role: "admin",
    },
  });

  // Create CO2 factors
  const factors = [
    { material: "Plástico PET", factor: 3.2 },
    { material: "Plástico HDPE", factor: 1.5 },
    { material: "Plástico LDPE", factor: 1.7 },
    { material: "Plástico PP", factor: 1.6 },
    { material: "Cartón", factor: 0.7 },
    { material: "Vidrio", factor: 0.4 },
    { material: "Aluminio", factor: 8.8 },
    { material: "Papel", factor: 1.2 },
    { material: "Madera", factor: 0.5 },
    { material: "Electrónicos", factor: 14.0 },
    { material: "RAE", factor: 14.0 },
  ];

  for (const f of factors) {
    await prisma.co2Factor.create({
      data: { ...f, companyId: company.id },
    });
  }

  // Create 8 clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Coca-Cola Chile",
        rut: "96.853.490-1",
        email: "sustentabilidad@coca-cola.cl",
        phone: "+56 2 2750 1000",
        address: "Av. Presidente Eduardo Frei Montalva 8600, Quilicura",
        contactName: "Rodrigo Valenzuela",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "Falabella",
        rut: "90.749.000-9",
        email: "medioambiente@falabella.cl",
        phone: "+56 2 2380 2000",
        address: "Av. del Valle 945, Huechuraba",
        contactName: "Francisca Araya",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "CMPC",
        rut: "90.222.000-3",
        email: "reciclaje@cmpc.cl",
        phone: "+56 2 2441 2000",
        address: "Agustinas 1343, Piso 8, Santiago",
        contactName: "Martín Soto",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "Viña Concha y Toro",
        rut: "90.227.000-0",
        email: "sustentabilidad@conchaytoro.cl",
        phone: "+56 2 2476 5000",
        address: "Av. Nueva Tajamar 481, Torre Norte, Las Condes",
        contactName: "Isabel Fuentes",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "Nestlé Chile",
        rut: "90.605.000-7",
        email: "ambiente@nestle.cl",
        phone: "+56 2 2338 8000",
        address: "Av. Las Condes 11287, Las Condes",
        contactName: "Andrés Morales",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "Cencosud",
        rut: "93.834.000-5",
        email: "reciclaje@cencosud.cl",
        phone: "+56 2 2959 0000",
        address: "Av. Kennedy 9001, Piso 4, Las Condes",
        contactName: "Valentina Rojas",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "Samsung Chile",
        rut: "76.412.650-3",
        email: "ewaste@samsung.cl",
        phone: "+56 2 2486 0000",
        address: "Av. Providencia 1760, Piso 18, Providencia",
        contactName: "Diego Contreras",
        companyId: company.id,
      },
    }),
    prisma.client.create({
      data: {
        name: "CCU",
        rut: "90.413.000-1",
        email: "sustentabilidad@ccu.cl",
        phone: "+56 2 2427 3000",
        address: "Av. Vitacura 2670, Piso 23, Las Condes",
        contactName: "Camila Herrera",
        companyId: company.id,
      },
    }),
  ]);

  // CO2 factors map
  const co2Map: Record<string, number> = {
    "Plástico PET": 3.2,
    "Plástico HDPE": 1.5,
    "Plástico LDPE": 1.7,
    "Plástico PP": 1.6,
    "Cartón": 0.7,
    "Vidrio": 0.4,
    "Aluminio": 8.8,
    "Papel": 1.2,
    "Madera": 0.5,
    "Electrónicos": 14.0,
    "RAE": 14.0,
  };

  // Create 35 recycling records over last 6 months
  const records = [
    { clientIdx: 0, material: "Plástico PET", qty: 2800, month: 7 },
    { clientIdx: 1, material: "Cartón", qty: 4500, month: 7 },
    { clientIdx: 2, material: "Papel", qty: 8200, month: 7 },
    { clientIdx: 3, material: "Vidrio", qty: 3400, month: 7 },
    { clientIdx: 4, material: "Plástico PET", qty: 1900, month: 7 },
    { clientIdx: 7, material: "Vidrio", qty: 5100, month: 7 },
    { clientIdx: 0, material: "Aluminio", qty: 320, month: 8 },
    { clientIdx: 1, material: "Plástico PET", qty: 1600, month: 8 },
    { clientIdx: 5, material: "Cartón", qty: 6800, month: 8 },
    { clientIdx: 6, material: "Electrónicos", qty: 180, month: 8 },
    { clientIdx: 3, material: "Cartón", qty: 2100, month: 8 },
    { clientIdx: 7, material: "Aluminio", qty: 450, month: 8 },
    { clientIdx: 2, material: "Cartón", qty: 7500, month: 9 },
    { clientIdx: 4, material: "Papel", qty: 3200, month: 9 },
    { clientIdx: 0, material: "Plástico PET", qty: 3100, month: 9 },
    { clientIdx: 5, material: "Vidrio", qty: 1800, month: 9 },
    { clientIdx: 6, material: "Electrónicos", qty: 95, month: 9 },
    { clientIdx: 1, material: "Papel", qty: 2400, month: 9 },
    { clientIdx: 3, material: "Vidrio", qty: 4200, month: 10 },
    { clientIdx: 7, material: "Vidrio", qty: 4800, month: 10 },
    { clientIdx: 0, material: "Cartón", qty: 3600, month: 10 },
    { clientIdx: 2, material: "Papel", qty: 6100, month: 10 },
    { clientIdx: 4, material: "Aluminio", qty: 280, month: 10 },
    { clientIdx: 5, material: "Plástico PET", qty: 2200, month: 10 },
    { clientIdx: 1, material: "Cartón", qty: 5200, month: 11 },
    { clientIdx: 6, material: "Electrónicos", qty: 150, month: 11 },
    { clientIdx: 0, material: "Plástico PET", qty: 3400, month: 11 },
    { clientIdx: 3, material: "Vidrio", qty: 2900, month: 11 },
    { clientIdx: 7, material: "Aluminio", qty: 520, month: 11 },
    { clientIdx: 2, material: "Papel", qty: 9100, month: 12 },
    { clientIdx: 4, material: "Plástico PET", qty: 2600, month: 12 },
    { clientIdx: 5, material: "Cartón", qty: 7200, month: 12 },
    { clientIdx: 0, material: "Aluminio", qty: 410, month: 12 },
    { clientIdx: 1, material: "Vidrio", qty: 1500, month: 12 },
    { clientIdx: 7, material: "Vidrio", qty: 3800, month: 12 },
  ];

  for (const r of records) {
    const client = clients[r.clientIdx];
    const co2Saved = r.qty * co2Map[r.material];
    const day = 5 + Math.floor(Math.random() * 20);
    await prisma.recyclingRecord.create({
      data: {
        clientId: client.id,
        companyId: company.id,
        material: r.material,
        quantityKg: r.qty,
        co2Saved,
        pickupDate: new Date(2025, r.month - 1, day),
        location: client.address,
      },
    });
  }

  // Create sample certificates
  const cert1Materials = {
    "Plástico PET": { kg: 2800, co2: 8960 },
    "Aluminio": { kg: 320, co2: 2816 },
  };
  await prisma.certificate.create({
    data: {
      uniqueCode: generateCertCode(),
      clientId: clients[0].id,
      companyId: company.id,
      totalKg: 3120,
      totalCo2: 11776,
      materials: JSON.stringify(cert1Materials),
      periodStart: new Date(2025, 6, 1),
      periodEnd: new Date(2025, 8, 30),
      status: "published",
    },
  });

  const cert2Materials = {
    "Cartón": { kg: 4500, co2: 3150 },
    "Plástico PET": { kg: 1600, co2: 5120 },
    "Papel": { kg: 2400, co2: 2880 },
    "Vidrio": { kg: 1500, co2: 600 },
  };
  await prisma.certificate.create({
    data: {
      uniqueCode: generateCertCode(),
      clientId: clients[1].id,
      companyId: company.id,
      totalKg: 10000,
      totalCo2: 11750,
      materials: JSON.stringify(cert2Materials),
      periodStart: new Date(2025, 6, 1),
      periodEnd: new Date(2025, 11, 31),
      status: "sent",
      sentAt: new Date(2026, 0, 15),
    },
  });

  const cert3Materials = {
    "Vidrio": { kg: 3400, co2: 1360 },
    "Cartón": { kg: 2100, co2: 1470 },
  };
  await prisma.certificate.create({
    data: {
      uniqueCode: generateCertCode(),
      clientId: clients[3].id,
      companyId: company.id,
      totalKg: 5500,
      totalCo2: 2830,
      materials: JSON.stringify(cert3Materials),
      periodStart: new Date(2025, 6, 1),
      periodEnd: new Date(2025, 7, 31),
      status: "draft",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Login: admin@reciclaia.cl / password123");
  console.log(`Created: ${clients.length} clients, ${records.length} records, 3 certificates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
