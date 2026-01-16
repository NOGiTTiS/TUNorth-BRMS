"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export default function GlobalSettingsLoader() {
  const { fetchSettings, get } = useSettings();
  const themeColor = get("theme_color");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply Theme Colors
  useEffect(() => {
    if (themeColor) {
      document.documentElement.style.setProperty("--tu-pink", themeColor);
    }
    const themeColorSecondary = get("theme_color_secondary");
    if (themeColorSecondary) {
      document.documentElement.style.setProperty(
        "--tu-pink-hover",
        themeColorSecondary
      );
      document.documentElement.style.setProperty(
        "--tu-pink-light",
        themeColorSecondary
      );
    }

    // Gradient Background
    const bgStart = get("bg_color_start");
    const bgEnd = get("bg_color_end");
    if (bgStart) {
      document.documentElement.style.setProperty("--bg-start", bgStart);
    }
    if (bgEnd) {
      document.documentElement.style.setProperty("--bg-end", bgEnd);
    }
  }, [themeColor, get]);

  return null; // This component renders nothing
}
