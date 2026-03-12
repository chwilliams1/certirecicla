"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function TrackPricingView() {
  useEffect(() => {
    analytics.viewPricing();
  }, []);
  return null;
}
