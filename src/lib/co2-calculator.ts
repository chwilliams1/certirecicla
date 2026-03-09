/**
 * CO₂ Factors & Eco-Equivalencies — Fuentes citables
 *
 * - EPA WARM v16 (Dec 2023): https://www.epa.gov/warm
 * - EPA GHG Equivalencies Calculator: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
 * - FEVE Glass Recycling LCA: https://feve.org
 * - BIR CO₂ Report: https://www.mgg-recycling.com/wp-content/uploads/2013/06/BIR_CO2_report.pdf
 * - DEFRA Emission Factors (2025): https://ghgprotocol.org/Third-Party-Databases/Defra
 * - Tetra Pak Environmental Data: https://www.tetrapak.com/sustainability
 */

// kg CO₂ evitados por kg de material reciclado
export const DEFAULT_CO2_FACTORS: Record<string, number> = {
  // Plásticos — EPA WARM v16
  "Plástico PET": 1.7,
  "Plástico HDPE": 1.5,
  "Plástico LDPE": 1.4,
  "Plástico PP": 1.5,
  "Plástico PS": 1.6,
  // Papel y cartón — EPA WARM v16
  "Cartón": 0.8,
  "Papel": 0.9,
  // Vidrio — FEVE / British Glass LCA
  "Vidrio": 0.67,
  // Metales — EPA WARM v16 / BIR CO₂ Report
  "Aluminio": 9.0,
  "Acero": 1.8,
  // Madera — DEFRA conversion factors
  "Madera": 0.5,
  // Electrónicos — EPA WARM v16 (e-waste)
  "Electrónicos": 14.0,
  "RAE": 14.0,
  // Envases compuestos — Tetra Pak LCA / ACE UK
  "TetraPak": 0.55,
  // Textil — PMC/ScienceDirect (mechanical recycling)
  "Textil": 5.4,
  // Aceite vegetal usado — EPA WARM v16 (cooking oil → biodiesel)
  "Aceite vegetal": 2.5,
  // Orgánico — EPA WARM v16 (food waste composting, metano evitado)
  "Orgánico": 0.25,
  // Neumáticos — EPA WARM v16
  "Neumáticos": 1.3,
  // Baterías — DEFRA / EU Battery Directive LCA
  "Baterías": 10.0,
  // Escombros — EPA WARM v16 (concrete/asphalt recycling)
  "Escombros": 0.05,
};

export const VALID_MATERIALS = Object.keys(DEFAULT_CO2_FACTORS);

export function calculateCo2(material: string, quantityKg: number, customFactors?: Record<string, number>): number {
  const factors = customFactors || DEFAULT_CO2_FACTORS;
  const factor = factors[material] || 0;
  return quantityKg * factor;
}

/**
 * Eco-equivalencias — factores por defecto basados en EPA GHG Equivalencies Calculator
 * https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
 */
export const DEFAULT_EQUIVALENCIES = {
  treesKgCo2PerYear: 21.77,        // kg CO₂ absorbidos por árbol/año — EPA
  kmCo2PerKm: 0.24,               // 0.396 kg CO₂/mi ≈ 0.24 kg/km — EPA
  homesKgCo2PerYear: 7270,        // 7.27 metric tons CO₂/home/year — EPA
  smartphoneKgCo2PerCharge: 0.008, // kg CO₂ por carga completa — EPA
};

export type EcoEquivalencies = typeof DEFAULT_EQUIVALENCIES;

export function calculateEquivalencies(co2Kg: number, custom?: Partial<EcoEquivalencies>) {
  const eq = { ...DEFAULT_EQUIVALENCIES, ...custom };
  return {
    trees: Math.round(co2Kg / eq.treesKgCo2PerYear),
    kmNotDriven: Math.round(co2Kg / eq.kmCo2PerKm),
    homesEnergized: parseFloat((co2Kg / eq.homesKgCo2PerYear).toFixed(2)),
    smartphonesCharged: Math.round(co2Kg / eq.smartphoneKgCo2PerCharge),
  };
}
