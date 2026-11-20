"use client";

import { useQuery } from "@tanstack/react-query";
import { getTimelineBookings } from "../../services/apiBookings";

// from/to: Date. Dinormalisasi ke batas hari UTC supaya queryKey stabil.
export function useTimeline(from, to) {
  const f = new Date(from);
  f.setUTCHours(0, 0, 0, 0);
  const t = new Date(to);
  t.setUTCHours(23, 59, 59, 999);

  const { isPending, data: bookings, error } = useQuery({
    queryKey: ["timeline", f.toISOString(), t.toISOString()],
    queryFn: () => getTimelineBookings(f.toISOString(), t.toISOString()),
  });

  return { isPending, bookings, error };
}
