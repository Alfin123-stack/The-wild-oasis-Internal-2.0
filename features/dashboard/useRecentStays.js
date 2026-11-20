"use client";

import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { getStaysAfterDate } from "../../services/apiBookings";

export function useRecentStays() {
  const searchParams = useSearchParams();
  const getDate = !searchParams.get("last") ? 7 : Number(searchParams.get("last"));
  const now = new Date();
  const splitDate = subDays(now, getDate);
  const queryDate = subDays(now, getDate * 2).toISOString();

  const { isPending, data: all } = useQuery({
    queryFn: () => getStaysAfterDate(queryDate),
    queryKey: ["stays", `last-${getDate}`],
  });

  const isConfirmed = (s) => s.status === "checked-in" || s.status === "checked-out";
  const recentStays = all?.filter((s) => new Date(s.startDate) >= splitDate);
  const confirmedStay = recentStays?.filter(isConfirmed);
  const previousConfirmed = all?.filter((s) => new Date(s.startDate) < splitDate).filter(isConfirmed);

  return { isPending, recentStays, confirmedStay, previousConfirmed, getDate };
}
