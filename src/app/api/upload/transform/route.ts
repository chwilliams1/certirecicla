import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VALID_MATERIALS } from "@/lib/co2-calculator";

interface ColumnMapping {
  nombre_cliente: string | null;
  nombre_sucursal: string | null;
  material: string | null;
  cantidad_kg: string | null;
  fecha_retiro: string | null;
  ubicacion: string | null;
}

interface TransformRecord {
  nombre_cliente: string;
  nombre_sucursal: string;
  material: string;
  cantidad_kg: number;
  fecha_retiro: string;
  ubicacion: string;
}

function parseDate(rawDate: string): string | null {
  if (!rawDate) return null;
  // YYYY-MM-DD (ISO)
  if (rawDate.match(/^\d{4}-\d{2}-\d{2}/)) return rawDate.slice(0, 10);
  // DD/MM/YYYY or DD-MM-YYYY (Chilean format)
  const dmy = rawDate.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // DD/MM/YY
  const dmy2 = rawDate.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})$/);
  if (dmy2) {
    const [, day, month, shortYear] = dmy2;
    const year = parseInt(shortYear) > 50 ? `19${shortYear}` : `20${shortYear}`;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Excel serial number (days since 1900-01-01)
  const serial = parseFloat(rawDate);
  if (!isNaN(serial) && serial > 40000 && serial < 60000) {
    const date = new Date((serial - 25569) * 86400000);
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  // Fallback: try native parsing
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function parseQuantity(raw: unknown): number {
  return parseFloat(String(raw).replace(/[^\d.,]/g, "").replace(",", "."));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    rows,
    mapping,
    materialMapping,
    clientMapping,
    format,
    materialColumns,
    statusFilter,
  } = body as {
    rows: Record<string, unknown>[];
    mapping: ColumnMapping;
    materialMapping: Record<string, string>;
    clientMapping: Record<string, string>;
    format?: "wide" | "long";
    materialColumns?: Record<string, string>;
    statusFilter?: { column: string; value: string };
  };

  if (!rows || !mapping) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const transformed: TransformRecord[] = [];
  const errors: string[] = [];

  if (format === "wide" && materialColumns && Object.keys(materialColumns).length > 0) {
    // Wide format: unpivot material columns into individual records
    rows.forEach((row, index) => {
      const rowNum = index + 2;

      // Filter by status if configured
      if (statusFilter?.column && statusFilter?.value) {
        const rowStatus = String(row[statusFilter.column] || "").trim().toLowerCase();
        if (rowStatus !== statusFilter.value.toLowerCase()) {
          return; // Skip non-completed rows silently
        }
      }

      // Extract shared fields
      const rawClient = mapping.nombre_cliente ? String(row[mapping.nombre_cliente] || "").trim() : "";
      const rawSucursal = mapping.nombre_sucursal ? String(row[mapping.nombre_sucursal] || "").trim() : "";
      const rawDate = mapping.fecha_retiro ? String(row[mapping.fecha_retiro] || "").trim() : "";
      const rawLocation = mapping.ubicacion ? String(row[mapping.ubicacion] || "").trim() : "";

      const nombre_cliente = clientMapping?.[rawClient] || rawClient;
      const nombre_sucursal = rawSucursal ? (clientMapping?.[rawSucursal] || rawSucursal) : "";
      if (!nombre_cliente && !nombre_sucursal) {
        errors.push(`Fila ${rowNum}: No se pudo identificar el cliente`);
        return;
      }

      const fecha_retiro = parseDate(rawDate);
      if (!fecha_retiro) {
        errors.push(`Fila ${rowNum}: No se pudo identificar la fecha`);
        return;
      }

      // Unpivot: iterate each material column
      for (const [excelCol, validMaterial] of Object.entries(materialColumns)) {
        const rawValue = row[excelCol];
        if (rawValue === null || rawValue === undefined || rawValue === "") continue;

        const cantidad_kg = parseQuantity(rawValue);
        if (isNaN(cantidad_kg) || cantidad_kg <= 0) continue; // Skip empty/zero materials silently

        if (!VALID_MATERIALS.includes(validMaterial)) {
          errors.push(`Fila ${rowNum}: Material "${validMaterial}" no es un tipo válido del sistema`);
          continue;
        }

        transformed.push({
          nombre_cliente,
          nombre_sucursal,
          material: validMaterial,
          cantidad_kg,
          fecha_retiro,
          ubicacion: rawLocation,
        });
      }
    });
  } else {
    // Long format: 1 row = 1 record (original logic)
    rows.forEach((row, index) => {
      const rowNum = index + 2;

      const rawClient = mapping.nombre_cliente ? String(row[mapping.nombre_cliente] || "").trim() : "";
      const rawSucursal = mapping.nombre_sucursal ? String(row[mapping.nombre_sucursal] || "").trim() : "";
      const rawMaterial = mapping.material ? String(row[mapping.material] || "").trim() : "";
      const rawQuantity = mapping.cantidad_kg ? row[mapping.cantidad_kg] : null;
      const rawDate = mapping.fecha_retiro ? String(row[mapping.fecha_retiro] || "").trim() : "";
      const rawLocation = mapping.ubicacion ? String(row[mapping.ubicacion] || "").trim() : "";

      const nombre_cliente = clientMapping?.[rawClient] || rawClient;
      const nombre_sucursal = rawSucursal ? (clientMapping?.[rawSucursal] || rawSucursal) : "";
      if (!nombre_cliente && !nombre_sucursal) {
        errors.push(`Fila ${rowNum}: No se pudo identificar el cliente`);
        return;
      }

      const material = materialMapping?.[rawMaterial] || rawMaterial;
      if (!VALID_MATERIALS.includes(material)) {
        errors.push(`Fila ${rowNum}: Material "${rawMaterial}" no se pudo mapear a un tipo válido`);
        return;
      }

      const cantidad_kg = parseQuantity(rawQuantity);
      if (isNaN(cantidad_kg) || cantidad_kg <= 0) {
        errors.push(`Fila ${rowNum}: Cantidad "${rawQuantity}" no es un número válido`);
        return;
      }

      const fecha_retiro = parseDate(rawDate);
      if (!fecha_retiro) {
        errors.push(`Fila ${rowNum}: No se pudo identificar la fecha`);
        return;
      }

      transformed.push({
        nombre_cliente,
        nombre_sucursal,
        material,
        cantidad_kg,
        fecha_retiro,
        ubicacion: rawLocation,
      });
    });
  }

  return NextResponse.json({ data: transformed, errors, totalProcessed: rows.length });
}
