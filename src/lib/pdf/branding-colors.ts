export interface BrandingPalette {
  primary: string;
  primaryLight: string;
  primaryBg: string;
  dark: string;
  border: string;
  gray: string;
}

export const DEFAULT_PALETTE: BrandingPalette = {
  primary: "#4a6b4e",
  primaryLight: "#7c9a82",
  primaryBg: "#f4f7f4",
  dark: "#2d3a2e",
  border: "#d4e4d6",
  gray: "#888888",
};

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function derivePalette(hex: string): BrandingPalette {
  const [h, s, l] = hexToHsl(hex);

  return {
    primary: hex,
    primaryLight: hslToHex(h, Math.max(0, s - 20), Math.min(100, l + 15)),
    primaryBg: hslToHex(h, Math.max(0, s - 40), 96),
    dark: hslToHex(h, Math.min(s, 15), 18),
    border: hslToHex(h, Math.max(0, s - 30), 85),
    gray: "#888888",
  };
}
