import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ReportPDFDocument } from "./report-pdf";
import type { ReportPDFData } from "./report-pdf";

export type { ReportPDFData };

export async function generateReportPdfBuffer(data: ReportPDFData): Promise<Buffer> {
  // eslint-disable-next-line
  const buffer = await renderToBuffer(
    React.createElement(ReportPDFDocument, { data }) as any
  );
  return Buffer.from(buffer);
}
