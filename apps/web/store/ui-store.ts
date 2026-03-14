"use client";

import { create } from "zustand";

type UiState = {
  paletteOpen: boolean;
  notificationOpen: boolean;
  theme: "light" | "dark";
  togglePalette: (open?: boolean) => void;
  toggleNotification: (open?: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
};

export const useUiStore = create<UiState>((set) => ({
  paletteOpen: false,
  notificationOpen: false,
  theme: "dark",
  togglePalette: (open) => set((state) => ({ paletteOpen: open ?? !state.paletteOpen })),
  toggleNotification: (open) => set((state) => ({ notificationOpen: open ?? !state.notificationOpen })),
  setTheme: (theme) => set({ theme })
}));
