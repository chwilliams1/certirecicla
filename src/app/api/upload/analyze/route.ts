import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { hasPermission } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "upload:data")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const { headers, sampleRows, totalRows } = body as {
    headers: string[];
    sampleRows: Record<string, unknown>[];
    totalRows: number;
  };

  if (!headers || !sampleRows) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Get existing clients for context
  const clients = await prisma.client.findMany({
    where: { companyId: session.user.companyId, active: true },
    select: { name: true },
  });
  const clientNames = clients.map((c) => c.name);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Servicio de IA no disponible. Contacta al administrador." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Analiza este archivo Excel/CSV de registros de reciclaje y mapea las columnas a los campos necesarios.

## Columnas del archivo:
${JSON.stringify(headers)}

## Primeras ${sampleRows.length} filas de ejemplo:
${JSON.stringify(sampleRows.slice(0, 8), null, 2)}

## Total de filas: ${totalRows}

## IMPORTANTE: Detecta el formato del archivo
Hay dos formatos posibles:

### Formato "long" (tradicional):
Cada fila = 1 registro con UNA columna de material y UNA columna de cantidad.
Ejemplo: | Cliente | Material | Kg | Fecha |

### Formato "wide" (pivotado):
Cada fila = 1 evento de retiro con MÚLTIPLES columnas de materiales (cada columna es un tipo de material y el valor es la cantidad en kg).
Ejemplo: | Sucursal | Fecha | Status | Papel | Cartón | Vidrio | Aluminio | PET |
En este formato, las columnas de materiales contienen directamente los kg recolectados (vacío o 0 = no recolectado).

## Materiales válidos del sistema:
"Plástico PET", "Plástico HDPE", "Plástico LDPE", "Plástico PP", "Plástico PS", "Cartón", "Vidrio", "Aluminio", "Acero", "Papel", "Madera", "Electrónicos", "RAE", "TetraPak", "Textil", "Aceite vegetal", "Orgánico", "Neumáticos", "Baterías", "Escombros"

## Campos necesarios (destino):
1. **nombre_cliente**: Nombre de la empresa/cliente principal
2. **nombre_sucursal**: Nombre de la sucursal/branch (si existe una columna separada)
3. **material**: Tipo de material reciclado (uno de los válidos)
4. **cantidad_kg**: Cantidad en kilogramos (número positivo)
5. **fecha_retiro**: Fecha de retiro/recolección (formato YYYY-MM-DD)
6. **ubicacion**: Dirección o lugar de retiro (opcional)

## Clientes existentes en el sistema:
${JSON.stringify(clientNames)}

## Instrucciones:
1. **Detecta el formato**: Si varias columnas contienen valores numéricos y sus nombres se parecen a tipos de materiales (papel, cartón, vidrio, plástico, PET, HDPE, etc.), el formato es "wide". Si hay una sola columna de material y una de cantidad, es "long".
2. Para **formato wide**: identifica qué columnas son materiales y mapéalas a los materiales válidos del sistema en "materialColumns". Identifica también si hay una columna de status (completado/pendiente/fallido) para filtrar.
3. Para **formato long**: mapea las columnas como antes con "mapping.material" y "mapping.cantidad_kg".
4. Mapea los nombres de columnas para cliente, fecha y ubicación en "mapping".
5. **Detecta empresa y sucursal (CRÍTICO)**:
   - REGLA PRINCIPAL: Si hay DOS columnas de identificación, una es la EMPRESA (entidad más amplia) y la otra es la SUCURSAL (entidad más específica/local).
   - Columnas que significan EMPRESA (mapear a "nombre_cliente"): "Empresa", "Company", "Razón Social", "Cliente", "Organización", "Compañía"
   - Columnas que significan SUCURSAL (mapear a "nombre_sucursal"): "Sucursal", "Branch", "Local", "Sede", "Punto", "Tienda", "Ubicación", "Centro"
   - IMPORTANTE: "nombre_cliente" = empresa/padre (la más amplia), "nombre_sucursal" = sucursal/hijo (la más específica). NUNCA al revés.
   - Pista: si una columna tiene valores que se REPITEN mucho (ej: "RedSalud" aparece en muchas filas) y otra tiene valores más variados (ej: "Ñuñoa", "Puente Alto", "CMD Alameda"), la que se repite es la EMPRESA y la variada es la SUCURSAL.
   - Si solo hay UNA columna de identificación, mapéala a "nombre_cliente" y deja "nombre_sucursal" como null.
   - Ejemplo: columnas "Empresa" y "Sucursal" con datos como ["RedSalud", "Ñuñoa"] → nombre_cliente="Empresa", nombre_sucursal="Sucursal"
5b. **Fechas en formato chileno**: Las fechas en el archivo probablemente están en formato DD/MM/YYYY (día/mes/año, formato chileno). NO las confundas con MM/DD/YYYY. Por ejemplo, "15/03/2025" es 15 de marzo, NO 3 de mayo.
6. Para materiales, mapea nombres del archivo a materiales válidos (ej: "PET" → "Plástico PET", "HDPE" → "Plástico HDPE", "PS"/"poliestireno" → "Plástico PS", "cardboard" → "Cartón", "glass" → "Vidrio", "e-waste"/"RAEE" → "RAE", "aluminum"/"latas" → "Aluminio", "steel"/"acero" → "Acero", "paper" → "Papel", "wood"/"madera" → "Madera", "tetrapak"/"tetra pak"/"brick" → "TetraPak", "textil"/"ropa"/"tela" → "Textil", "aceite"/"oil" → "Aceite vegetal", "orgánico"/"compost"/"food" → "Orgánico", "neumáticos"/"tires" → "Neumáticos", "baterías"/"batteries"/"pilas" → "Baterías", "escombros"/"concrete"/"rubble" → "Escombros").
7. Para clientes y sucursales, si el nombre es similar a un cliente existente, usa el nombre existente exacto.
8. Si hay columnas extra que no corresponden a ningún campo, ignóralas.

## Responde SIEMPRE con JSON válido con esta estructura exacta:
{
  "format": "wide o long",
  "mapping": {
    "nombre_cliente": "nombre_columna_original_o_null",
    "nombre_sucursal": "nombre_columna_sucursal_o_null (si hay columna separada de sucursal)",
    "material": "nombre_columna_original_o_null (solo para formato long)",
    "cantidad_kg": "nombre_columna_original_o_null (solo para formato long)",
    "fecha_retiro": "nombre_columna_original_o_null",
    "ubicacion": "nombre_columna_original_o_null"
  },
  "materialColumns": {
    "nombre_columna_en_excel": "Material Válido del Sistema"
  },
  "statusFilter": {
    "column": "nombre_columna_status_o_null",
    "value": "valor_que_indica_completado (ej: completado)"
  },
  "materialMapping": {
    "valor_original_1": "Material Válido (solo para formato long)"
  },
  "clientMapping": {
    "nombre_en_excel": "nombre_correcto_o_existente"
  },
  "confidence": 0.95,
  "summary": "Descripción breve de lo que se encontró, incluyendo el formato detectado",
  "warnings": ["advertencia1", "advertencia2"],
  "unmappedColumns": ["columna_ignorada_1"]
}

NOTAS:
- "materialColumns" solo se usa en formato "wide". Debe mapear CADA columna de material del Excel a un material válido del sistema.
- "statusFilter" solo se incluye si existe una columna de status. "value" es el valor que indica que el retiro fue completado (case-insensitive).
- Para formato "long", usa "mapping.material" y "mapping.cantidad_kg" como antes. "materialColumns" debe ser un objeto vacío {}.
- Para formato "wide", "mapping.material" y "mapping.cantidad_kg" deben ser null ya que los datos vienen de las columnas de materiales.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo analizar la respuesta de IA" }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "Respuesta de IA inválida. Intenta de nuevo." }, { status: 500 });
    }

    // Programmatic post-AI correction for empresa/sucursal columns
    // The AI sometimes ignores explicit column names, so we force-correct the mapping
    const empresaKeywords = ["empresa", "company", "razón social", "compañía", "organización", "razon social"];
    const sucursalKeywords = ["sucursal", "branch", "local", "sede", "punto", "tienda", "centro"];

    const empresaCol = headers.find((h: string) => empresaKeywords.includes(h.toLowerCase().trim()));
    const sucursalCol = headers.find((h: string) => sucursalKeywords.includes(h.toLowerCase().trim()));

    if (empresaCol && sucursalCol) {
      // Both exist: empresa = parent (nombre_cliente), sucursal = child (nombre_sucursal)
      analysis.mapping.nombre_cliente = empresaCol;
      analysis.mapping.nombre_sucursal = sucursalCol;
    } else if (empresaCol && !sucursalCol) {
      // Only empresa: it's the main client
      analysis.mapping.nombre_cliente = empresaCol;
    } else if (!empresaCol && sucursalCol) {
      // Only sucursal without empresa: treat as main client
      if (!analysis.mapping.nombre_cliente) {
        analysis.mapping.nombre_cliente = sucursalCol;
        analysis.mapping.nombre_sucursal = null;
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Error al analizar con IA. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
