import { DEFAULT_PALETTE, type BrandingPalette } from "./branding-colors";

export interface BrandingConfig {
  palette: BrandingPalette;
  fontFamily: "Helvetica" | "Times-Roman" | "Courier";
  hidePlatformBranding: boolean;
  signatureImageUrl?: string;
  secondaryLogoUrl?: string;
  closingText?: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  palette: DEFAULT_PALETTE,
  fontFamily: "Helvetica",
  hidePlatformBranding: false,
};
