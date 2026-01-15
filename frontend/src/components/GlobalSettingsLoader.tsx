"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export default function GlobalSettingsLoader() {
  const fetchSettings = useSettings((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return null; // This component renders nothing
}
