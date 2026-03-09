import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { CertificatePDFDocument } from "./certificate-pdf";

interface CertificateData {
  uniqueCode: string;
  clientName: string;
  clientRut: string;
  companyName: string;
  companyRut: string;
  companyAddress: string;
  totalKg: number;
  totalCo2: number;
  materials: Record<string, { kg: number; co2: number }>;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  // eslint-disable-next-line
  const buffer = await renderToBuffer(
    React.createElement(CertificatePDFDocument, { data }) as any
  );
  return Buffer.from(buffer);
}
