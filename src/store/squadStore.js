import { create } from "zustand";
import * as squadService from "@/services/squadService";

export const useSquadStore = create((set) => ({
  squad: null,
  loading: false,
  error: null,

  fetchMySquad: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await squadService.getMySquad();
      set({ squad: data, loading: false });
    } catch (err) {
      set({ squad: null, loading: false });
    }
  },

  refreshSquad: async () => {
    const { data } = await squadService.getMySquad();
    set({ squad: data });
  },

  clearSquad: () => set({ squad: null }),
}));
