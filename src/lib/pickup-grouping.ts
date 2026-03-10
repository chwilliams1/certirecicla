/**
 * Shared pickup grouping logic.
 * Groups recycling records by date + location into pickups.
 */

interface RecordForGrouping {
  pickupDate: Date;
  location: string | null;
  material: string;
  quantityKg: number;
  co2Saved: number;
}

export interface GroupedPickup {
  date: string;
  location: string;
  materials: string[];
  kg: number;
}

/**
 * Groups records by date+location, returns array of pickups
 * with deduplicated material list and total kg.
 */
export function groupRecordsIntoPickups(records: RecordForGrouping[]): GroupedPickup[] {
  const pickupMap = new Map<string, { date: string; location: string; materials: string[]; kg: number }>();

  for (const r of records) {
    const key = `${r.pickupDate.toISOString().slice(0, 10)}_${r.location || ""}`;
    const existing = pickupMap.get(key);
    if (existing) {
      existing.materials.push(r.material);
      existing.kg += r.quantityKg;
    } else {
      pickupMap.set(key, {
        date: r.pickupDate.toISOString(),
        location: r.location || "",
        materials: [r.material],
        kg: r.quantityKg,
      });
    }
  }

  return Array.from(pickupMap.values()).map((p) => ({
    ...p,
    materials: Array.from(new Set(p.materials)),
  }));
}

/**
 * Format grouped pickups for PDF/API response with materials joined as string.
 */
export function formatPickupsForPdf(pickups: GroupedPickup[]) {
  return pickups.map((p) => ({
    date: p.date,
    location: p.location,
    materials: p.materials.join(", "),
    kg: p.kg,
  }));
}
