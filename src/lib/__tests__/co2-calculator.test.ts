import { describe, it, expect } from "vitest";
import {
  calculateCo2,
  calculateEquivalencies,
  calculateWaterSaved,
  DEFAULT_CO2_FACTORS,
  DEFAULT_WATER_FACTORS,
  DEFAULT_EQUIVALENCIES,
  VALID_MATERIALS,
} from "../co2-calculator";

// ─── calculateCo2 ───────────────────────────────────────────────────────────

describe("calculateCo2", () => {
  it("returns correct CO2 for each material (quantity * factor)", () => {
    expect(calculateCo2("Plástico PET", 10)).toBeCloseTo(13.0); // 10 * 1.3
    expect(calculateCo2("Aluminio", 5)).toBeCloseTo(45.5);      // 5 * 9.1
    expect(calculateCo2("Vidrio", 100)).toBeCloseTo(31.0);      // 100 * 0.31
    expect(calculateCo2("Cartón", 20)).toBeCloseTo(18.0);       // 20 * 0.9
    expect(calculateCo2("Escombros", 1000)).toBeCloseTo(50.0);  // 1000 * 0.05
  });

  it("returns 0 for unknown material", () => {
    expect(calculateCo2("MaterialDesconocido", 100)).toBe(0);
  });

  it("returns 0 for zero quantity", () => {
    expect(calculateCo2("Plástico PET", 0)).toBe(0);
  });

  it("uses custom factors when provided", () => {
    const custom = { "Plástico PET": 2.0 };
    expect(calculateCo2("Plástico PET", 10, custom)).toBeCloseTo(20.0);
  });

  it("custom factors fully replace defaults (unknown in custom returns 0)", () => {
    const custom = { "Plástico PET": 2.0 };
    // "Aluminio" is not in custom factors, so it should return 0
    expect(calculateCo2("Aluminio", 10, custom)).toBe(0);
  });
});

// ─── calculateEquivalencies ─────────────────────────────────────────────────

describe("calculateEquivalencies", () => {
  it("calculates trees correctly (co2 / 60)", () => {
    const result = calculateEquivalencies(600);
    expect(result.trees).toBe(10); // 600 / 60 = 10
  });

  it("calculates km not driven correctly (co2 / 0.244)", () => {
    const result = calculateEquivalencies(244);
    expect(result.kmNotDriven).toBe(1000); // 244 / 0.244 = 1000
  });

  it("calculates smartphones charged correctly (co2 / 0.0124)", () => {
    const result = calculateEquivalencies(1.24);
    expect(result.smartphonesCharged).toBe(100); // 1.24 / 0.0124 = 100
  });

  it("calculates homes energized correctly ((co2 / 7450) * 365)", () => {
    const result = calculateEquivalencies(7450);
    expect(result.homesEnergized).toBe(365); // (7450 / 7450) * 365 = 365
  });

  it("allows custom equivalencies to override defaults", () => {
    const result = calculateEquivalencies(100, { treesKgCo2PerYear: 10 });
    expect(result.trees).toBe(10); // 100 / 10 = 10
    // Other values should still use defaults
    expect(result.kmNotDriven).toBe(Math.round(100 / 0.244));
  });

  it("returns all zeros for zero co2", () => {
    const result = calculateEquivalencies(0);
    expect(result.trees).toBe(0);
    expect(result.kmNotDriven).toBe(0);
    expect(result.homesEnergized).toBe(0);
    expect(result.smartphonesCharged).toBe(0);
  });
});

// ─── calculateWaterSaved ────────────────────────────────────────────────────

describe("calculateWaterSaved", () => {
  it("calculates water saved for a single material", () => {
    const result = calculateWaterSaved([{ material: "Papel", kg: 10 }]);
    expect(result).toBe(260); // 10 * 26 = 260
  });

  it("sums water saved across multiple materials", () => {
    const result = calculateWaterSaved([
      { material: "Papel", kg: 10 },      // 10 * 26 = 260
      { material: "Aluminio", kg: 5 },     // 5 * 40 = 200
    ]);
    expect(result).toBe(460);
  });

  it("unknown material contributes 0 to water saved", () => {
    const result = calculateWaterSaved([
      { material: "Papel", kg: 10 },
      { material: "MaterialDesconocido", kg: 100 },
    ]);
    expect(result).toBe(260); // only Papel counts
  });

  it("uses custom factors when provided", () => {
    const custom = { "Papel": 50 };
    const result = calculateWaterSaved([{ material: "Papel", kg: 10 }], custom);
    expect(result).toBe(500); // 10 * 50 = 500
  });

  it("returns 0 for empty materials array", () => {
    expect(calculateWaterSaved([])).toBe(0);
  });
});

// ─── Constants ──────────────────────────────────────────────────────────────

describe("constants", () => {
  it("VALID_MATERIALS has all 20 expected materials", () => {
    expect(VALID_MATERIALS).toHaveLength(20);
    const expected = [
      "Plástico PET", "Plástico HDPE", "Plástico LDPE", "Plástico PP", "Plástico PS",
      "Cartón", "Papel", "Vidrio", "Aluminio", "Acero",
      "Madera", "Electrónicos", "RAE", "TetraPak", "Textil",
      "Aceite vegetal", "Orgánico", "Neumáticos", "Baterías", "Escombros",
    ];
    for (const m of expected) {
      expect(VALID_MATERIALS).toContain(m);
    }
  });

  it("DEFAULT_CO2_FACTORS values are within expected ranges", () => {
    // All factors should be positive
    for (const [, value] of Object.entries(DEFAULT_CO2_FACTORS)) {
      expect(value).toBeGreaterThan(0);
    }
    // Aluminium has highest factor (around 9)
    expect(DEFAULT_CO2_FACTORS["Aluminio"]).toBeGreaterThan(5);
    // Escombros has lowest factor (around 0.05)
    expect(DEFAULT_CO2_FACTORS["Escombros"]).toBeLessThan(0.1);
    // Plastics should be between 0.5 and 2
    expect(DEFAULT_CO2_FACTORS["Plástico PET"]).toBeGreaterThanOrEqual(0.5);
    expect(DEFAULT_CO2_FACTORS["Plástico PET"]).toBeLessThanOrEqual(2);
  });

  it("DEFAULT_WATER_FACTORS covers same materials as CO2 factors", () => {
    const co2Materials = Object.keys(DEFAULT_CO2_FACTORS);
    const waterMaterials = Object.keys(DEFAULT_WATER_FACTORS);
    expect(waterMaterials.sort()).toEqual(co2Materials.sort());
  });

  it("DEFAULT_EQUIVALENCIES values match documented EPA values", () => {
    expect(DEFAULT_EQUIVALENCIES.treesKgCo2PerYear).toBe(60.0);
    expect(DEFAULT_EQUIVALENCIES.kmCo2PerKm).toBe(0.244);
    expect(DEFAULT_EQUIVALENCIES.homesKgCo2PerYear).toBe(7450);
    expect(DEFAULT_EQUIVALENCIES.smartphoneKgCo2PerCharge).toBe(0.0124);
  });
});
