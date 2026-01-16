import { create } from 'zustand';
import { API_URL } from "@/config";

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  get: (key: string, fallback?: string) => string;
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: {},
  isLoading: true,
  fetchSettings: async () => {
    try {
        // Fetch public settings (no auth required for basic UI)
        // Or fetch protected if admin logged in? 
        // For general UI (Logo/Name), we might need a public endpoint. 
        // I implemented /api/settings/public for this.
      const res = await fetch(`${API_URL}/api/settings/public`);
      if (res.ok) {
        const data = await res.json();
        set({ settings: data, isLoading: false });
      } else {
          set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ isLoading: false });
    }
  },
  get: (key: string, fallback: string = '') => {
    return get().settings[key] || fallback;
  },
}));
