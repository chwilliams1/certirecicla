import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { buildEmailHtml } from "@/lib/email/email-template";

interface MaterialData {
  material: string;
  kg: number;
  co2: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, materials, totalKg, totalCo2, equivalencies } = body as {
      name: string;
      email: string;
      materials: MaterialData[];
      totalKg: number;
      totalCo2: number;
      equivalencies: {
        treesPerYear: number;
        kmNotDriven: number;
        smartphonesCharged: number;
        waterSavedLiters: number;
      };
    };

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    if (!materials?.length || totalCo2 <= 0) {
      return NextResponse.json({ error: "Datos de materiales inválidos" }, { status: 400 });
    }

    const materialsTable = materials
      .filter((m) => m.kg > 0)
      .map((m) => `• ${m.material}: ${m.kg.toLocaleString("es-CL")} kg → ${m.co2.toFixed(1)} kg CO₂ evitado`)
      .join("\n");

    const emailBody = `Hola ${name.trim()},

Gracias por usar la Calculadora de Reciclaje de CertiRecicla. Aquí tienes tu reporte de impacto ambiental:

━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN DE IMPACTO
━━━━━━━━━━━━━━━━━━━━━━

${materialsTable}

Total reciclado: ${totalKg.toLocaleString("es-CL")} kg
CO₂ evitado: ${totalCo2.toFixed(1)} kg

━━━━━━━━━━━━━━━━━━━━━━
🌍 ECOEQUIVALENCIAS
━━━━━━━━━━━━━━━━━━━━━━

🌳 ${equivalencies.treesPerYear} árboles absorbiendo CO₂ por un año
🚗 ${equivalencies.kmNotDriven.toLocaleString("es-CL")} km no recorridos en auto
📱 ${equivalencies.smartphonesCharged.toLocaleString("es-CL")} smartphones cargados
💧 ${equivalencies.waterSavedLiters.toLocaleString("es-CL")} litros de agua ahorrados

Metodología: EPA WARM v16 (2023), DEFRA/DESNZ 2025, EPA GHG Equivalencies Calculator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 PRUEBA GRATIS 14 DÍAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¿Quieres certificar oficialmente tu reciclaje? Prueba CertiRecicla gratis por 14 días — sin tarjeta de crédito, sin compromiso.

👉 Activa tu prueba: https://certirecicla.cl/register?ref=calculadora-email&name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}

¿Tienes dudas? Responde este correo y te ayudamos personalmente.

Saludos,
El equipo de CertiRecicla`;

    const html = buildEmailHtml(emailBody, "CertiRecicla");

    const result = await sendTransactionalEmail({
      to: email.trim(),
      subject: `${name.trim()}, tu reporte de impacto ambiental — ${totalCo2.toFixed(0)} kg CO₂ evitado`,
      html,
      replyTo: "hola@certirecicla.cl",
    });

    if (!result.success) {
      console.error("Error sending calculator lead email:", result.error);
      return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in calculator lead endpoint:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
