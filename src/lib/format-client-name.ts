/**
 * Formato consistente de nombre de cliente en toda la plataforma.
 * Si el cliente tiene empresa madre, muestra "EMPRESA - Sucursal".
 */
export function formatClientName(
  name: string,
  parentName?: string | null
): string {
  if (parentName) {
    return `${parentName} - ${name}`;
  }
  return name;
}
