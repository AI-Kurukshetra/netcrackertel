"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/ui-store";

export function ThemeSync() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("telecosync-theme", theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem("telecosync-theme");
    if (stored === "light" || stored === "dark") {
      useUiStore.getState().setTheme(stored);
    } else {
      useUiStore.getState().setTheme("dark");
    }
  }, []);

  return null;
}
