import Cabin from "@/models/Cabin";
import Booking from "@/models/Booking";
import { assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { cabinUpdateSchema } from "@/lib/validators";

export const PATCH = handler(async (req, { params, user }) => {
  assertObjectId(params.id);
  const data = cabinUpdateSchema.parse(await req.json());
  const cabin = await Cabin.findById(params.id);
  if (!cabin) throw new HttpError(404, "Cabin not found");
  if (data.isArchived === true && !cabin.isArchived) {
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    const upcoming = await Booking.countDocuments({
      cabin: cabin._id,
      deletedAt: null,
      status: { $in: ["unconfirmed", "checked-in"] },
      endDate: { $gt: today },
    });
    if (upcoming > 0) {
      throw new HttpError(
        409,
        `This cabin has ${upcoming} current or upcoming booking${upcoming > 1 ? "s" : ""}. Cancel or finish them first, then archive it.`
      );
    }
  }
  cabin.set(data);
  await cabin.save(); // menjalankan validator (discount <= regularPrice)
  await logAudit(user, data.isArchived === undefined ? "cabin.update" : data.isArchived ? "cabin.archive" : "cabin.unarchive", "cabin", cabin._id, cabin.name);
  return cabin;
}, { admin: true });

export const DELETE = handler(async (_req, { params, user }) => {
  assertObjectId(params.id);
  const used = await Booking.exists({ cabin: params.id });
  if (used) {
    throw new HttpError(409, "This cabin has bookings. Archive it instead of deleting.");
  }
  const deleted = await Cabin.findByIdAndDelete(params.id);
  if (!deleted) throw new HttpError(404, "Cabin not found");
  await logAudit(user, "cabin.delete", "cabin", params.id, deleted.name);
  return { success: true };
}, { admin: true });
