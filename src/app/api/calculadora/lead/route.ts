import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { randomBytes } from "crypto";

interface MaterialData {
  material: string;
  kg: number;
  co2: number;
}

function generateDemoCode(): string {
  const hex = randomBytes(3).toString("hex").toUpperCase();
  return `DEMO-${hex}`;
}

function buildCertificateEmailHtml(data: {
  name: string;
  code: string;
  materials: MaterialData[];
  totalKg: number;
  totalCo2: number;
  equivalencies: {
    treesPerYear: number;
    kmNotDriven: number;
    smartphonesCharged: number;
    waterSavedLiters: number;
  };
  verifyUrl: string;
}): string {
  const { name, code, materials, totalKg, totalCo2, equivalencies, verifyUrl } = data;
  const today = new Date().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

  const materialsRows = materials
    .filter((m) => m.kg > 0)
    .map(
      (m, i) => `
      <tr style="background-color: ${i % 2 === 0 ? "#ffffff" : "#f4f7f4"};">
        <td style="padding: 10px 14px; font-size: 13px; color: #2d3a2e; border-bottom: 1px solid #e8e4dc;">${m.material}</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #2d3a2e; text-align: right; border-bottom: 1px solid #e8e4dc;">${m.kg.toLocaleString("es-CL")}</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #2d3a2e; text-align: right; border-bottom: 1px solid #e8e4dc;">${m.co2.toLocaleString("es-CL", { maximumFractionDigits: 1 })}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f0f5f0; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f5f0; padding: 24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

  <!-- Green accent bar + header -->
  <tr>
    <td style="background-color: #4a6b4e; padding: 24px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: bold;">Certificado de Reciclaje</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">Reporte de Impacto Ambiental</p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.6);">Código</p>
            <p style="margin: 2px 0 0; font-size: 14px; color: #ffffff; font-family: 'Courier New', monospace; font-weight: bold;">${code}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Recipient info -->
  <tr>
    <td style="padding: 24px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin: 0; font-size: 10px; color: #7c9a82; text-transform: uppercase; letter-spacing: 0.5px;">Destinatario</p>
            <p style="margin: 4px 0 0; font-size: 16px; color: #2d3a2e; font-weight: bold;">${name.trim()}</p>
          </td>
          <td style="text-align: right;">
            <p style="margin: 0; font-size: 10px; color: #7c9a82; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #2d3a2e; font-weight: bold;">${today}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding: 16px 28px 0;"><div style="border-bottom: 1px solid #d4e4d6;"></div></td></tr>

  <!-- Totals -->
  <tr>
    <td style="padding: 20px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="background: linear-gradient(135deg, #4a6b4e, #5a7d5e); background-color: #4a6b4e; border-radius: 10px; padding: 18px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.7);">Total reciclado</p>
            <p style="margin: 6px 0 0; font-size: 28px; color: #ffffff; font-weight: bold;">${totalKg.toLocaleString("es-CL")}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">kg</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background: linear-gradient(135deg, #5a7d5e, #7c9a82); background-color: #5a7d5e; border-radius: 10px; padding: 18px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.7);">CO₂ evitado</p>
            <p style="margin: 6px 0 0; font-size: 28px; color: #ffffff; font-weight: bold;">${totalCo2.toLocaleString("es-CL", { maximumFractionDigits: 1 })}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">kg CO₂</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Materials table -->
  <tr>
    <td style="padding: 24px 28px 0;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #4a6b4e; font-weight: bold;">Detalle de Materiales</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden; border: 1px solid #d4e4d6;">
        <tr style="background-color: #4a6b4e;">
          <th style="padding: 10px 14px; font-size: 11px; color: #ffffff; text-align: left; font-weight: 600;">Material</th>
          <th style="padding: 10px 14px; font-size: 11px; color: #ffffff; text-align: right; font-weight: 600;">Cantidad (kg)</th>
          <th style="padding: 10px 14px; font-size: 11px; color: #ffffff; text-align: right; font-weight: 600;">CO₂ evitado (kg)</th>
        </tr>
        ${materialsRows}
      </table>
    </td>
  </tr>

  <!-- Equivalencies -->
  <tr>
    <td style="padding: 24px 28px 0;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #4a6b4e; font-weight: bold;">Equivalencias Ambientales</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f4; border-radius: 8px; padding: 4px;">
        <tr>
          <td style="padding: 14px; text-align: center; width: 25%;">
            <p style="margin: 0; font-size: 22px;">🌳</p>
            <p style="margin: 4px 0 0; font-size: 18px; color: #4a6b4e; font-weight: bold;">${equivalencies.treesPerYear}</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #888;">Árboles preservados</p>
          </td>
          <td style="padding: 14px; text-align: center; width: 25%;">
            <p style="margin: 0; font-size: 22px;">🚗</p>
            <p style="margin: 4px 0 0; font-size: 18px; color: #4a6b4e; font-weight: bold;">${equivalencies.kmNotDriven.toLocaleString("es-CL")}</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #888;">Km no conducidos</p>
          </td>
          <td style="padding: 14px; text-align: center; width: 25%;">
            <p style="margin: 0; font-size: 22px;">💧</p>
            <p style="margin: 4px 0 0; font-size: 18px; color: #4a6b4e; font-weight: bold;">${equivalencies.waterSavedLiters.toLocaleString("es-CL")}</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #888;">Litros agua ahorrados</p>
          </td>
          <td style="padding: 14px; text-align: center; width: 25%;">
            <p style="margin: 0; font-size: 22px;">📱</p>
            <p style="margin: 4px 0 0; font-size: 18px; color: #4a6b4e; font-weight: bold;">${equivalencies.smartphonesCharged.toLocaleString("es-CL")}</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #888;">Smartphones cargados</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding: 20px 28px 0;"><div style="border-bottom: 1px solid #d4e4d6;"></div></td></tr>

  <!-- Verify link / QR replacement -->
  <tr>
    <td style="padding: 20px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f4; border: 1px solid #d4e4d6; border-radius: 8px;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0; font-size: 11px; color: #7c9a82; text-transform: uppercase; letter-spacing: 0.5px;">Verificar certificado</p>
            <p style="margin: 6px 0 0; font-size: 13px; color: #2d3a2e;">
              <a href="${verifyUrl}" style="color: #4a6b4e; font-weight: bold; text-decoration: none;">${verifyUrl}</a>
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #888;">Código: ${code} · Emitido: ${today}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Methodology footer -->
  <tr>
    <td style="padding: 0 28px 20px;">
      <p style="margin: 0; font-size: 10px; color: #aaa; line-height: 1.5;">
        Factores de emisión: EPA WARM v16 (2023) y DEFRA/DESNZ 2025. Ecoequivalencias: EPA GHG Equivalencies Calculator. Agua: Water Footprint Network.
      </p>
    </td>
  </tr>

</table>

<!-- Post-certificate CTA (outside the "certificate") -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin-top: 16px;">
  <tr>
    <td style="text-align: center; padding: 8px 28px;">
      <p style="margin: 0; font-size: 11px; color: #888;">
        ¿Tienes dudas? Responde este correo y te ayudamos personalmente.
      </p>
    </td>
  </tr>
</table>

</td></tr>
</table>
</body>
</html>`;
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

    const demoCode = generateDemoCode();

    const materialsForUrl = materials
      .filter((m) => m.kg > 0)
      .map((m) => ({ material: m.material, kg: m.kg, co2: Number(m.co2.toFixed(1)) }));

    const verifyParams = new URLSearchParams({
      code: demoCode,
      name: name.trim(),
      materials: JSON.stringify(materialsForUrl),
      totalKg: String(totalKg),
      totalCo2: String(Number(totalCo2.toFixed(1))),
    });

    const verifyUrl = `https://certirecicla.cl/verify/demo?${verifyParams.toString()}`;

    const html = buildCertificateEmailHtml({
      name: name.trim(),
      code: demoCode,
      materials: materials.filter((m) => m.kg > 0),
      totalKg,
      totalCo2,
      equivalencies,
      verifyUrl,
    });

    const result = await sendTransactionalEmail({
      to: email.trim(),
      subject: `Certificado de Reciclaje — ${totalCo2.toFixed(0)} kg CO₂ evitado [${demoCode}]`,
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
