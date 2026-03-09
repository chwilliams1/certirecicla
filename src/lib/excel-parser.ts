import * as XLSX from "xlsx";
import { VALID_MATERIALS } from "./co2-calculator";

export interface ParsedRow {
  nombre_cliente: string;
  material: string;
  cantidad_kg: number;
  fecha_retiro: string;
  ubicacion: string;
}

export interface ParseResult {
  data: ParsedRow[];
  errors: string[];
}

export interface RawExcelData {
  headers: string[];
  rows: Record<string, unknown>[];
  sheetName: string;
  totalRows: number;
}

export function parseExcelRaw(buffer: ArrayBuffer): RawExcelData {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    headers,
    rows,
    sheetName,
    totalRows: rows.length,
  };
}

export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const data: ParsedRow[] = [];
  const errors: string[] = [];

  rawData.forEach((row, index) => {
    const rowNum = index + 2;

    const nombre_cliente = String(row["nombre_cliente"] || "").trim();
    const material = String(row["material"] || "").trim();
    const cantidad_kg = Number(row["cantidad_kg"]);
    const fecha_retiro = String(row["fecha_retiro"] || "").trim();
    const ubicacion = String(row["ubicacion"] || "").trim();

    if (!nombre_cliente) {
      errors.push(`Fila ${rowNum}: nombre_cliente es requerido`);
      return;
    }
    if (!material) {
      errors.push(`Fila ${rowNum}: material es requerido`);
      return;
    }
    if (!VALID_MATERIALS.includes(material)) {
      errors.push(`Fila ${rowNum}: material "${material}" no válido. Opciones: ${VALID_MATERIALS.join(", ")}`);
      return;
    }
    if (isNaN(cantidad_kg) || cantidad_kg <= 0) {
      errors.push(`Fila ${rowNum}: cantidad_kg debe ser un número positivo`);
      return;
    }
    if (!fecha_retiro) {
      errors.push(`Fila ${rowNum}: fecha_retiro es requerida`);
      return;
    }

    data.push({ nombre_cliente, material, cantidad_kg, fecha_retiro, ubicacion });
  });

  return { data, errors };
}
