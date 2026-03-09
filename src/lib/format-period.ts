const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Formats a certificate period as "Mes Año" (e.g. "Octubre 2025").
 * Since certificates are always monthly, we use the periodStart month.
 */
export function formatPeriod(periodStart: string | Date): string {
  const d = typeof periodStart === "string" ? new Date(periodStart) : periodStart;
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
