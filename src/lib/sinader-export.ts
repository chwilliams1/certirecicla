import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

/* ─── LER + Treatment Mapping ─── */

interface SinaderMapping {
  ler: string;
  tratamiento: number;
}

const MATERIAL_SINADER_MAP: Record<string, SinaderMapping> = {
  "Cartón":        { ler: "15 01 01", tratamiento: 16 },
  "Papel":         { ler: "15 01 01", tratamiento: 16 },
  "Plástico PET":  { ler: "15 01 02", tratamiento: 18 },
  "Plástico HDPE": { ler: "15 01 02", tratamiento: 18 },
  "Plástico LDPE": { ler: "15 01 02", tratamiento: 18 },
  "Plástico PP":   { ler: "15 01 02", tratamiento: 18 },
  "Plástico PS":   { ler: "15 01 02", tratamiento: 18 },
  "Madera":        { ler: "15 01 03", tratamiento: 43 },
  "Aluminio":      { ler: "15 01 04", tratamiento: 20 },
  "Hierro/Acero":  { ler: "15 01 04", tratamiento: 20 },
  "Acero":         { ler: "15 01 04", tratamiento: 20 },
  "Cobre":         { ler: "15 01 04", tratamiento: 20 },
  "TetraPak":      { ler: "15 01 05", tratamiento: 16 },
  "Vidrio":        { ler: "15 01 07", tratamiento: 19 },
  "Textil":        { ler: "15 01 09", tratamiento: 17 },
  "Aceite vegetal": { ler: "13 02 08", tratamiento: 40 },
  "Aceite":        { ler: "13 02 08", tratamiento: 40 },
  "Electrónicos":  { ler: "16 02 14", tratamiento: 76 },
  "RAE":           { ler: "16 02 14", tratamiento: 76 },
  "RAEE":          { ler: "16 02 14", tratamiento: 76 },
};

const DEFAULT_SINADER: SinaderMapping = { ler: "20 01 99", tratamiento: 16 };

/* ─── Styles ─── */

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF166534" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const EVEN_ROW_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF0FDF4" },
};

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

const CANTIDAD_NUM_FMT = '#,##0.000;-#,##0.000';

/* ─── Helpers ─── */

/** Formats RUT: removes dots, keeps hyphen. "76.123.456-7" → "76123456-7" */
function formatRutSinader(rut: string | null): string {
  if (!rut) return "";
  return rut.replace(/\./g, "");
}

function styleHeaderRow(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = BORDER_STYLE;
  });
  row.height = 28;
}

function styleDataRow(row: ExcelJS.Row, index: number) {
  if (index % 2 === 1) {
    row.eachCell((cell) => { cell.fill = EVEN_ROW_FILL; });
  }
  row.eachCell((cell) => {
    cell.border = BORDER_STYLE;
    cell.alignment = { vertical: "middle" };
  });
}

/* ─── Types ─── */

export type SinaderTipo = "mensual" | "anual";

interface SinaderExportOptions {
  periodo: string; // YYYY-MM
  tipo: SinaderTipo;
}

/* ─── Main Export Function ─── */

export async function generateSinaderExport(
  companyId: string,
  options: SinaderExportOptions
): Promise<{ buffer: Buffer; filename: string; rowCount: number; manualCount: number }> {
  const { periodo, tipo } = options;
  const [yearStr, monthStr] = periodo.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const dateStart = new Date(year, month - 1, 1);
  const dateEnd = new Date(year, month, 0, 23, 59, 59);

  const records = await prisma.recyclingRecord.findMany({
    where: {
      companyId,
      pickupDate: { gte: dateStart, lte: dateEnd },
    },
    include: {
      client: { select: { name: true, rut: true, idEstablecimientoVU: true } },
      company: { select: { name: true, rut: true } },
    },
    orderBy: { pickupDate: "asc" },
  });

  // Split: clients with vs without idEstablecimientoVU
  const withVU = records.filter((r) => r.client.idEstablecimientoVU);
  const withoutVU = records.filter((r) => !r.client.idEstablecimientoVU);

  const companyName = records[0]?.company?.name || "GESTORA";
  const safeCompanyName = companyName
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();

  const wb = new ExcelJS.Workbook();
  wb.creator = "CertiRecicla";
  wb.created = new Date();

  // ─── Sheet 1: Carga SINADER ───
  const ws = wb.addWorksheet("Carga SINADER");
  let rowCount = 0;

  if (tipo === "anual") {
    rowCount = buildAnualSheet(ws, withVU, periodo);
  } else {
    rowCount = buildMensualSheet(ws, withVU);
  }

  // Freeze header
  ws.views = [{ state: "frozen", ySplit: 1, xSplit: 0, activeCell: "A2", topLeftCell: "A2" }];

  // ─── Sheet 2: Declarar Manualmente (if any records without VU) ───
  let manualCount = 0;
  if (withoutVU.length > 0) {
    const wsManual = wb.addWorksheet("Declarar Manualmente");
    manualCount = buildManualSheet(wsManual, withoutVU, tipo, periodo);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const tipoLabel = tipo.toUpperCase();
  const filename = `SINADER_${tipoLabel}_${safeCompanyName}_${periodo}.xlsx`;

  return { buffer: Buffer.from(buffer), filename, rowCount, manualCount };
}

/* ─── Anual Sheet Builder (6 columns, grouped) ─── */

function buildAnualSheet(
  ws: ExcelJS.Worksheet,
  records: RecordWithClient[],
  periodo: string
): number {
  ws.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "LER", key: "ler", width: 14 },
    { header: "RUT", key: "rut", width: 16 },
    { header: "TRATAMIENTO", key: "tratamiento", width: 16 },
    { header: "CANTIDAD", key: "cantidad", width: 16 },
    { header: "ESTABLECIMIENTO", key: "establecimiento", width: 20 },
  ];
  styleHeaderRow(ws);

  // Group by client+material
  const grouped = new Map<string, { rut: string; material: string; totalKg: number; establecimiento: string }>();
  for (const r of records) {
    const key = `${r.clientId}|${r.material}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.totalKg += r.quantityKg;
    } else {
      grouped.set(key, {
        rut: r.client.rut || "",
        material: r.material,
        totalKg: r.quantityKg,
        establecimiento: r.client.idEstablecimientoVU || "",
      });
    }
  }

  const rows = Array.from(grouped.values()).sort((a, b) =>
    a.rut.localeCompare(b.rut) || a.material.localeCompare(b.material)
  );

  rows.forEach((r, i) => {
    const mapping = MATERIAL_SINADER_MAP[r.material] || DEFAULT_SINADER;
    const toneladas = r.totalKg / 1000;

    const dataRow = ws.addRow({
      id: i + 1,
      ler: mapping.ler,
      rut: formatRutSinader(r.rut),
      tratamiento: mapping.tratamiento,
      cantidad: Math.round(toneladas * 1000) / 1000,
      establecimiento: r.establecimiento,
    });

    styleDataRow(dataRow, i);
    const cantCell = dataRow.getCell("cantidad");
    cantCell.numFmt = CANTIDAD_NUM_FMT;
    cantCell.alignment = { vertical: "middle", horizontal: "right" };
  });

  return rows.length;
}

/* ─── Mensual Sheet Builder (9 columns, per-record) ─── */

function buildMensualSheet(
  ws: ExcelJS.Worksheet,
  records: RecordWithClient[]
): number {
  ws.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "LER", key: "ler", width: 14 },
    { header: "RUT", key: "rut", width: 16 },
    { header: "TRATAMIENTO", key: "tratamiento", width: 16 },
    { header: "CANTIDAD", key: "cantidad", width: 16 },
    { header: "ESTABLECIMIENTO", key: "establecimiento", width: 20 },
    { header: "RUT TRANSPORTISTA", key: "rutTransportista", width: 20 },
    { header: "PATENTE", key: "patente", width: 14 },
    { header: "FECHA MOVIMIENTO", key: "fechaMovimiento", width: 20 },
  ];
  styleHeaderRow(ws);

  records.forEach((r, i) => {
    const mapping = MATERIAL_SINADER_MAP[r.material] || DEFAULT_SINADER;
    const toneladas = r.quantityKg / 1000;

    const dataRow = ws.addRow({
      id: i + 1,
      ler: mapping.ler,
      rut: formatRutSinader(r.client.rut),
      tratamiento: mapping.tratamiento,
      cantidad: Math.round(toneladas * 1000) / 1000,
      establecimiento: r.client.idEstablecimientoVU || "",
      rutTransportista: formatRutSinader(r.rutTransportista),
      patente: r.patente || "",
      fechaMovimiento: r.pickupDate,
    });

    styleDataRow(dataRow, i);

    const cantCell = dataRow.getCell("cantidad");
    cantCell.numFmt = CANTIDAD_NUM_FMT;
    cantCell.alignment = { vertical: "middle", horizontal: "right" };

    // Custom date format to avoid Excel locale issues
    const fechaCell = dataRow.getCell("fechaMovimiento");
    fechaCell.numFmt = 'dd"/"mm"/"yyyy';
    fechaCell.alignment = { vertical: "middle", horizontal: "center" };
  });

  return records.length;
}

/* ─── Manual Declaration Sheet (records without VU ID) ─── */

function buildManualSheet(
  ws: ExcelJS.Worksheet,
  records: RecordWithClient[],
  tipo: SinaderTipo,
  periodo: string
): number {
  ws.columns = [
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "RUT Generador", key: "rut", width: 16 },
    { header: "Material", key: "material", width: 20 },
    { header: "LER", key: "ler", width: 14 },
    { header: "TRATAMIENTO", key: "tratamiento", width: 16 },
    { header: "Cantidad (ton)", key: "cantidad", width: 16 },
    ...(tipo === "mensual"
      ? [
          { header: "Fecha", key: "fecha" as const, width: 14 },
          { header: "RUT Transportista", key: "rutTransportista" as const, width: 20 },
          { header: "Patente", key: "patente" as const, width: 14 },
        ]
      : []),
    { header: "MOTIVO", key: "motivo", width: 50 },
  ];
  styleHeaderRow(ws);

  // Add a note row explaining why these are here
  const totalCols = tipo === "mensual" ? 10 : 7;
  const noteRow = ws.insertRow(1, ["Estos clientes no tienen ID de Establecimiento en Ventanilla Única del RETC (generan menos de 12 ton/año o no están registrados). Declararlos manualmente en SINADER usando RUT 0-0."]);
  noteRow.getCell(1).font = { bold: true, italic: true, color: { argb: "FFDC2626" }, size: 11 };
  ws.mergeCells(1, 1, 1, totalCols);
  // Re-style header (now row 2)
  const headerRow = ws.getRow(2);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = BORDER_STYLE;
  });
  headerRow.height = 28;

  if (tipo === "anual") {
    // Group for anual
    const grouped = new Map<string, { clientName: string; rut: string; material: string; totalKg: number }>();
    for (const r of records) {
      const key = `${r.clientId}|${r.material}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.totalKg += r.quantityKg;
      } else {
        grouped.set(key, {
          clientName: r.client.name,
          rut: r.client.rut || "",
          material: r.material,
          totalKg: r.quantityKg,
        });
      }
    }
    const rows = Array.from(grouped.values());
    rows.forEach((r, i) => {
      const mapping = MATERIAL_SINADER_MAP[r.material] || DEFAULT_SINADER;
      const dataRow = ws.addRow({
        cliente: r.clientName,
        rut: formatRutSinader(r.rut),
        material: r.material,
        ler: mapping.ler,
        tratamiento: mapping.tratamiento,
        cantidad: Math.round((r.totalKg / 1000) * 1000) / 1000,
        motivo: "Sin ID Establecimiento VU - declarar con RUT 0-0 en SINADER",
      });
      styleDataRow(dataRow, i);
      dataRow.getCell("cantidad").numFmt = CANTIDAD_NUM_FMT;
    });
    return rows.length;
  } else {
    records.forEach((r, i) => {
      const mapping = MATERIAL_SINADER_MAP[r.material] || DEFAULT_SINADER;
      const dataRow = ws.addRow({
        cliente: r.client.name,
        rut: formatRutSinader(r.client.rut),
        material: r.material,
        ler: mapping.ler,
        tratamiento: mapping.tratamiento,
        cantidad: Math.round((r.quantityKg / 1000) * 1000) / 1000,
        fecha: r.pickupDate,
        rutTransportista: formatRutSinader(r.rutTransportista),
        patente: r.patente || "",
        motivo: "Sin ID Establecimiento VU - declarar con RUT 0-0 en SINADER",
      });
      styleDataRow(dataRow, i);
      dataRow.getCell("cantidad").numFmt = CANTIDAD_NUM_FMT;
      if (tipo === "mensual") {
        const fechaCell = dataRow.getCell("fecha");
        fechaCell.numFmt = 'dd"/"mm"/"yyyy';
      }
    });
    return records.length;
  }
}

/* ─── Type for records with client info ─── */

type RecordWithClient = {
  clientId: string;
  material: string;
  quantityKg: number;
  pickupDate: Date;
  rutTransportista: string | null;
  patente: string | null;
  client: {
    name: string;
    rut: string | null;
    idEstablecimientoVU: string | null;
  };
  company: {
    name: string;
    rut: string | null;
  };
};
