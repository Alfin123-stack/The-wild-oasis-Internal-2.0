import Booking from "@/models/Booking";
import Setting from "@/models/Setting";
import { assertAdmin, assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { TRANSITIONS } from "@/lib/booking-rules";
import { bookingUpdateSchema } from "@/lib/validators";

export const GET = handler(async (_req, { params }) => {
  assertObjectId(params.id);
  const booking = await Booking.findOne({ _id: params.id, deletedAt: null })
    .populate("cabin")
    .populate("guest");
  if (!booking) throw new HttpError(404, "Booking not found");
  return booking;
});

export const PATCH = handler(async (req, { params, user }) => {
  assertObjectId(params.id);
  const data = bookingUpdateSchema.parse(await req.json());
  const current = await Booking.findOne({ _id: params.id, deletedAt: null });
  if (!current) throw new HttpError(404, "Booking not found");

  if (data.status && data.status !== current.status) {
    if (!TRANSITIONS[current.status]?.includes(data.status)) {
      throw new HttpError(409, `A ${current.status} booking cannot become ${data.status}`);
    }
  }
  // Harga hanya boleh berubah lewat check-in (tambah sarapan); selesai/batal dikunci.
  if (["checked-out", "cancelled"].includes(current.status) && Object.keys(data).length) {
    throw new HttpError(409, `A ${current.status} booking can no longer be changed`);
  }

  // Harga tidak dipercaya dari browser: dihitung ulang di server.
  delete data.totalPrice;
  delete data.extrasPrice;
  if (data.hasBreakfast === false && current.hasBreakfast) {
    throw new HttpError(409, "Breakfast can't be removed once it is on the booking");
  }
  if (data.hasBreakfast === true && !current.hasBreakfast) {
    const settings = (await Setting.findOne()) || (await Setting.create({}));
    data.extrasPrice = settings.breakFastPrice * current.numNights * current.numGuests;
    data.totalPrice = current.cabinPrice + data.extrasPrice;
  }
  if (data.status === "checked-in" && data.isPaid !== true && !current.isPaid) {
    throw new HttpError(409, "Confirm the payment before checking in");
  }

  const booking = await Booking.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
  const action = data.status ? `booking.${data.status}` : "booking.update";
  await logAudit(user, action, "booking", params.id, data.status ? `Status: ${current.status} to ${data.status}` : Object.keys(data).join(", "));
  return booking;
});

// Hapus = soft delete, hanya admin, dan tidak untuk tamu yang sedang menginap.
export const DELETE = handler(async (_req, { params, user }) => {
  assertAdmin(user);
  assertObjectId(params.id);
  const booking = await Booking.findOne({ _id: params.id, deletedAt: null });
  if (!booking) throw new HttpError(404, "Booking not found");
  if (booking.status === "checked-in") {
    throw new HttpError(409, "This guest is checked in. Check them out first, then delete the booking.");
  }
  booking.deletedAt = new Date();
  await booking.save();
  await logAudit(user, "booking.delete", "booking", params.id, "Moved to trash");
  return { success: true, id: String(booking._id) };
});
