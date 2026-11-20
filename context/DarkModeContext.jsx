"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";

const DarkModeContext = createContext();

function DarkModeProvider({ children }) {
  // State awal sama di server & klien (false) untuk menghindari hydration mismatch.
  // Nilai sebenarnya dibaca setelah mount.
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let value = false;
    try {
      const stored = localStorage.getItem("isDarkMode");
      value =
        stored !== null
          ? JSON.parse(stored)
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {}
    setIsDarkMode(value);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark-mode", isDarkMode);
    root.classList.toggle("light-mode", !isDarkMode);
    try {
      localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
    } catch {}
  }, [isDarkMode, ready]);

  function paint(next) {
    const root = document.documentElement;
    root.classList.toggle("dark-mode", next);
    root.classList.toggle("light-mode", !next);
  }

  // Ganti tema dengan halus:
  //  - reduced-motion  -> instan
  //  - View Transitions -> cross-fade snapshot halaman
  //  - lainnya         -> kelas .theme-switching (transisi warna serempak ~300ms)
  function handleDarkMode() {
    const next = !isDarkMode;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      paint(next);
      setIsDarkMode(next);
      return;
    }

    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        paint(next);
        // flushSync: state (dipakai grafik Recharts) ikut berubah sebelum snapshot baru diambil.
        flushSync(() => setIsDarkMode(next));
      });
      return;
    }

    const root = document.documentElement;
    root.classList.add("theme-switching");
    paint(next);
    setIsDarkMode(next);
    window.setTimeout(() => root.classList.remove("theme-switching"), 320);
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, handleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error("useDarkMode must be used within a DarkModeProvider");
  return context;
}

export { DarkModeProvider, useDarkMode };
