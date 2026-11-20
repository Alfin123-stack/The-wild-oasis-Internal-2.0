"use client";

import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { getBookingsAfterDate } from "../../services/apiBookings";

// Mengambil 2x jendela waktu: separuh terbaru = periode ini, separuh lama = periode sebelumnya (untuk tren).
export function useRecentBookings() {
  const searchParams = useSearchParams();
  const getDate = !searchParams.get("last") ? 7 : Number(searchParams.get("last"));
  const now = new Date();
  const splitDate = subDays(now, getDate);
  const queryDate = subDays(now, getDate * 2).toISOString();

  const { isPending, data: all } = useQuery({
    queryFn: () => getBookingsAfterDate(queryDate),
    queryKey: ["bookings-recent", `last-${getDate}`],
  });

  const recentBookings = all?.filter((b) => new Date(b.created_at) >= splitDate);
  const previousBookings = all?.filter((b) => new Date(b.created_at) < splitDate);

  return { isPending, recentBookings, previousBookings };
}
