"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getCabins } from "../../services/apiCabins";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZE } from "../../utils/constant";

// all = true -> ambil semua cabin tanpa paginasi (dipakai dashboard).
// unpaged = true -> semua cabin, tetapi tetap memakai filter/sort dari URL (tampilan grid).
function useCabins({ all = false, unpaged = false } = {}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const discount = searchParams.get("discount") || "all";
  const sortBy = searchParams.get("sortBy") || "name-asc";
  const page = all || unpaged ? null : Number(searchParams.get("page")) || 1;

  const archived = searchParams.get("archived") === "1";
  const params = { page, discount, sortBy, archived };

  const {
    isLoading,
    data: { cabins, count } = {},
    error,
  } = useQuery({
    queryKey: ["cabins", all ? "all" : { discount, sortBy, page, archived }],
    queryFn: () => getCabins(all ? {} : params),
  });

  // Setelah menghapus item terakhir di halaman terakhir, halaman jadi kosong: mundur ke halaman valid terakhir.
  useEffect(() => {
    if (count === undefined || all || unpaged) return;
    const last = Math.max(1, Math.ceil(count / PAGE_SIZE));
    if (page && page > last) {
      const params = new URLSearchParams(searchParams.toString());
      if (last === 1) params.delete("page");
      else params.set("page", String(last));
      router.replace(`${pathname}?${params}`, { scroll: false });
    }
  }, [count, page, searchParams, router, pathname, all, unpaged]);

  // PRE-FETCHING halaman sebelum/sesudahnya
  const pageCount = Math.ceil((count || 0) / PAGE_SIZE);
  useEffect(() => {
    if (all || unpaged || !count) return;
    if (page < pageCount) {
      queryClient.prefetchQuery({
        queryKey: ["cabins", { discount, sortBy, page: page + 1 }],
        queryFn: () => getCabins({ discount, sortBy, page: page + 1 }),
      });
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["cabins", { discount, sortBy, page: page - 1 }],
        queryFn: () => getCabins({ discount, sortBy, page: page - 1 }),
      });
    }
  }, [all, unpaged, count, page, pageCount, discount, sortBy, queryClient]);

  return { isLoading, error, cabins, count };
}

export default useCabins;
