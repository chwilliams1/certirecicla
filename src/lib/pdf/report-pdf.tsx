import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { calculateEquivalencies } from "@/lib/co2-calculator";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#2d3a2e" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#4a6b4e" },
  subtitle: { fontSize: 10, color: "#7c9a82", marginTop: 4 },
  companyInfo: { textAlign: "right", fontSize: 8, color: "#888" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#d4e4d6", marginVertical: 12 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#4a6b4e", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#7c9a82", fontSize: 9 },
  value: { fontFamily: "Helvetica-Bold" },
  // KPI cards
  kpiRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  kpiBox: {
    width: "31%",
    backgroundColor: "#f4f7f4",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  kpiValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4a6b4e" },
  kpiLabel: { fontSize: 8, color: "#7c9a82", marginTop: 3, textAlign: "center" },
  // Table
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f4f7f4", padding: 8, borderRadius: 4 },
  tableHeaderText: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#4a6b4e" },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 0.5, borderBottomColor: "#e0dbd3" },
  col1: { width: "30%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "25%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },
  // Equivalencies
  equivalencies: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  eqBox: { alignItems: "center", width: "23%" },
  eqValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#5a7d5e" },
  eqLabel: { fontSize: 7, color: "#888", textAlign: "center", marginTop: 2 },
  // Monthly trend
  trendRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: "#e0dbd3" },
  trendHeader: { flexDirection: "row", backgroundColor: "#f4f7f4", padding: 6, borderRadius: 4 },
  trendCol1: { width: "40%" },
  trendCol2: { width: "30%", textAlign: "right" },
  trendCol3: { width: "30%", textAlign: "right" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#aaa",
  },
  // Period badge
  periodBadge: {
    backgroundColor: "#4a6b4e",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
    marginTop: 6,
  },
});

export interface ReportPDFData {
  companyName: string;
  companyRut: string;
  companyAddress: string;
  clientName: string;
  clientRut: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  totalKg: number;
  totalCo2: number;
  totalPickups: number;
  materials: Record<string, { kg: number; co2: number }>;
  monthlyData: Array<{ month: string; kg: number; co2: number }>;
  generatedAt: string;
  ranking?: Array<{ clientName: string; kg: number; co2: number; percentage: number }>;
  branches?: Array<{ branchName: string; kg: number; co2: number; percentage: number }>;
}

function formatNum(n: number): string {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 1 });
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-CL");
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export function ReportPDFDocument({ data }: { data: ReportPDFData }) {
  const eq = calculateEquivalencies(data.totalCo2);

  const materialEntries = Object.entries(data.materials).sort(
    (a, b) => b[1].kg - a[1].kg
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reporte de Impacto Ambiental</Text>
            <Text style={styles.subtitle}>CertiRecicla - Gestión de Reciclaje Inteligente</Text>
            <Text style={styles.periodBadge}>{data.periodLabel}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>{data.companyName}</Text>
            {data.companyRut ? <Text>{data.companyRut}</Text> : null}
            {data.companyAddress ? <Text>{data.companyAddress}</Text> : null}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client info + Period */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>CLIENTE</Text>
            <Text style={styles.value}>{data.clientName}</Text>
            {data.clientRut ? (
              <Text style={{ fontSize: 8, color: "#888" }}>RUT: {data.clientRut}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.label}>PERIODO</Text>
            <Text style={styles.value}>
              {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Summary KPIs */}
        <Text style={styles.sectionTitle}>Resumen del Periodo</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatNum(data.totalKg)}</Text>
            <Text style={styles.kpiLabel}>kg Reciclados</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatNum(data.totalCo2)}</Text>
            <Text style={styles.kpiLabel}>kg CO2 Evitados</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{data.totalPickups}</Text>
            <Text style={styles.kpiLabel}>Retiros Realizados</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Material breakdown */}
        <Text style={styles.sectionTitle}>Desglose por Material</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Material</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad (kg)</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>CO2 evitado (kg)</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>% del Total</Text>
          </View>
          {materialEntries.map(([material, values]) => (
            <View key={material} style={styles.tableRow}>
              <Text style={styles.col1}>{material}</Text>
              <Text style={styles.col2}>{formatNum(values.kg)}</Text>
              <Text style={styles.col3}>{formatNum(values.co2)}</Text>
              <Text style={styles.col4}>
                {data.totalKg > 0
                  ? ((values.kg / data.totalKg) * 100).toFixed(1) + "%"
                  : "0%"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Eco-equivalencies */}
        <Text style={styles.sectionTitle}>Equivalencias Ecologicas</Text>
        <View style={styles.equivalencies}>
          <View style={styles.eqBox}>
            <Text style={styles.eqValue}>{eq.trees}</Text>
            <Text style={styles.eqLabel}>Arboles preservados</Text>
          </View>
          <View style={styles.eqBox}>
            <Text style={styles.eqValue}>{formatNum(eq.kmNotDriven)}</Text>
            <Text style={styles.eqLabel}>Km no conducidos</Text>
          </View>
          <View style={styles.eqBox}>
            <Text style={styles.eqValue}>{eq.homesEnergized.toLocaleString("es-CL")}</Text>
            <Text style={styles.eqLabel}>Dias de hogar energizado</Text>
          </View>
          <View style={styles.eqBox}>
            <Text style={styles.eqValue}>{formatNum(eq.smartphonesCharged)}</Text>
            <Text style={styles.eqLabel}>Smartphones cargados</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Monthly trend */}
        <Text style={styles.sectionTitle}>Tendencia Mensual</Text>
        <View style={styles.table}>
          <View style={styles.trendHeader}>
            <Text style={[styles.tableHeaderText, styles.trendCol1]}>Mes</Text>
            <Text style={[styles.tableHeaderText, styles.trendCol2]}>Reciclado (kg)</Text>
            <Text style={[styles.tableHeaderText, styles.trendCol3]}>CO2 evitado (kg)</Text>
          </View>
          {data.monthlyData.map((m) => (
            <View key={m.month} style={styles.trendRow}>
              <Text style={styles.trendCol1}>{formatMonth(m.month)}</Text>
              <Text style={styles.trendCol2}>{formatNum(m.kg)}</Text>
              <Text style={styles.trendCol3}>{formatNum(m.co2)}</Text>
            </View>
          ))}
        </View>

        {/* Ranking (consolidated reports) */}
        {data.ranking && data.ranking.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Ranking de Clientes</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "8%" }]}>#</Text>
                <Text style={[styles.tableHeaderText, { width: "32%" }]}>Cliente</Text>
                <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad (kg)</Text>
                <Text style={[styles.tableHeaderText, styles.col3]}>CO2 (kg)</Text>
                <Text style={[styles.tableHeaderText, styles.col4]}>% Total</Text>
              </View>
              {data.ranking.map((r, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={{ width: "8%" }}>{i + 1}</Text>
                  <Text style={{ width: "32%" }}>{r.clientName}</Text>
                  <Text style={styles.col2}>{formatNum(r.kg)}</Text>
                  <Text style={styles.col3}>{formatNum(r.co2)}</Text>
                  <Text style={styles.col4}>{r.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Branch breakdown */}
        {data.branches && data.branches.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Desglose por Sucursal</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col1]}>Sucursal</Text>
                <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad (kg)</Text>
                <Text style={[styles.tableHeaderText, styles.col3]}>CO2 (kg)</Text>
                <Text style={[styles.tableHeaderText, styles.col4]}>% Total</Text>
              </View>
              {data.branches.map((b, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.col1}>{b.branchName}</Text>
                  <Text style={styles.col2}>{formatNum(b.kg)}</Text>
                  <Text style={styles.col3}>{formatNum(b.co2)}</Text>
                  <Text style={styles.col4}>{b.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Reporte generado el {formatDate(data.generatedAt)}</Text>
          <Text>Generado por CertiRecicla</Text>
        </View>
      </Page>
    </Document>
  );
}
