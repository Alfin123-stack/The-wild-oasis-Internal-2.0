"use client";

import { useTimeline } from "../bookings/useTimeline";
import { diffDays, keyToDate, todayKey } from "../../utils/dates";

// Status cabin hari ini dari booking yang beririsan: occupied | departing | arriving | vacant
export function useCabinStatus() {
  const t = keyToDate(todayKey());
  const { bookings, isPending } = useTimeline(t, t);
  const map = {};

  (bookings || []).forEach((b) => {
    const id = b.cabins?.id;
    if (!id) return;
    if (b.status === "checked-in") {
      map[id] = diffDays(b.endDate, t) === 0 ? "departing" : "occupied";
    } else if (b.status === "unconfirmed" && diffDays(b.startDate, t) === 0 && !map[id]) {
      map[id] = "arriving";
    }
  });

  return { isPending, statusOf: (id) => map[id] || "vacant" };
}
