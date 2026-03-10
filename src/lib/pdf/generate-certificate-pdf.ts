import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import QRCode from "qrcode";
import { CertificatePDFDocument } from "./certificate-pdf";
import { DEFAULT_BRANDING, type BrandingConfig } from "./branding-config";

export interface PickupDetail {
  date: string;
  location: string;
  materials: string;
  kg: number;
}

export interface CertificateData {
  uniqueCode: string;
  clientName: string;
  clientRut: string;
  companyName: string;
  companyRut: string;
  companyAddress: string;
  companyLogo?: string;
  sanitaryResolution?: string;
  plantAddress?: string;
  totalKg: number;
  totalCo2: number;
  materials: Record<string, { kg: number; co2: number }>;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  status?: string;
  pickups?: PickupDetail[];
}

export async function generateCertificatePDF(
  data: CertificateData,
  branding: BrandingConfig = DEFAULT_BRANDING
): Promise<Buffer> {
  // Generate QR code as base64 PNG
  const verifyUrl = `https://certirecicla.cl/verify/${data.uniqueCode}`;
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      color: { dark: branding.palette.dark, light: "#ffffff" },
    });
  } catch {
    // QR generation failed, continue without it
  }

  // eslint-disable-next-line
  const buffer = await renderToBuffer(
    React.createElement(CertificatePDFDocument, {
      data,
      qrDataUrl,
      branding,
    }) as any
  );
  return Buffer.from(buffer);
}
