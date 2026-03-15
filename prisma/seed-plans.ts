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

const CO2_FACTORS = [
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

const co2Map: Record<string, number> = Object.fromEntries(
  CO2_FACTORS.map((f) => [f.material, f.factor])
);

interface PlanSeed {
  plan: string;
  companyName: string;
  rut: string;
  email: string;
  userName: string;
  maxClients: number;
  maxCertificatesPerMonth: number;
  subscriptionStatus: string;
  clients: { name: string; rut: string; email: string; contactName: string; address: string }[];
  brandingFields?: Record<string, string | boolean>;
}

const PLAN_SEEDS: PlanSeed[] = [
  {
    plan: "trial",
    companyName: "Trial Reciclaje Ltda",
    rut: "76.100.100-1",
    email: "trial@certirecicla.cl",
    userName: "Usuario Trial",
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    subscriptionStatus: "none",
    clients: [
      { name: "Minimarket Don Pedro", rut: "76.200.100-1", email: "pedro@minimarket.cl", contactName: "Pedro Gómez", address: "Calle Los Aromos 123, Ñuñoa" },
      { name: "Cafetería La Esquina", rut: "76.200.100-2", email: "contacto@laesquina.cl", contactName: "María López", address: "Av. Irarrázaval 456, Ñuñoa" },
      { name: "Oficina CoWork SpA", rut: "76.200.100-3", email: "admin@cowork.cl", contactName: "Luis Tapia", address: "Av. Providencia 789, Providencia" },
    ],
  },
  {
    plan: "starter",
    companyName: "Starter Eco Gestora SpA",
    rut: "76.100.200-2",
    email: "starter@certirecicla.cl",
    userName: "Usuario Starter",
    maxClients: 15,
    maxCertificatesPerMonth: 30,
    subscriptionStatus: "active",
    clients: [
      { name: "Hotel Boutique Bellavista", rut: "76.300.100-1", email: "admin@hotelbella.cl", contactName: "Ana Castillo", address: "Constitución 50, Bellavista" },
      { name: "Restaurante El Parrón", rut: "76.300.100-2", email: "gerencia@elparron.cl", contactName: "Jorge Muñoz", address: "Av. Manuel Montt 1234, Providencia" },
      { name: "Clínica Dental Sonrisa", rut: "76.300.100-3", email: "admin@sonrisa.cl", contactName: "Dra. Paz Reyes", address: "Los Leones 567, Providencia" },
      { name: "Colegio Santa María", rut: "76.300.100-4", email: "admin@santamaria.cl", contactName: "Roberto Figueroa", address: "Av. Grecia 890, Ñuñoa" },
      { name: "Ferretería El Maestro", rut: "76.300.100-5", email: "ventas@elmaestro.cl", contactName: "Carlos Vega", address: "Gran Avenida 2345, San Miguel" },
    ],
  },
  {
    plan: "profesional",
    companyName: "Profesional Verde Gestora SpA",
    rut: "76.100.300-3",
    email: "profesional@certirecicla.cl",
    userName: "Usuario Profesional",
    maxClients: 60,
    maxCertificatesPerMonth: -1,
    subscriptionStatus: "active",
    clients: [
      { name: "Mall Plaza Vespucio", rut: "76.400.100-1", email: "sustentabilidad@mallplaza.cl", contactName: "Catalina Bravo", address: "Av. Vicuña Mackenna 6100, La Florida" },
      { name: "Universidad Central", rut: "76.400.100-2", email: "medioambiente@ucentral.cl", contactName: "Prof. Hernán Díaz", address: "Lord Cochrane 417, Santiago Centro" },
      { name: "Clínica Las Condes", rut: "76.400.100-3", email: "residuos@clinicalc.cl", contactName: "Ing. Paula Torres", address: "Lo Fontecilla 441, Las Condes" },
      { name: "Sodimac Maipú", rut: "76.400.100-4", email: "reciclaje@sodimac.cl", contactName: "Marcos Peña", address: "Av. Américo Vespucio 1001, Maipú" },
      { name: "Banco Estado Sucursal Centro", rut: "76.400.100-5", email: "gestion@bancoestado.cl", contactName: "Ignacio Saavedra", address: "Av. Libertador B. O'Higgins 1111, Santiago" },
      { name: "Hilton Santiago", rut: "76.400.100-6", email: "green@hilton.cl", contactName: "Sandra Méndez", address: "Av. Santa María 1742, Providencia" },
      { name: "Laboratorio Chile", rut: "76.400.100-7", email: "residuos@labchile.cl", contactName: "Dr. Felipe Navarrete", address: "Av. Marathon 1315, Macul" },
      { name: "Copec Estación Central", rut: "76.400.100-8", email: "medioambiente@copec.cl", contactName: "Javiera Riquelme", address: "Av. Lib. Bernardo O'Higgins 3456, Estación Central" },
    ],
  },
  {
    plan: "business",
    companyName: "Business Total Reciclaje S.A.",
    rut: "76.100.400-4",
    email: "business@certirecicla.cl",
    userName: "Usuario Business",
    maxClients: 200,
    maxCertificatesPerMonth: -1,
    subscriptionStatus: "active",
    clients: [
      { name: "Coca-Cola Chile", rut: "96.853.490-1", email: "sustentabilidad@coca-cola.cl", contactName: "Rodrigo Valenzuela", address: "Av. Presidente Eduardo Frei Montalva 8600, Quilicura" },
      { name: "Falabella Corporativo", rut: "90.749.000-9", email: "medioambiente@falabella.cl", contactName: "Francisca Araya", address: "Av. del Valle 945, Huechuraba" },
      { name: "CMPC", rut: "90.222.000-3", email: "reciclaje@cmpc.cl", contactName: "Martín Soto", address: "Agustinas 1343, Piso 8, Santiago" },
      { name: "Nestlé Chile", rut: "90.605.000-7", email: "ambiente@nestle.cl", contactName: "Andrés Morales", address: "Av. Las Condes 11287, Las Condes" },
      { name: "Cencosud", rut: "93.834.000-5", email: "reciclaje@cencosud.cl", contactName: "Valentina Rojas", address: "Av. Kennedy 9001, Piso 4, Las Condes" },
      { name: "Samsung Chile", rut: "76.412.650-3", email: "ewaste@samsung.cl", contactName: "Diego Contreras", address: "Av. Providencia 1760, Piso 18, Providencia" },
      { name: "CCU", rut: "90.413.000-1", email: "sustentabilidad@ccu.cl", contactName: "Camila Herrera", address: "Av. Vitacura 2670, Piso 23, Las Condes" },
      { name: "Viña Concha y Toro", rut: "90.227.000-0", email: "sustentabilidad@conchaytoro.cl", contactName: "Isabel Fuentes", address: "Av. Nueva Tajamar 481, Torre Norte, Las Condes" },
      { name: "Latam Airlines", rut: "89.862.200-2", email: "green@latam.cl", contactName: "Tomás Gutiérrez", address: "Av. Presidente Riesco 5711, Las Condes" },
      { name: "BHP Chile", rut: "76.500.100-1", email: "sustentabilidad@bhp.cl", contactName: "Ing. Carolina Pizarro", address: "Cerro El Plomo 6000, Las Condes" },
    ],
  },
];

const MATERIALS = ["Plástico PET", "Cartón", "Vidrio", "Aluminio", "Papel", "Electrónicos"];

async function createRecordsForCompany(
  companyId: string,
  clientIds: string[],
  scale: number
) {
  const records: { clientIdx: number; material: string; qty: number; month: number }[] = [];

  for (let month = 7; month <= 12; month++) {
    const recordsPerMonth = Math.min(clientIds.length, Math.ceil(scale * 1.5));
    for (let i = 0; i < recordsPerMonth; i++) {
      const clientIdx = i % clientIds.length;
      const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
      const baseQty = material === "Aluminio" ? 300 : material === "Electrónicos" ? 150 : 2500;
      const qty = Math.round(baseQty * scale * (0.5 + Math.random()));
      records.push({ clientIdx, material, qty, month });
    }
  }

  for (const r of records) {
    const day = 5 + Math.floor(Math.random() * 20);
    await prisma.recyclingRecord.create({
      data: {
        clientId: clientIds[r.clientIdx],
        companyId,
        material: r.material,
        quantityKg: r.qty,
        co2Saved: r.qty * (co2Map[r.material] || 1),
        pickupDate: new Date(2025, r.month - 1, day),
        location: "Santiago, Chile",
      },
    });
  }

  return records.length;
}

async function createCertificatesForCompany(
  companyId: string,
  clientIds: string[],
  count: number
) {
  const statuses = ["draft", "published", "sent"];

  for (let i = 0; i < Math.min(count, clientIds.length); i++) {
    const material1 = MATERIALS[i % MATERIALS.length];
    const material2 = MATERIALS[(i + 1) % MATERIALS.length];
    const kg1 = 1000 + Math.round(Math.random() * 4000);
    const kg2 = 500 + Math.round(Math.random() * 3000);

    const materials: Record<string, { kg: number; co2: number }> = {
      [material1]: { kg: kg1, co2: Math.round(kg1 * (co2Map[material1] || 1)) },
      [material2]: { kg: kg2, co2: Math.round(kg2 * (co2Map[material2] || 1)) },
    };

    const totalKg = kg1 + kg2;
    const totalCo2 = materials[material1].co2 + materials[material2].co2;
    const status = statuses[i % statuses.length];

    await prisma.certificate.create({
      data: {
        uniqueCode: generateCertCode(),
        clientId: clientIds[i],
        companyId,
        totalKg,
        totalCo2,
        materials: JSON.stringify(materials),
        periodStart: new Date(2025, 6, 1),
        periodEnd: new Date(2025, 11, 31),
        status,
        sentAt: status === "sent" ? new Date(2026, 0, 15) : undefined,
      },
    });
  }
}

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

  const hashedPassword = await hash("Test1234", 12);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  console.log("\n🌱 Creando cuentas de prueba por plan...\n");

  for (const seed of PLAN_SEEDS) {
    // Create company
    const company = await prisma.company.create({
      data: {
        name: seed.companyName,
        rut: seed.rut,
        address: "Santiago, Chile",
        phone: "+56 9 1234 5678",
        email: `contacto@${seed.plan}gestora.cl`,
        plan: seed.plan,
        trialEndsAt: seed.plan === "trial" ? trialEndsAt : undefined,
        planStartDate: seed.plan !== "trial" ? new Date() : undefined,
        maxClients: seed.maxClients,
        maxCertificatesPerMonth: seed.maxCertificatesPerMonth,
        subscriptionStatus: seed.subscriptionStatus,
        ...(seed.plan === "business"
          ? {
              brandPrimaryColor: "#0F4C3A",
              brandHidePlatform: false,
              brandClosingText: "Certificado emitido por Business Total Reciclaje S.A. bajo estándares GHG Protocol.",
            }
          : {}),
      },
    });

    // Create admin user
    await prisma.user.create({
      data: {
        email: seed.email,
        password: hashedPassword,
        name: seed.userName,
        companyId: company.id,
        role: "admin",
        emailVerified: true,
      },
    });

    // Create CO2 factors
    for (const f of CO2_FACTORS) {
      await prisma.co2Factor.create({
        data: { ...f, companyId: company.id },
      });
    }

    // Create clients
    const clients = await Promise.all(
      seed.clients.map((c) =>
        prisma.client.create({
          data: { ...c, companyId: company.id },
        })
      )
    );
    const clientIds = clients.map((c) => c.id);

    // Create recycling records (scale by plan size)
    const scale = seed.plan === "trial" ? 0.3 : seed.plan === "starter" ? 0.6 : seed.plan === "profesional" ? 1 : 1.5;
    const recordCount = await createRecordsForCompany(company.id, clientIds, scale);

    // Create certificates
    const certCount = Math.min(seed.clients.length, seed.plan === "trial" ? 2 : seed.plan === "starter" ? 3 : 5);
    await createCertificatesForCompany(company.id, clientIds, certCount);

    console.log(`  ✅ Plan ${seed.plan.toUpperCase().padEnd(12)} → ${seed.email} / Test1234`);
    console.log(`     ${seed.clients.length} clientes, ${recordCount} retiros, ${certCount} certificados\n`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Todas las cuentas usan password: Test1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
