import Guest from "@/models/Guest";
import Booking from "@/models/Booking";
import { handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { guestSchema } from "@/lib/validators";

const esc = (q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const GET = handler(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 60);
  const limit = Math.min(Number(sp.get("limit")) || 30, 100);
  const filter = q ? { $or: [{ fullName: new RegExp(esc(q), "i") }, { email: new RegExp(esc(q), "i") }] } : {};
  const guests = await Guest.find(filter).sort({ fullName: 1 }).limit(limit);

  // Jumlah booking per tamu, sekali query.
  const counts = await Booking.aggregate([
    { $match: { guest: { $in: guests.map((g) => g._id) }, deletedAt: null } },
    { $group: { _id: "$guest", n: { $sum: 1 } } },
  ]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return guests.map((g) => ({ ...g.toJSON(), bookingCount: byId[String(g._id)] || 0 }));
});

export const POST = handler(async (req, { user }) => {
  const data = guestSchema.parse(await req.json());
  if (await Guest.exists({ email: data.email })) {
    throw new HttpError(409, "A guest with this email already exists");
  }
  const guest = await Guest.create(data);
  await logAudit(user, "guest.create", "guest", guest._id, guest.fullName);
  return guest;
});
