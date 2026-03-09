import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { hasPermission } from "@/lib/roles";

// POST /api/clients/import?action=analyze | import
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "clients:create")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const action = new URL(req.url).searchParams.get("action");
  const companyId = session.user.companyId;

  if (action === "analyze") {
    return handleAnalyze(req, companyId);
  }

  return handleImport(req, companyId);
}

async function handleAnalyze(req: NextRequest, companyId: string) {
  const body = await req.json();
  const { headers, sampleRows } = body as {
    headers: string[];
    sampleRows: Record<string, unknown>[];
  };

  if (!headers || !sampleRows) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Get existing clients for context
  const existingClients = await prisma.client.findMany({
    where: { companyId, active: true },
    select: { name: true, parentClientId: true },
  });
  const clientNames = existingClients.map((c) => c.name);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Servicio de IA no disponible. Contacta al administrador." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Analiza este archivo Excel/CSV que contiene datos de clientes y mapea las columnas a los campos del sistema.

## Columnas del archivo:
${JSON.stringify(headers)}

## Primeras filas de ejemplo:
${JSON.stringify(sampleRows.slice(0, 10), null, 2)}

## Campos del sistema de clientes:
1. **nombre** (REQUERIDO): Nombre del cliente/empresa
2. **sucursal**: Nombre de sucursal/branch/sede (si existe columna separada)
3. **rut**: RUT o identificador tributario del cliente
4. **email**: Correo electrónico del contacto
5. **telefono**: Número de teléfono
6. **direccion**: Dirección física
7. **contacto**: Nombre de la persona de contacto
8. **notas**: Notas adicionales

## Clientes existentes en el sistema:
${JSON.stringify(clientNames)}

## Instrucciones:
1. Mapea cada columna del Excel al campo correspondiente del sistema.
2. Si hay una columna de empresa/cliente principal Y una de sucursal/sede/local, mapéalas por separado.
3. Si un nombre de cliente del Excel es similar a uno existente, incluye la corrección en clientMapping.
4. Identifica qué campos críticos FALTAN en el archivo (email, rut son necesarios para certificados).

## Responde con JSON exacto:
{
  "mapping": {
    "nombre": "columna_original_o_null",
    "sucursal": "columna_original_o_null",
    "rut": "columna_original_o_null",
    "email": "columna_original_o_null",
    "telefono": "columna_original_o_null",
    "direccion": "columna_original_o_null",
    "contacto": "columna_original_o_null",
    "notas": "columna_original_o_null"
  },
  "clientMapping": {
    "nombre_en_excel": "nombre_existente_correcto"
  },
  "missingFields": ["email", "rut"],
  "confidence": 0.95,
  "summary": "Breve descripción",
  "warnings": []
}

NOTAS:
- "missingFields" debe listar campos importantes que NO están en el archivo (email y rut son críticos para certificados).
- Si no hay columna de sucursal, deja "sucursal" como null.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo analizar la respuesta" }, { status: 500 });
    }

    try {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    } catch {
      return NextResponse.json({ error: "Respuesta de IA inválida" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Error al analizar con IA" }, { status: 500 });
  }
}

async function handleImport(req: NextRequest, companyId: string) {
  const body = await req.json();
  const { clients: clientsData } = body as {
    clients: Array<{
      nombre: string;
      sucursal?: string;
      rut?: string;
      email?: string;
      telefono?: string;
      direccion?: string;
      contacto?: string;
      notas?: string;
    }>;
  };

  if (!clientsData || clientsData.length === 0) {
    return NextResponse.json({ error: "No hay clientes para importar" }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const parentCache = new Map<string, string>();

  for (const row of clientsData) {
    if (!row.nombre) {
      skipped++;
      continue;
    }

    let parentId: string | undefined;

    // If there's a sucursal, find/create parent first
    if (row.sucursal) {
      const cachedParentId = parentCache.get(row.nombre);
      if (cachedParentId) {
        parentId = cachedParentId;
      } else {
        let parent = await prisma.client.findFirst({
          where: { name: row.nombre, companyId, parentClientId: null },
        });
        if (!parent) {
          parent = await prisma.client.create({
            data: { name: row.nombre, companyId },
          });
          created++;
        }
        parentId = parent.id;
        parentCache.set(row.nombre, parentId);
      }
    }

    const clientName = row.sucursal || row.nombre;
    const where = parentId
      ? { name: clientName, companyId, parentClientId: parentId }
      : { name: clientName, companyId, parentClientId: null };

    const existing = await prisma.client.findFirst({ where });

    if (existing) {
      // Update with new data if fields were empty
      const updates: Record<string, string> = {};
      if (row.rut && !existing.rut) updates.rut = row.rut;
      if (row.email && !existing.email) updates.email = row.email;
      if (row.telefono && !existing.phone) updates.phone = row.telefono;
      if (row.direccion && !existing.address) updates.address = row.direccion;
      if (row.contacto && !existing.contactName) updates.contactName = row.contacto;

      if (Object.keys(updates).length > 0) {
        await prisma.client.update({ where: { id: existing.id }, data: updates });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await prisma.client.create({
        data: {
          name: clientName,
          companyId,
          rut: row.rut || null,
          email: row.email || null,
          phone: row.telefono || null,
          address: row.direccion || null,
          contactName: row.contacto || null,
          notes: row.notas || null,
          parentClientId: parentId || null,
        },
      });
      created++;
    }
  }

  return NextResponse.json({ created, updated, skipped });
}
