import Booking from "@/models/Booking";
import { HttpError } from "@/lib/api-auth";

// Booking yang masih menghalangi cabin: tidak dihapus dan tidak dibatalkan.
export const BLOCKING = { deletedAt: null, status: { $ne: "cancelled" } };

const DAY = 86400000;
export const dayDate = (key) => new Date(`${key}T00:00:00Z`);
export const nightsBetween = (a, b) => Math.round((b - a) / DAY);

// Booking lain pada cabin yang sama dengan rentang beririsan. Tanggal akhir = hari check-out,
// jadi booking yang mulai tepat di hari check-out booking lain tidak dianggap bentrok.
export function overlapQuery(cabinId, start, end, excludeId) {
  const q = { cabin: cabinId, ...BLOCKING, startDate: { $lt: end }, endDate: { $gt: start } };
  if (excludeId) q._id = { $ne: excludeId };
  return q;
}

export async function assertNoConflict(cabinId, start, end, excludeId) {
  const clash = await Booking.findOne(overlapQuery(cabinId, start, end, excludeId)).select("_id");
  if (clash) throw new HttpError(409, "This cabin is already booked for part of those dates");
}

// Perpindahan status yang diizinkan.
export const TRANSITIONS = {
  unconfirmed: ["checked-in", "cancelled"],
  "checked-in": ["checked-out"],
  "checked-out": [],
  cancelled: [],
};
