"use client";

import { useEffect } from "react";

// Peringatan bawaan browser saat menutup/memuat ulang tab dengan form yang belum disimpan.
export function useUnsavedWarning(isDirty) {
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}
