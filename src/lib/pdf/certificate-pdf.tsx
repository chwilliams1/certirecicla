import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { calculateEquivalencies } from "@/lib/co2-calculator";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#2d3a2e" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#4a6b4e" },
  subtitle: { fontSize: 10, color: "#7c9a82", marginTop: 4 },
  companyInfo: { textAlign: "right", fontSize: 8, color: "#888" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#d4e4d6", marginVertical: 15 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#4a6b4e", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#7c9a82", fontSize: 9 },
  value: { fontFamily: "Helvetica-Bold" },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f4f7f4", padding: 8, borderRadius: 4 },
  tableHeaderText: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#4a6b4e" },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 0.5, borderBottomColor: "#e0dbd3" },
  col1: { width: "40%" },
  col2: { width: "30%", textAlign: "right" },
  col3: { width: "30%", textAlign: "right" },
  totalsBox: { backgroundColor: "#f4f7f4", padding: 15, borderRadius: 6, marginTop: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#4a6b4e" },
  equivalencies: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  eqBox: { alignItems: "center", width: "23%" },
  eqValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#5a7d5e" },
  eqLabel: { fontSize: 7, color: "#888", textAlign: "center", marginTop: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: "#aaa" },
});

interface CertificatePDFData {
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

export function CertificatePDFDocument({ data }: { data: CertificatePDFData }) {
  const eq = calculateEquivalencies(data.totalCo2);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CL");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Certificado de Reciclaje</Text>
            <Text style={styles.subtitle}>CertiRecicla - Impacto Ambiental Verificado</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>{data.companyName}</Text>
            <Text>{data.companyRut}</Text>
            <Text>{data.companyAddress}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>CLIENTE</Text>
            <Text style={styles.value}>{data.clientName}</Text>
            {data.clientRut && <Text style={{ fontSize: 8, color: "#888" }}>RUT: {data.clientRut}</Text>}
          </View>
          <View>
            <Text style={styles.label}>PERIODO</Text>
            <Text style={styles.value}>{formatDate(data.periodStart)} - {formatDate(data.periodEnd)}</Text>
          </View>
          <View>
            <Text style={styles.label}>CODIGO</Text>
            <Text style={styles.value}>{data.uniqueCode}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Detalle de Materiales Reciclados</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Material</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad (kg)</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>CO₂ evitado (kg)</Text>
          </View>
          {Object.entries(data.materials).map(([material, values]) => (
            <View key={material} style={styles.tableRow}>
              <Text style={styles.col1}>{material}</Text>
              <Text style={styles.col2}>{values.kg.toLocaleString("es-CL")}</Text>
              <Text style={styles.col3}>{values.co2.toLocaleString("es-CL")}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.label}>TOTAL RECICLADO</Text>
              <Text style={styles.totalValue}>{data.totalKg.toLocaleString("es-CL")} kg</Text>
            </View>
            <View>
              <Text style={styles.label}>CO₂ EVITADO</Text>
              <Text style={styles.totalValue}>{data.totalCo2.toLocaleString("es-CL")} kg</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Equivalencias Ecológicas</Text>
        <View style={styles.equivalencies}>
          <View style={styles.eqBox}>
            <Text style={styles.eqValue}>{eq.trees}</Text>
            <Text style={styles.eqLabel}>Árboles preservados</Text>
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

        <View style={styles.footer}>
          <Text>Certificado #{data.uniqueCode}</Text>
          <Text>Emitido: {formatDate(data.createdAt)}</Text>
          <Text>Generado por CertiRecicla</Text>
        </View>
      </Page>
    </Document>
  );
}
