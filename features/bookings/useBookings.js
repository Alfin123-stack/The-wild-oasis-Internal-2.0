"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getBookings } from "../../services/apiBookings";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZE } from "../../utils/constant";

function useBookings() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // FILTER, SORT, PAGINATION dari URL
  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "startDate-desc";
  const page = Number(searchParams.get("page")) || 1;
  const q = searchParams.get("q") || "";

  const {
    isPending: isLoading,
    data: { bookings, count } = {},
    error,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["bookings", status, sortBy, page, q],
    queryFn: () => getBookings({ status, sortBy, page, q }),
    // Saat filter/urutan/halaman berubah, tabel lama tetap tampil (diredupkan) alih-alih kembali ke skeleton.
    placeholderData: keepPreviousData,
  });

  // Setelah menghapus item terakhir di halaman terakhir, halaman jadi kosong: mundur ke halaman valid terakhir.
  useEffect(() => {
    if (count === undefined || isPlaceholderData) return;
    const last = Math.max(1, Math.ceil(count / PAGE_SIZE));
    if (page && page > last) {
      const params = new URLSearchParams(searchParams.toString());
      if (last === 1) params.delete("page");
      else params.set("page", String(last));
      router.replace(`${pathname}?${params}`, { scroll: false });
    }
  }, [count, page, searchParams, router, pathname, isPlaceholderData]);

  // PRE-FETCHING
  const pageCount = Math.ceil((count || 0) / PAGE_SIZE);
  useEffect(() => {
    if (!count) return;
    if (page < pageCount) {
      queryClient.prefetchQuery({
        queryKey: ["bookings", status, sortBy, page + 1, q],
        queryFn: () => getBookings({ status, sortBy, page: page + 1, q }),
      });
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["bookings", status, sortBy, page - 1, q],
        queryFn: () => getBookings({ status, sortBy, page: page - 1, q }),
      });
    }
  }, [count, page, pageCount, status, sortBy, q, queryClient]);

  return { isLoading, error, bookings, count, q, isPlaceholderData };
}

export default useBookings;
