import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { calculateEquivalencies } from "@/lib/co2-calculator";
import { formatPeriod } from "@/lib/format-period";
import type { CertificateData, PickupDetail } from "./generate-certificate-pdf";

const GREEN = "#4a6b4e";
const GREEN_LIGHT = "#7c9a82";
const GREEN_BG = "#f4f7f4";
const DARK = "#2d3a2e";
const GRAY = "#888888";
const BORDER = "#d4e4d6";
const ACCENT_BAR = "#5a7d5e";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    position: "relative",
  },
  // Green left accent bar
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 8,
    backgroundColor: ACCENT_BAR,
  },
  // Watermark
  watermark: {
    position: "absolute",
    top: "35%",
    left: "10%",
    fontSize: 54,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    opacity: 0.06,
    transform: "rotate(-45deg)",
  },
  // Content wrapper with left padding for accent bar
  content: {
    paddingTop: 35,
    paddingBottom: 80,
    paddingLeft: 48,
    paddingRight: 40,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  headerTitleGroup: {},
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
  },
  subtitle: {
    fontSize: 9,
    color: GREEN_LIGHT,
    marginTop: 2,
  },
  headerRight: {
    textAlign: "right",
    fontSize: 8,
    color: GRAY,
  },
  companyNameHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: DARK,
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginVertical: 12,
  },
  // Client info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: GREEN_LIGHT,
    fontSize: 8,
    marginBottom: 2,
  },
  value: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  smallText: {
    fontSize: 8,
    color: GRAY,
  },
  // Section title
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    marginBottom: 6,
    marginTop: 14,
  },
  // Materials table
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: GREEN,
    padding: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e4dc",
  },
  tableRowAlt: {
    backgroundColor: GREEN_BG,
  },
  col1: { width: "40%" },
  col2: { width: "30%", textAlign: "right" },
  col3: { width: "30%", textAlign: "right" },
  // Pickups table columns
  pCol1: { width: "20%" },
  pCol2: { width: "30%" },
  pCol3: { width: "35%" },
  pCol4: { width: "15%", textAlign: "right" },
  // Totals box
  totalsBox: {
    backgroundColor: GREEN_BG,
    padding: 14,
    borderRadius: 6,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: BORDER,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
  },
  // Equivalencies
  equivalencies: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    backgroundColor: GREEN_BG,
    padding: 10,
    borderRadius: 6,
  },
  eqBox: {
    alignItems: "center",
    width: "23%",
  },
  eqIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  eqValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: ACCENT_BAR,
  },
  eqLabel: {
    fontSize: 7,
    color: GRAY,
    textAlign: "center",
    marginTop: 1,
  },
  // Signature section
  signatureSection: {
    marginTop: 24,
    alignItems: "flex-start",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: DARK,
    width: 200,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: GRAY,
  },
  signatureCompany: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginTop: 1,
  },
  signatureResolution: {
    fontSize: 7,
    color: GRAY,
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_BG,
  },
  qrImage: {
    width: 60,
    height: 60,
  },
  footerText: {
    marginLeft: 12,
    fontSize: 7,
    color: GRAY,
  },
  footerCode: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: DARK,
    marginBottom: 2,
  },
});

interface Props {
  data: CertificateData;
  qrDataUrl?: string;
}

export function CertificatePDFDocument({ data, qrDataUrl }: Props) {
  const eq = calculateEquivalencies(data.totalCo2);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CL");
  const materialEntries = Object.entries(data.materials);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Green accent bar */}
        <View style={styles.accentBar} />

        {/* Watermark */}
        {data.status === "draft" ? (
          <Text style={[styles.watermark, { color: "#cc0000", opacity: 0.08, fontSize: 64 }]}>BORRADOR</Text>
        ) : (
          <Text style={styles.watermark}>{data.uniqueCode}</Text>
        )}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {data.companyLogo && (
                <Image src={data.companyLogo} style={styles.logo} />
              )}
              <View style={styles.headerTitleGroup}>
                <Text style={styles.title}>Certificado de Reciclaje</Text>
                <Text style={styles.subtitle}>Impacto Ambiental Verificado</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.companyNameHeader}>{data.companyName}</Text>
              {data.companyRut && <Text>{data.companyRut}</Text>}
              {data.companyAddress && <Text>{data.companyAddress}</Text>}
              {data.plantAddress && <Text>Planta: {data.plantAddress}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Client info */}
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>CLIENTE</Text>
              <Text style={styles.value}>{data.clientName}</Text>
              {data.clientRut && <Text style={styles.smallText}>RUT: {data.clientRut}</Text>}
            </View>
            <View>
              <Text style={styles.label}>PERIODO</Text>
              <Text style={styles.value}>{formatPeriod(data.periodStart)}</Text>
            </View>
          </View>

          {/* Certification statement */}
          <Text style={{ fontSize: 9, color: DARK, lineHeight: 1.5, marginBottom: 10, marginTop: 4 }}>
            Mediante el presente documento, {data.companyName}{data.companyRut ? ` (RUT ${data.companyRut})` : ""} hace constar que {data.clientName}{data.clientRut ? ` (RUT ${data.clientRut})` : ""} realizo la valorizacion de {data.totalKg.toLocaleString("es-CL")} kg de residuos reciclables durante {formatPeriod(data.periodStart)}, contribuyendo a evitar {data.totalCo2.toLocaleString("es-CL")} kg de emisiones de CO2 equivalente.
          </Text>

          <View style={styles.divider} />

          {/* Materials table */}
          <Text style={styles.sectionTitle}>Detalle de Materiales Reciclados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Material</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad (kg)</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>CO2 evitado (kg)</Text>
            </View>
            {materialEntries.map(([material, values], i) => (
              <View key={material} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={styles.col1}>{material}</Text>
                <Text style={styles.col2}>{values.kg.toLocaleString("es-CL")}</Text>
                <Text style={styles.col3}>{values.co2.toLocaleString("es-CL")}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.label}>TOTAL RECICLADO</Text>
              <Text style={styles.totalValue}>{data.totalKg.toLocaleString("es-CL")} kg</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.label}>CO2 EVITADO</Text>
              <Text style={styles.totalValue}>{data.totalCo2.toLocaleString("es-CL")} kg</Text>
            </View>
          </View>

          {/* Equivalencies */}
          <Text style={styles.sectionTitle}>Equivalencias Ecologicas</Text>
          <Text style={{ fontSize: 8, color: GRAY, marginBottom: 6, lineHeight: 1.4 }}>
            El correcto manejo de estos residuos permitio generar el siguiente impacto ambiental positivo:
          </Text>
          <View style={styles.equivalencies}>
            <View style={styles.eqBox}>
              <Text style={styles.eqValue}>{eq.trees}</Text>
              <Text style={styles.eqLabel}>Arboles preservados</Text>
            </View>
            <View style={styles.eqBox}>
              <Text style={styles.eqValue}>{eq.kmNotDriven.toLocaleString("es-CL")}</Text>
              <Text style={styles.eqLabel}>Km no conducidos</Text>
            </View>
            <View style={styles.eqBox}>
              <Text style={styles.eqValue}>{eq.homesEnergized}</Text>
              <Text style={styles.eqLabel}>Hogares energizados</Text>
            </View>
            <View style={styles.eqBox}>
              <Text style={styles.eqValue}>{eq.smartphonesCharged.toLocaleString("es-CL")}</Text>
              <Text style={styles.eqLabel}>Smartphones cargados</Text>
            </View>
          </View>

          {/* Pickups detail */}
          {data.pickups && data.pickups.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Detalle de Retiros</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.pCol1]}>Fecha</Text>
                  <Text style={[styles.tableHeaderText, styles.pCol2]}>Ubicacion</Text>
                  <Text style={[styles.tableHeaderText, styles.pCol3]}>Materiales</Text>
                  <Text style={[styles.tableHeaderText, styles.pCol4]}>kg</Text>
                </View>
                {data.pickups.map((pickup: PickupDetail, i: number) => (
                  <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <Text style={styles.pCol1}>{formatDate(pickup.date)}</Text>
                    <Text style={styles.pCol2}>{pickup.location || "-"}</Text>
                    <Text style={styles.pCol3}>{pickup.materials}</Text>
                    <Text style={styles.pCol4}>{pickup.kg.toLocaleString("es-CL")}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Closing note */}
          <Text style={{ fontSize: 8, color: GRAY, marginTop: 14, lineHeight: 1.4 }}>
            Los residuos fueron procesados en instalaciones de valorizacion debidamente autorizadas{data.sanitaryResolution ? ` (${data.sanitaryResolution})` : ""}. Agradecemos su compromiso con la sostenibilidad y el cuidado del entorno.
          </Text>

          {/* Signature */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma Responsable</Text>
            <Text style={styles.signatureCompany}>{data.companyName}</Text>
            {data.sanitaryResolution && (
              <Text style={styles.signatureResolution}>Res. Sanitaria: {data.sanitaryResolution}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {qrDataUrl && <Image src={qrDataUrl} style={styles.qrImage} />}
          <View style={styles.footerText}>
            <Text style={styles.footerCode}>Certificado #{data.uniqueCode}</Text>
            <Text>Emitido: {formatDate(data.createdAt)}</Text>
            <Text>Verificar en: certirecicla.cl/verify/{data.uniqueCode}</Text>
            {data.sanitaryResolution && <Text>Res. Sanitaria: {data.sanitaryResolution}</Text>}
          </View>
        </View>
      </Page>
    </Document>
  );
}
