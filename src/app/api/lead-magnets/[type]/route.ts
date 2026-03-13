import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { LeadMagnetPDF } from "@/lib/pdf/lead-magnet-pdf";
import fs from "fs";
import path from "path";

const VALID_TYPES = [
  "checklist-ley-rep",
  "guia-clasificacion-residuos",
  "checklist-auditoria-ambiental",
  "guia-reducir-costos-residuos",
  "tabla-factores-co2",
] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

  // eslint-disable-next-line
  const element = React.createElement(LeadMagnetPDF, { type, logo: logoBase64 }) as React.ReactElement;
  const buffer = await renderToBuffer(element);

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${type}.pdf"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
