import { create } from "zustand";
import * as squadService from "@/services/squadService";

export const useSquadStore = create((set) => ({
  squad: null,
  loading: false,
  error: null,

  fetchMySquad: async () => {
    try {
      set({ loading: true });
      const { data } = await squadService.getMySquad();
      set({ squad: data, loading: false });
    } catch (err) {
      set({ squad: null, loading: false });
    }
  },

  clearSquad: () => set({ squad: null })
}));
