import Guest from "@/models/Guest";
import Booking from "@/models/Booking";
import { assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { guestUpdateSchema } from "@/lib/validators";

export const GET = handler(async (_req, { params }) => {
  assertObjectId(params.id);
  const guest = await Guest.findById(params.id);
  if (!guest) throw new HttpError(404, "Guest not found");
  const bookings = await Booking.find({ guest: guest._id, deletedAt: null })
    .sort({ startDate: -1 })
    .limit(50)
    .populate("cabin", "name");
  return { ...guest.toJSON(), bookings };
});

export const PATCH = handler(async (req, { params, user }) => {
  assertObjectId(params.id);
  const data = guestUpdateSchema.parse(await req.json());
  const guest = await Guest.findById(params.id);
  if (!guest) throw new HttpError(404, "Guest not found");
  if (data.email && data.email !== guest.email && (await Guest.exists({ email: data.email }))) {
    throw new HttpError(409, "Another guest already uses this email");
  }
  guest.set(data);
  await guest.save();
  await logAudit(user, "guest.update", "guest", guest._id, guest.fullName);
  return guest;
});
