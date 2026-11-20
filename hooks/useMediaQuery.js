"use client";

import { useSyncExternalStore } from "react";

// Mengikuti media query di JS (untuk perilaku yang tidak bisa hanya CSS, mis. sidebar rail).
// Snapshot server = false supaya hidrasi konsisten; nilai sebenarnya dibaca setelah mount.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
