"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Pengganti setSearchParams react-router: Next.js hanya menyediakan pembacaan
// search params, jadi pembaruan dilakukan lewat router.replace.
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) params.delete(key);
      else params.set(key, String(value));
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { searchParams, setParams };
}
