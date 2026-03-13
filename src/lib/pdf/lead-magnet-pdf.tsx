import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Branding
// ---------------------------------------------------------------------------
const C = {
  primary: "#4a6b4e",
  primaryLight: "#7c9a82",
  primaryBg: "#f4f7f4",
  dark: "#2d3a2e",
  border: "#d4e4d6",
  gray: "#888888",
  white: "#ffffff",
} as const;

const FONT = "Helvetica";
const BOLD = "Helvetica-Bold";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: FONT,
    fontSize: 9,
    color: C.dark,
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 8,
    backgroundColor: C.primary,
  },
  watermark: {
    position: "absolute",
    top: "35%",
    left: "10%",
    fontSize: 54,
    fontFamily: BOLD,
    color: C.dark,
    opacity: 0.04,
    transform: "rotate(-45deg)",
  },
  content: {
    paddingTop: 35,
    paddingBottom: 60,
    paddingLeft: 48,
    paddingRight: 40,
  },
  // Cover
  coverContent: {
    paddingTop: 140,
    paddingBottom: 60,
    paddingLeft: 48,
    paddingRight: 40,
    flex: 1,
    justifyContent: "space-between",
  },
  logo: { width: 50, height: 50, objectFit: "contain" as const },
  coverTitle: {
    fontSize: 24,
    fontFamily: BOLD,
    color: C.primary,
    marginTop: 28,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 11,
    color: C.gray,
    marginTop: 12,
    lineHeight: 1.5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: C.primary,
    marginTop: 24,
    borderRadius: 2,
  },
  coverFooter: { marginTop: "auto" },
  coverFooterText: { fontSize: 8, color: C.gray },
  // Content pages
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 40,
    fontSize: 8,
    color: C.gray,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: BOLD,
    color: C.primary,
    marginBottom: 10,
    marginTop: 18,
  },
  subsectionTitle: {
    fontSize: 11,
    fontFamily: BOLD,
    color: C.dark,
    marginBottom: 6,
    marginTop: 14,
  },
  body: {
    fontSize: 9,
    color: C.dark,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  // Numbered badge item
  numberedRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 1,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: BOLD,
    color: C.primary,
  },
  numberedContent: { flex: 1 },
  numberedTitle: {
    fontSize: 9,
    fontFamily: BOLD,
    color: C.dark,
    marginBottom: 2,
  },
  numberedDesc: {
    fontSize: 8.5,
    color: C.gray,
    lineHeight: 1.5,
  },
  // Tables
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: BOLD,
    color: C.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: C.primaryBg,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableCell: {
    fontSize: 8,
    color: C.dark,
  },
  // Tip box
  tipBox: {
    backgroundColor: C.primaryBg,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    padding: 12,
    marginVertical: 12,
    borderRadius: 4,
  },
  tipTitle: {
    fontSize: 9,
    fontFamily: BOLD,
    color: C.primary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 8.5,
    color: C.dark,
    lineHeight: 1.5,
  },
  // Stat highlight
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: BOLD,
    color: C.primary,
  },
  statLabel: {
    fontSize: 7,
    color: C.gray,
    marginTop: 2,
  },
  // Back page CTA
  ctaBox: {
    backgroundColor: C.primary,
    borderRadius: 8,
    padding: 30,
    marginTop: 60,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: BOLD,
    color: C.white,
    marginBottom: 10,
    textAlign: "center",
  },
  ctaDesc: {
    fontSize: 10,
    color: "#c8daca",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 16,
    maxWidth: 360,
  },
  ctaUrl: {
    fontSize: 14,
    fontFamily: BOLD,
    color: C.white,
    marginBottom: 6,
  },
  ctaButton: {
    backgroundColor: C.white,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 8,
  },
  ctaButtonText: {
    fontSize: 10,
    fontFamily: BOLD,
    color: C.primary,
  },
});

// ---------------------------------------------------------------------------
// Reusable components
// ---------------------------------------------------------------------------

function AccentBar() {
  return <View style={s.accentBar} />;
}

function Watermark() {
  return <Text style={s.watermark}>CertiRecicla</Text>;
}

function PageNum({ n }: { n: number }) {
  return <Text style={s.pageNumber}>{n}</Text>;
}

function CoverPage({
  logo,
  title,
  subtitle,
}: {
  logo: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <AccentBar />
      <Watermark />
      <View style={s.coverContent}>
        <View>
          <Image src={logo} style={s.logo} />
          <Text style={s.coverTitle}>{title}</Text>
          <Text style={s.coverSubtitle}>{subtitle}</Text>
          <View style={s.divider} />
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>
            CertiRecicla — certirecicla.cl
          </Text>
          <Text style={[s.coverFooterText, { marginTop: 4 }]}>
            Guía gratuita · Marzo 2026
          </Text>
        </View>
      </View>
    </Page>
  );
}

function ContentPage({
  children,
  pageNum,
}: {
  children: React.ReactNode;
  pageNum: number;
}) {
  return (
    <Page size="A4" style={s.page} wrap>
      <AccentBar />
      <View style={s.content}>{children}</View>
      <PageNum n={pageNum} />
    </Page>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function SubsectionTitle({ children }: { children: string }) {
  return <Text style={s.subsectionTitle}>{children}</Text>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <Text style={s.body}>{children}</Text>;
}

function NumberedItem({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <View style={s.numberedRow} wrap={false}>
      <View style={s.badge}>
        <Text style={s.badgeText}>{n}</Text>
      </View>
      <View style={s.numberedContent}>
        <Text style={s.numberedTitle}>{title}</Text>
        <Text style={s.numberedDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function TableRow({
  cells,
  widths,
  isHeader,
  isAlt,
}: {
  cells: string[];
  widths: number[];
  isHeader?: boolean;
  isAlt?: boolean;
}) {
  const rowStyle = isHeader
    ? s.tableHeader
    : isAlt
      ? s.tableRowAlt
      : s.tableRow;
  const cellStyle = isHeader ? s.tableHeaderCell : s.tableCell;

  return (
    <View style={rowStyle} wrap={false}>
      {cells.map((c, i) => (
        <Text key={i} style={[cellStyle, { width: `${widths[i]}%` }]}>
          {c}
        </Text>
      ))}
    </View>
  );
}

function TipBox({ title, text }: { title: string; text: string }) {
  return (
    <View style={s.tipBox} wrap={false}>
      <Text style={s.tipTitle}>{title}</Text>
      <Text style={s.tipText}>{text}</Text>
    </View>
  );
}

function BackPage({ logo }: { logo: string }) {
  return (
    <Page size="A4" style={s.page}>
      <AccentBar />
      <View
        style={[
          s.content,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Image src={logo} style={{ width: 40, height: 40, marginBottom: 20 }} />
        <View style={s.ctaBox}>
          <Text style={s.ctaTitle}>¿Necesitas automatizar esto?</Text>
          <Text style={s.ctaDesc}>
            CertiRecicla es la plataforma chilena que digitaliza la gestión de
            residuos: trazabilidad completa, certificados PDF con CO₂
            verificable, exportación a SINADER y dashboard de impacto ambiental.
          </Text>
          <Text style={s.ctaUrl}>certirecicla.cl</Text>
          <View style={s.ctaButton}>
            <Text style={s.ctaButtonText}>Prueba gratis 14 días</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// ===========================================================================
// GUIDE 1: Checklist Ley REP
// ===========================================================================
function ChecklistLeyRep({ logo }: { logo: string }) {
  return (
    <Document>
      <CoverPage
        logo={logo}
        title="Checklist: 10 Pasos para Cumplir la Ley REP"
        subtitle="La guía práctica para que tu empresa cumpla con la Responsabilidad Extendida del Productor en Chile. Incluye plazos 2026, checklist de documentos y errores frecuentes que cuestan multas."
      />

      {/* Page 2 */}
      <ContentPage pageNum={2}>
        <SectionTitle>¿Por qué la Ley REP es urgente?</SectionTitle>
        <Body>
          La Ley 20.920 de Responsabilidad Extendida del Productor (REP) obliga
          a productores e importadores de productos prioritarios a financiar la
          gestión de residuos que estos generan. Las metas de recolección y
          valorización son progresivas y las multas por incumplimiento pueden
          alcanzar las 10.000 UTA (más de $7.000 millones CLP). La
          Superintendencia del Medio Ambiente (SMA) ya comenzó a fiscalizar
          activamente. No cumplir no es una opción.
        </Body>

        <SectionTitle>Los 10 pasos esenciales</SectionTitle>

        <NumberedItem
          n={1}
          title="Identifica si eres productor, importador o gestora afectada"
          desc="La ley aplica a quienes introducen al mercado productos prioritarios: envases y embalajes, neumáticos, aparatos eléctricos y electrónicos, baterías, aceites lubricantes y pilas. Si importas o fabricas estos productos, estás obligado."
        />
        <NumberedItem
          n={2}
          title="Determina qué productos prioritarios te aplican"
          desc="Revisa las 6 categorías: envases y embalajes, neumáticos, electrónicos (RAEE), baterías, aceites lubricantes y pilas. Muchas empresas descubren que les aplica más de una categoría."
        />
        <NumberedItem
          n={3}
          title="Inscríbete en un Sistema de Gestión"
          desc="Puedes cumplir de forma colectiva (uniéndote a un Sistema de Gestión autorizado por el MMA) o individual. La opción colectiva es más económica para la mayoría de empresas medianas."
        />
        <NumberedItem
          n={4}
          title="Registra tu empresa en el RETC"
          desc="El Registro de Emisiones y Transferencias de Contaminantes es obligatorio. Ingresa a retc.mma.gob.cl y completa tu perfil con los datos de residuos generados."
        />
        <NumberedItem
          n={5}
          title="Implementa un sistema de trazabilidad"
          desc="Necesitas demostrar el recorrido de tus residuos desde la generación hasta el destino final: reciclaje, valorización o disposición. Esto incluye pesajes, guías de despacho y certificados."
        />
      </ContentPage>

      {/* Page 3 */}
      <ContentPage pageNum={3}>
        <NumberedItem
          n={6}
          title="Contrata gestoras autorizadas con certificados verificables"
          desc="Asegúrate de que tus gestoras estén inscritas en el Registro de gestores del MMA y que emitan certificados con datos verificables: peso, tipo de material, destino y fecha."
        />
        <NumberedItem
          n={7}
          title="Declara tus residuos en SINADER dentro de los plazos"
          desc="El Sistema Nacional de Declaración de Residuos (SINADER) exige declaración anual. El plazo es el 31 de marzo de cada año para residuos del año anterior. Las declaraciones tardías generan sanciones."
        />
        <NumberedItem
          n={8}
          title="Documenta todo: certificados, guías de despacho, pesajes"
          desc="La SMA puede solicitar documentación de los últimos 5 años. Mantén un archivo digital organizado con certificados de reciclaje, guías de despacho, boletas de pesaje y contratos con gestoras."
        />
        <NumberedItem
          n={9}
          title="Prepárate para fiscalizaciones de la SMA"
          desc="La SMA realiza fiscalizaciones presenciales y documentales. Ten preparado un responsable ambiental, acceso rápido a documentación y registros de capacitación del personal."
        />
        <NumberedItem
          n={10}
          title="Implementa mejora continua: revisa metas anuales"
          desc="Las metas de la Ley REP son progresivas. Cada año aumentan los porcentajes de recolección y valorización. Revisa el decreto de metas de tu producto prioritario y planifica con anticipación."
        />

        <SectionTitle>Plazos clave 2026</SectionTitle>
        <TableRow
          cells={["Producto prioritario", "Meta reciclaje", "Fecha límite"]}
          widths={[40, 30, 30]}
          isHeader
        />
        <TableRow
          cells={["Envases y embalajes", "23% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
        />
        <TableRow
          cells={["Neumáticos", "50% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
          isAlt
        />
        <TableRow
          cells={["Electrónicos (RAEE)", "15% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
        />
        <TableRow
          cells={["Baterías", "30% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
          isAlt
        />
        <TableRow
          cells={["Aceites lubricantes", "45% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
        />
        <TableRow
          cells={["Pilas", "10% recolección", "31 dic 2026"]}
          widths={[40, 30, 30]}
          isAlt
        />
      </ContentPage>

      {/* Page 4 */}
      <ContentPage pageNum={4}>
        <TipBox
          title="⚠ Errores que cuestan multas"
          text="1. No inscribirse en un Sistema de Gestión antes de la fecha límite. 2. Declarar en SINADER fuera de plazo (después del 31 de marzo). 3. No conservar certificados de reciclaje originales. 4. Contratar gestoras no autorizadas. 5. No segregar residuos peligrosos de no peligrosos. La SMA puede imponer multas de hasta 10.000 UTA y la publicación de la infracción."
        />

        <SectionTitle>Checklist resumen</SectionTitle>
        <Body>
          ☐ Identificar si aplica la Ley REP a mi empresa{"\n"}
          ☐ Determinar productos prioritarios aplicables{"\n"}
          ☐ Inscribirse en Sistema de Gestión (colectivo o individual){"\n"}
          ☐ Registrar empresa en RETC{"\n"}
          ☐ Implementar sistema de trazabilidad{"\n"}
          ☐ Contratar gestoras autorizadas{"\n"}
          ☐ Declarar residuos en SINADER (antes del 31 marzo){"\n"}
          ☐ Organizar archivo de certificados y documentos{"\n"}
          ☐ Designar responsable para fiscalizaciones SMA{"\n"}
          ☐ Revisar metas anuales y planificar mejora continua
        </Body>
      </ContentPage>

      <BackPage logo={logo} />
    </Document>
  );
}

// ===========================================================================
// GUIDE 2: Clasificación de Residuos Industriales
// ===========================================================================
function GuiaClasificacion({ logo }: { logo: string }) {
  return (
    <Document>
      <CoverPage
        logo={logo}
        title="Guía Rápida: Clasificación de Residuos Industriales en Chile"
        subtitle="Aprende a clasificar correctamente tus residuos industriales según la normativa chilena. Incluye tabla de categorías, características DS 148, árbol de decisión y requisitos de almacenamiento."
      />

      {/* Page 2 */}
      <ContentPage pageNum={2}>
        <SectionTitle>¿Por qué importa clasificar correctamente?</SectionTitle>
        <Body>
          Una clasificación incorrecta de residuos industriales puede resultar en
          multas de la SMA, contaminación cruzada que impide el reciclaje,
          sobrecostos por tratar residuos no peligrosos como peligrosos, y
          riesgos legales si un residuo peligroso se gestiona como no peligroso.
          La normativa chilena (DS 148, Ley 20.920) establece categorías claras
          que toda empresa debe conocer.
        </Body>

        <SectionTitle>Categorías de residuos industriales</SectionTitle>
        <TableRow
          cells={["Categoría", "Descripción", "Ejemplos"]}
          widths={[22, 40, 38]}
          isHeader
        />
        <TableRow
          cells={[
            "No peligrosos",
            "Sin características de peligrosidad. Pueden reciclarse o ir a relleno sanitario.",
            "Cartón, plástico limpio, madera, chatarra metálica",
          ]}
          widths={[22, 40, 38]}
        />
        <TableRow
          cells={[
            "Peligrosos (RESPEL)",
            "Presentan al menos una característica DS 148. Requieren gestión especial.",
            "Aceites usados, solventes, baterías ácidas, RAEE",
          ]}
          widths={[22, 40, 38]}
          isAlt
        />
        <TableRow
          cells={[
            "Asimilables",
            "De origen industrial pero similares a domiciliarios. Gestión simplificada.",
            "Restos de comida de casino, papel oficina, envases limpios",
          ]}
          widths={[22, 40, 38]}
        />
        <TableRow
          cells={[
            "Inertes",
            "No reaccionan química ni biológicamente. Muy baja peligrosidad.",
            "Escombros, hormigón, vidrio plano, cerámica",
          ]}
          widths={[22, 40, 38]}
          isAlt
        />

        <SectionTitle>Características de peligrosidad (DS 148)</SectionTitle>
        <Body>
          El Decreto Supremo 148 define 5 características que hacen a un residuo
          peligroso. Un residuo es RESPEL si presenta al menos una:
        </Body>

        <NumberedItem
          n={1}
          title="Tóxico"
          desc="Capaz de causar daño a la salud humana o al medio ambiente por exposición. Incluye toxicidad aguda, crónica y ecotoxicidad. Se verifica con ensayos TCLP o bioensayos."
        />
        <NumberedItem
          n={2}
          title="Reactivo"
          desc="Inestable, reacciona violentamente con agua, genera gases tóxicos o es explosivo en condiciones normales de gestión. Ejemplo: residuos de peróxidos, metales alcalinos."
        />
        <NumberedItem
          n={3}
          title="Inflamable"
          desc="Punto de inflamación menor a 60°C, o es un oxidante, o un gas comprimido inflamable. Ejemplo: solventes usados, trapos con combustible, aerosoles."
        />
      </ContentPage>

      {/* Page 3 */}
      <ContentPage pageNum={3}>
        <NumberedItem
          n={4}
          title="Corrosivo"
          desc="pH menor a 2 o mayor a 12.5, o corroe acero a más de 6.35 mm/año. Ejemplo: ácido de baterías, soluciones cáusticas, decapantes."
        />
        <NumberedItem
          n={5}
          title="Ecotóxico"
          desc="Causa daño al medio ambiente acuático o terrestre. Se evalúa con bioensayos (Daphnia magna, semillas). Ejemplo: plaguicidas, metales pesados en concentración."
        />

        <SectionTitle>Árbol de decisión: ¿Cómo clasificar tu residuo?</SectionTitle>
        <NumberedItem
          n={1}
          title="¿Está en las listas del DS 148 (Anexos I y II)?"
          desc="Si aparece en las listas de residuos peligrosos, es RESPEL directamente. No requiere análisis adicional."
        />
        <NumberedItem
          n={2}
          title="¿Presenta alguna característica de peligrosidad?"
          desc="Si no está en las listas, evalúa si es tóxico, reactivo, inflamable, corrosivo o ecotóxico. Si sí → RESPEL."
        />
        <NumberedItem
          n={3}
          title="¿Es similar a un residuo domiciliario?"
          desc="Si proviene de oficinas, casinos o áreas similares y no tiene peligrosidad → Asimilable a domiciliario."
        />
        <NumberedItem
          n={4}
          title="¿Es inerte?"
          desc="Si no reacciona química ni biológicamente (escombros, áridos) → Inerte. Puede ir a sitios de disposición de inertes."
        />
        <NumberedItem
          n={5}
          title="Residuo industrial no peligroso"
          desc="Si no es RESPEL ni inerte ni asimilable, es un residuo industrial no peligroso. Puede reciclarse o ir a relleno sanitario autorizado."
        />

        <SectionTitle>Residuos comunes por sector industrial</SectionTitle>
        <TableRow
          cells={["Sector", "Residuos principales", "Clasificación típica"]}
          widths={[22, 45, 33]}
          isHeader
        />
        <TableRow
          cells={[
            "Minería",
            "Relaves, neumáticos OTR, aceites, baterías, chatarra",
            "RESPEL + No peligrosos",
          ]}
          widths={[22, 45, 33]}
        />
        <TableRow
          cells={[
            "Retail",
            "Cartón, plástico film, pallets, RAEE de tiendas",
            "No peligrosos + RAEE",
          ]}
          widths={[22, 45, 33]}
          isAlt
        />
        <TableRow
          cells={[
            "Alimentaria",
            "Orgánicos, envases, aceites cocina, plástico",
            "Asimilable + No pelig.",
          ]}
          widths={[22, 45, 33]}
        />
        <TableRow
          cells={[
            "Construcción",
            "Escombros, maderas, metales, pinturas, solventes",
            "Inertes + RESPEL",
          ]}
          widths={[22, 45, 33]}
          isAlt
        />
      </ContentPage>

      {/* Page 4 */}
      <ContentPage pageNum={4}>
        <TipBox
          title="💡 ¿Cuándo necesitas un laboratorio RESPEL?"
          text="Debes realizar análisis de laboratorio cuando: (1) el residuo no aparece en las listas del DS 148, (2) sospechas que puede tener características de peligrosidad, (3) un residuo cambia de proceso productivo, (4) una fiscalización lo requiere. Laboratorios acreditados por el INN (SAG) realizan ensayos TCLP, pH, punto de inflamación y bioensayos. Costo típico: $150.000–$500.000 CLP por muestra."
        />

        <SectionTitle>Requisitos de almacenamiento</SectionTitle>
        <Body>
          El DS 148 exige condiciones específicas de almacenamiento para RESPEL:
        </Body>
        <Body>
          • Bodega techada, ventilada y con piso impermeable{"\n"}
          • Pretil de contención (110% del envase mayor){"\n"}
          • Señalización con rombos NFPA o GHS{"\n"}
          • Incompatibilidades químicas respetadas (separar ácidos de bases, oxidantes de inflamables){"\n"}
          • Registro de ingreso/salida con fechas y cantidades{"\n"}
          • Almacenamiento máximo: 6 meses (ampliable a 12 con autorización){"\n"}
          • Plan de emergencia y kit de contención de derrames
        </Body>

        <Body>
          Los residuos no peligrosos también deben almacenarse de forma ordenada,
          evitando mezclas que contaminen materiales reciclables (ej.: cartón
          mojado pierde valor).
        </Body>
      </ContentPage>

      <BackPage logo={logo} />
    </Document>
  );
}

// ===========================================================================
// GUIDE 3: Auditoría Ambiental ISO 14001
// ===========================================================================
function ChecklistAuditoria({ logo }: { logo: string }) {
  return (
    <Document>
      <CoverPage
        logo={logo}
        title="Checklist: Preparar una Auditoría Ambiental ISO 14001"
        subtitle="Los 12 puntos que el auditor revisará en tu sistema de gestión de residuos. Prepárate con esta guía y evita no conformidades. Incluye tabla de documentos y errores comunes."
      />

      {/* Page 2 */}
      <ContentPage pageNum={2}>
        <SectionTitle>¿Qué buscan los auditores?</SectionTitle>
        <Body>
          Una auditoría ISO 14001 evalúa si tu Sistema de Gestión Ambiental
          (SGA) es efectivo, está documentado y mejora continuamente. En
          gestión de residuos, los auditores buscan evidencia objetiva de que
          los residuos se identifican, clasifican, almacenan, transportan y
          disponen correctamente, con trazabilidad completa y cumplimiento
          legal verificable.
        </Body>

        <SectionTitle>Los 12 puntos de la auditoría</SectionTitle>

        <NumberedItem
          n={1}
          title="Política ambiental documentada y comunicada"
          desc="Debe estar firmada por la alta dirección, ser apropiada a la naturaleza del negocio, incluir compromiso de mejora continua y prevención, y estar comunicada a todo el personal."
        />
        <NumberedItem
          n={2}
          title="Aspectos ambientales significativos identificados"
          desc="Debes tener una matriz de aspectos ambientales actualizada. Para residuos: tipos generados, volúmenes, peligrosidad y destino. Incluir condiciones normales, anormales y de emergencia."
        />
        <NumberedItem
          n={3}
          title="Requisitos legales mapeados"
          desc="Lista actualizada de normativa aplicable: Ley REP, DS 148 (RESPEL), SINADER, DS 1/2013 (rellenos), permisos sectoriales. El auditor verificará que conoces tus obligaciones."
        />
        <NumberedItem
          n={4}
          title="Objetivos y metas ambientales medibles"
          desc="Metas cuantificables: % reciclaje, kg residuos a relleno, CO₂ evitado. Deben tener plazos, responsables y seguimiento documentado (mínimo trimestral)."
        />
        <NumberedItem
          n={5}
          title="Roles y responsabilidades asignados"
          desc="Organigrama ambiental con nombres, cargos y responsabilidades específicas. Incluir: representante de la dirección, coordinador ambiental, responsables de área."
        />
        <NumberedItem
          n={6}
          title="Registros de capacitación del personal"
          desc="Evidencia de capacitaciones en separación de residuos, manejo de RESPEL, emergencias ambientales. Incluir: lista de asistencia, contenido, evaluación y fecha."
        />
      </ContentPage>

      {/* Page 3 */}
      <ContentPage pageNum={3}>
        <NumberedItem
          n={7}
          title="Certificados de reciclaje vigentes de todas las gestoras"
          desc="Certificados originales (no copias) de cada gestora, con datos verificables: peso, material, destino, fecha. El auditor cruzará volúmenes declarados con certificados."
        />
        <NumberedItem
          n={8}
          title="Trazabilidad de residuos (generación → destino final)"
          desc="Demostrar el recorrido completo: punto de generación, segregación, almacenamiento temporal, retiro (guía de despacho), transporte y destino final certificado."
        />
        <NumberedItem
          n={9}
          title="Declaraciones SINADER al día"
          desc="Comprobante de declaración anual en SINADER. El auditor verificará que los volúmenes declarados sean coherentes con los registros internos y certificados de gestoras."
        />
        <NumberedItem
          n={10}
          title="Indicadores de desempeño ambiental"
          desc="Métricas monitoreadas: kg reciclados/mes, tasa de reciclaje (%), CO₂ evitado (ton), costo por tonelada. Presentar tendencias (gráficos) y análisis de desviaciones."
        />
        <NumberedItem
          n={11}
          title="No conformidades anteriores cerradas"
          desc="Registro de no conformidades de auditorías anteriores con: análisis de causa raíz, acción correctiva, responsable, plazo y evidencia de cierre efectivo."
        />
        <NumberedItem
          n={12}
          title="Evidencia de mejora continua"
          desc="Demostrar que el SGA mejora: comparar indicadores año a año, proyectos de reducción implementados, lecciones aprendidas, innovaciones en gestión de residuos."
        />

        <SectionTitle>Documentos que el auditor pedirá</SectionTitle>
        <TableRow
          cells={["Documento", "Fuente", "Frecuencia"]}
          widths={[40, 35, 25]}
          isHeader
        />
        <TableRow
          cells={["Política ambiental", "Alta dirección", "Revisión anual"]}
          widths={[40, 35, 25]}
        />
        <TableRow
          cells={["Matriz de aspectos ambientales", "Coord. ambiental", "Actualización anual"]}
          widths={[40, 35, 25]}
          isAlt
        />
        <TableRow
          cells={["Matriz legal", "Asesor legal / ambiental", "Semestral"]}
          widths={[40, 35, 25]}
        />
        <TableRow
          cells={["Certificados de reciclaje", "Gestoras autorizadas", "Por retiro"]}
          widths={[40, 35, 25]}
          isAlt
        />
        <TableRow
          cells={["Declaración SINADER", "SINADER (MMA)", "Anual (31 marzo)"]}
          widths={[40, 35, 25]}
        />
        <TableRow
          cells={["Registros capacitación", "RRHH / Ambiental", "Semestral"]}
          widths={[40, 35, 25]}
          isAlt
        />
        <TableRow
          cells={["Indicadores desempeño", "Dashboard / planilla", "Mensual"]}
          widths={[40, 35, 25]}
        />
        <TableRow
          cells={["Plan de emergencia", "Prevención de riesgos", "Revisión anual"]}
          widths={[40, 35, 25]}
          isAlt
        />
      </ContentPage>

      {/* Page 4 */}
      <ContentPage pageNum={4}>
        <TipBox
          title="⚠ Los 5 errores más comunes en auditorías"
          text="1. Certificados de reciclaje vencidos o de gestoras no autorizadas — el auditor lo detecta de inmediato. 2. Volúmenes en SINADER no coinciden con certificados de gestoras — indica falta de control. 3. Personal operativo no sabe separar residuos — evidencia que la capacitación no es efectiva. 4. No conformidades de la auditoría anterior sin cerrar — muestra falta de compromiso con mejora continua. 5. Objetivos ambientales sin seguimiento trimestral — el auditor espera evidencia de monitoreo regular."
        />

        <SectionTitle>Resumen: semáforo de preparación</SectionTitle>
        <View style={s.statRow}>
          <View style={s.statBox}>
            <Text style={s.statNumber}>12</Text>
            <Text style={s.statLabel}>Puntos a revisar</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>8</Text>
            <Text style={s.statLabel}>Documentos clave</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>5</Text>
            <Text style={s.statLabel}>Errores frecuentes</Text>
          </View>
        </View>

        <Body>
          Si cumples los 12 puntos y tienes los 8 documentos listos, tu
          probabilidad de pasar la auditoría sin no conformidades mayores es
          muy alta. Recuerda: el auditor busca evidencia objetiva, no
          perfección. Lo importante es demostrar control, trazabilidad y
          mejora continua.
        </Body>
      </ContentPage>

      <BackPage logo={logo} />
    </Document>
  );
}

// ===========================================================================
// GUIDE 4: Reducir Costos en Gestión de Residuos
// ===========================================================================
function GuiaReducirCostos({ logo }: { logo: string }) {
  return (
    <Document>
      <CoverPage
        logo={logo}
        title="Guía: 7 Estrategias para Reducir Costos en Gestión de Residuos"
        subtitle="Transforma la gestión de residuos de un centro de costo a una oportunidad de ahorro. Incluye ROI estimado por estrategia, costos comparativos por material y quick wins inmediatos."
      />

      {/* Page 2 */}
      <ContentPage pageNum={2}>
        <SectionTitle>Residuos: ¿Costo o oportunidad?</SectionTitle>
        <Body>
          La mayoría de empresas chilenas destinan entre $2.000 y $15.000 CLP
          por tonelada solo en disposición en relleno sanitario, sin contar
          transporte, contenedores y horas administrativas. Sin embargo, muchos
          de esos residuos tienen valor comercial si se segregan correctamente.
          Implementar estas 7 estrategias puede reducir tus costos de gestión
          entre un 30% y 60% en el primer año.
        </Body>

        <View style={s.statRow}>
          <View style={s.statBox}>
            <Text style={s.statNumber}>30-60%</Text>
            <Text style={s.statLabel}>Ahorro potencial</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>6-12</Text>
            <Text style={s.statLabel}>Meses de retorno</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>$0</Text>
            <Text style={s.statLabel}>Inversión en quick wins</Text>
          </View>
        </View>

        <SectionTitle>Las 7 estrategias</SectionTitle>

        <NumberedItem
          n={1}
          title="Segregación en origen (ahorro 30-50% vs todo a relleno)"
          desc="Separar residuos en el punto de generación es la estrategia más rentable. Cuando todo va mezclado a relleno, pagas disposición por materiales que tienen valor. Instala contenedores diferenciados por tipo de material y capacita al personal."
        />
        <NumberedItem
          n={2}
          title="Negociar por volumen con gestoras"
          desc="Consolida tus volúmenes y negocia tarifas. Muchas gestoras ofrecen descuentos de 15-30% por contratos anuales o volúmenes superiores a 5 ton/mes. Compara al menos 3 cotizaciones y negocia precio por tonelada."
        />
        <NumberedItem
          n={3}
          title="Valorizar materiales con valor comercial"
          desc="Aluminio ($800-1.200 CLP/kg), cobre ($4.000-6.000 CLP/kg), cartón limpio ($40-80 CLP/kg) y PET ($150-250 CLP/kg) se venden directamente. Si generas volumen, negocia con compradores industriales en vez de gestoras."
        />
        <NumberedItem
          n={4}
          title="Digitalizar trazabilidad (eliminar horas administrativas)"
          desc="Las planillas Excel consumen 8-15 horas/mes en empresas medianas. Un sistema digital reduce esto a 1-2 horas/mes y elimina errores en declaraciones SINADER. ROI típico: 3-6 meses."
        />
      </ContentPage>

      {/* Page 3 */}
      <ContentPage pageNum={3}>
        <NumberedItem
          n={5}
          title="Optimizar frecuencia de retiros"
          desc="Muchas empresas programan retiros semanales cuando podrían ser quincenales. Analiza tu tasa de llenado real. Usar contenedores más grandes con retiros menos frecuentes reduce costos de transporte un 20-40%."
        />
        <NumberedItem
          n={6}
          title="Compostar orgánicos in-situ"
          desc="Si generas más de 500 kg/mes de residuos orgánicos (casino, jardines), el compostaje in-situ elimina el costo de retiro y disposición. Inversión: $500.000-2.000.000 CLP en compostera industrial. Retorno: 6-12 meses."
        />
        <NumberedItem
          n={7}
          title="Capacitar al personal en separación correcta"
          desc="La contaminación cruzada (un envase sucio en el cartón limpio) puede arruinar un lote completo. Capacitar en separación correcta mejora la calidad del material reciclable y aumenta su valor de venta un 20-50%."
        />

        <SectionTitle>Costos comparativos por material</SectionTitle>
        <TableRow
          cells={["Material", "Costo relleno (CLP/ton)", "Ingreso reciclaje (CLP/ton)", "Diferencia"]}
          widths={[22, 26, 28, 24]}
          isHeader
        />
        <TableRow
          cells={["Cartón", "$25.000", "+$40.000 a $80.000", "Ganancia neta"]}
          widths={[22, 26, 28, 24]}
        />
        <TableRow
          cells={["Plástico PET", "$25.000", "+$150.000 a $250.000", "Ganancia neta"]}
          widths={[22, 26, 28, 24]}
          isAlt
        />
        <TableRow
          cells={["Aluminio", "$25.000", "+$800.000 a $1.200.000", "Ganancia neta"]}
          widths={[22, 26, 28, 24]}
        />
        <TableRow
          cells={["Vidrio", "$25.000", "+$10.000 a $20.000", "Menor costo"]}
          widths={[22, 26, 28, 24]}
          isAlt
        />
        <TableRow
          cells={["Orgánicos", "$25.000", "$0 (compostaje)", "Ahorro 100%"]}
          widths={[22, 26, 28, 24]}
        />
        <TableRow
          cells={["Madera", "$25.000", "+$15.000 a $30.000", "Ganancia neta"]}
          widths={[22, 26, 28, 24]}
          isAlt
        />

        <SectionTitle>ROI típico primer año</SectionTitle>
        <TableRow
          cells={["Estrategia", "Inversión", "Ahorro anual", "Retorno"]}
          widths={[30, 22, 26, 22]}
          isHeader
        />
        <TableRow
          cells={["Segregación", "$500.000", "$3.000.000", "2 meses"]}
          widths={[30, 22, 26, 22]}
        />
        <TableRow
          cells={["Negociación volumen", "$0", "$1.500.000", "Inmediato"]}
          widths={[30, 22, 26, 22]}
          isAlt
        />
        <TableRow
          cells={["Digitalización", "$600.000", "$2.400.000", "3 meses"]}
          widths={[30, 22, 26, 22]}
        />
        <TableRow
          cells={["Compostaje in-situ", "$1.500.000", "$2.000.000", "9 meses"]}
          widths={[30, 22, 26, 22]}
          isAlt
        />
      </ContentPage>

      {/* Page 4 */}
      <ContentPage pageNum={4}>
        <TipBox
          title="🚀 Quick wins: cambios que ahorran desde el día 1"
          text="1. Renegocia tu contrato de relleno sanitario — solo pedir cotizaciones competitivas baja el precio 10-15%. 2. Separa el cartón limpio hoy mismo — es el reciclable más fácil de vender. 3. Reduce el tamaño de tu contenedor de basura general — pagas por volumen, no por peso. 4. Pide a tu gestora un reporte mensual de composición — descubrirás qué materiales reciclables estás botando. 5. Elimina vasos desechables del casino — ahorro pequeño pero visible que motiva al equipo."
        />

        <SectionTitle>Plan de implementación sugerido</SectionTitle>
        <Body>
          Mes 1-2: Diagnóstico de residuos y segregación en origen{"\n"}
          Mes 3: Negociación con gestoras y compradores{"\n"}
          Mes 4-5: Digitalización de trazabilidad{"\n"}
          Mes 6: Optimización de frecuencia de retiros{"\n"}
          Mes 7-9: Compostaje (si aplica) y capacitación{"\n"}
          Mes 10-12: Medición de resultados y ajuste de metas
        </Body>
      </ContentPage>

      <BackPage logo={logo} />
    </Document>
  );
}

// ===========================================================================
// GUIDE 5: Tabla de Factores de CO₂
// ===========================================================================
function TablaFactoresCO2({ logo }: { logo: string }) {
  return (
    <Document>
      <CoverPage
        logo={logo}
        title="Tabla Completa: Factores de CO₂ Evitado por Material Reciclado"
        subtitle="Factores de emisión de CO₂ evitado por material reciclado según EPA WARM, DEFRA y fuentes nacionales. Incluye eco-equivalencias y guía de uso en reportes de sustentabilidad."
      />

      {/* Page 2 */}
      <ContentPage pageNum={2}>
        <SectionTitle>Metodología</SectionTitle>
        <Body>
          Los factores de CO₂ evitado representan las emisiones de gases de
          efecto invernadero que se evitan al reciclar un material en vez de
          producirlo desde materia prima virgen. Las fuentes principales son:
        </Body>
        <Body>
          • EPA WARM (Waste Reduction Model) — Agencia de Protección Ambiental
          de EE.UU. Modelo más usado internacionalmente para reportes corporativos.{"\n"}
          • DEFRA (UK) — Departamento de Medio Ambiente del Reino Unido.
          Referencia europea, con factores más conservadores.{"\n"}
          • CertiRecicla — Promedio ponderado adaptado a la realidad chilena,
          considerando la matriz energética nacional.
        </Body>

        <SectionTitle>Factores de CO₂ evitado por material (kg CO₂e / ton)</SectionTitle>
        <TableRow
          cells={["Material", "EPA WARM", "DEFRA", "CertiRecicla", "Fuente"]}
          widths={[20, 18, 18, 20, 24]}
          isHeader
        />
        <TableRow
          cells={["Plástico PET", "1.530", "1.450", "1.490", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Plástico HDPE", "1.430", "1.380", "1.400", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Cartón", "3.120", "2.800", "2.960", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Papel", "2.850", "2.500", "2.670", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Vidrio", "310", "280", "295", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Aluminio", "9.070", "8.900", "8.980", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Acero", "1.810", "1.750", "1.780", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Tetra Pak", "1.100", "950", "1.020", "Estimado"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Orgánico", "580", "520", "550", "Compostaje"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Madera", "1.690", "1.500", "1.590", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Textil", "3.170", "2.900", "3.030", "EPA/DEFRA"]}
          widths={[20, 18, 18, 20, 24]}
        />
        <TableRow
          cells={["Cobre", "4.500", "4.200", "4.350", "Industria"]}
          widths={[20, 18, 18, 20, 24]}
          isAlt
        />
        <TableRow
          cells={["Baterías Pb", "1.200", "1.100", "1.150", "Industria"]}
          widths={[20, 18, 18, 20, 24]}
        />
      </ContentPage>

      {/* Page 3 */}
      <ContentPage pageNum={3}>
        <SectionTitle>Eco-equivalencias</SectionTitle>
        <Body>
          Para comunicar el impacto de forma comprensible, usa estas
          equivalencias basadas en promedios internacionales:
        </Body>

        <TableRow
          cells={["1 tonelada de CO₂ equivale a...", "Valor"]}
          widths={[65, 35]}
          isHeader
        />
        <TableRow
          cells={["Árboles adultos absorbiendo CO₂ durante 1 año", "5 árboles"]}
          widths={[65, 35]}
        />
        <TableRow
          cells={["Kilómetros recorridos en auto promedio", "4.300 km"]}
          widths={[65, 35]}
          isAlt
        />
        <TableRow
          cells={["Cargas completas de smartphone", "121.643 cargas"]}
          widths={[65, 35]}
        />
        <TableRow
          cells={["Litros de agua potable producidos", "4.000 litros ahorrados"]}
          widths={[65, 35]}
          isAlt
        />
        <TableRow
          cells={["Horas de TV LED encendida", "6.098 horas"]}
          widths={[65, 35]}
        />
        <TableRow
          cells={["Hogares chilenos (consumo eléctrico mensual)", "0,47 hogares/mes"]}
          widths={[65, 35]}
          isAlt
        />

        <TipBox
          title="💡 Cómo usar estos factores en reportes de sustentabilidad"
          text="1. Define tu fuente: usa EPA WARM para reportes internacionales (GRI, CDP) y DEFRA para clientes europeos. CertiRecicla es adecuado para reportes nacionales. 2. Documenta el alcance: especifica si incluyes solo reciclaje o también compostaje y valorización energética. 3. Sé consistente: usa la misma fuente todo el año para poder comparar períodos. 4. Incluye la metodología: transparencia sobre la fuente de factores genera credibilidad. 5. Reporta en ton CO₂e (equivalente): incluye los 3 gases principales (CO₂, CH₄, N₂O) convertidos a CO₂ equivalente."
        />

        <SectionTitle>¿Cuándo usar EPA vs DEFRA?</SectionTitle>
        <Body>
          EPA WARM: Estándar más usado globalmente. Recomendado para reportes
          GRI, CDP, Science Based Targets. Factores generalmente más altos
          porque considera el ciclo de vida completo incluyendo transporte y
          procesamiento evitado.
        </Body>
        <Body>
          DEFRA: Preferido por empresas con operaciones en Europa o que
          reportan a clientes europeos. Factores más conservadores. Actualizado
          anualmente por el gobierno británico.
        </Body>
        <Body>
          CertiRecicla: Promedio ponderado que ajusta por la matriz energética
          chilena (mayor proporción renovable que EE.UU., menor que UK). Ideal
          para comunicación nacional y reportes a la SMA.
        </Body>
      </ContentPage>

      {/* Page 4 */}
      <ContentPage pageNum={4}>
        <SectionTitle>Notas metodológicas</SectionTitle>
        <Body>
          • Los factores expresan kg CO₂e evitados por tonelada de material
          reciclado vs producción desde materia virgen.{"\n"}
          • Se consideran emisiones evitadas en: extracción de materia prima,
          transporte, procesamiento industrial y energía consumida.{"\n"}
          • Para compostaje de orgánicos, se considera el metano evitado por
          no disponer en relleno sanitario (factor IPCC de conversión CH₄ → CO₂e).{"\n"}
          • Los factores de Tetra Pak son estimados ponderando sus componentes
          (75% cartón, 20% plástico, 5% aluminio).{"\n"}
          • El factor de baterías de plomo-ácido considera la recuperación del
          plomo y del ácido sulfúrico.{"\n"}
          • Todos los factores se expresan en CO₂ equivalente (CO₂e),
          incluyendo la conversión de CH₄ (GWP=28) y N₂O (GWP=265).
        </Body>

        <View style={s.statRow}>
          <View style={s.statBox}>
            <Text style={s.statNumber}>13</Text>
            <Text style={s.statLabel}>Materiales cubiertos</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>3</Text>
            <Text style={s.statLabel}>Fuentes de datos</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNumber}>6</Text>
            <Text style={s.statLabel}>Eco-equivalencias</Text>
          </View>
        </View>

        <TipBox
          title="📊 Ejemplo de cálculo"
          text="Si tu empresa recicló 10 toneladas de cartón en un mes: 10 ton × 2.960 kg CO₂e/ton = 29.600 kg CO₂e evitados = 29,6 ton CO₂e. Esto equivale a 148 árboles absorbiendo CO₂ durante un año, o 127.280 km que un auto dejó de recorrer."
        />
      </ContentPage>

      <BackPage logo={logo} />
    </Document>
  );
}

// ===========================================================================
// Main exported component
// ===========================================================================
interface LeadMagnetPDFProps {
  type: string;
  logo: string;
}

export function LeadMagnetPDF({ type, logo }: LeadMagnetPDFProps) {
  switch (type) {
    case "checklist-ley-rep":
      return <ChecklistLeyRep logo={logo} />;
    case "guia-clasificacion-residuos":
      return <GuiaClasificacion logo={logo} />;
    case "checklist-auditoria-ambiental":
      return <ChecklistAuditoria logo={logo} />;
    case "guia-reducir-costos-residuos":
      return <GuiaReducirCostos logo={logo} />;
    case "tabla-factores-co2":
      return <TablaFactoresCO2 logo={logo} />;
    default:
      return <ChecklistLeyRep logo={logo} />;
  }
}
