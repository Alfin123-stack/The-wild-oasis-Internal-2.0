import Booking from "@/models/Booking";
import { assertAdmin, assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { assertNoConflict } from "@/lib/booking-rules";

// Undo hapus. Dicek ulang bentrok karena cabin bisa saja sudah dipesan orang lain.
export const POST = handler(async (_req, { params, user }) => {
  assertAdmin(user);
  assertObjectId(params.id);
  const booking = await Booking.findOne({ _id: params.id, deletedAt: { $ne: null } });
  if (!booking) throw new HttpError(404, "Nothing to restore");
  if (booking.status !== "cancelled") {
    await assertNoConflict(booking.cabin, booking.startDate, booking.endDate, booking._id);
  }
  booking.deletedAt = null;
  await booking.save();
  await logAudit(user, "booking.restore", "booking", params.id, "Restored from trash");
  return booking;
});
