import Booking from "@/models/Booking";
import Guest from "@/models/Guest";
import Cabin from "@/models/Cabin";
import { handler } from "@/lib/api-auth";
import { keyOf } from "@/lib/insights";

const esc = (q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Pencarian global untuk Ctrl+K: tamu, booking (lewat tamu), dan cabin.
export const GET = handler(async (req) => {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (q.length < 2) return { guests: [], bookings: [], cabins: [] };
  const rx = new RegExp(esc(q), "i");
  const [guests, cabins] = await Promise.all([
    Guest.find({ $or: [{ fullName: rx }, { email: rx }] }).limit(5),
    Cabin.find({ name: rx }).limit(4),
  ]);
  const bookings = await Booking.find({ deletedAt: null, guest: { $in: guests.map((g) => g._id) } })
    .sort({ startDate: -1 })
    .limit(6)
    .populate("cabin", "name")
    .populate("guest", "fullName");
  return {
    guests: guests.map((g) => ({ id: String(g._id), fullName: g.fullName, email: g.email })),
    cabins: cabins.map((c) => ({ id: String(c._id), name: c.name })),
    bookings: bookings.map((b) => ({
      id: String(b._id),
      guest: b.guest?.fullName || "",
      cabin: b.cabin?.name || "",
      startDate: keyOf(b.startDate),
      endDate: keyOf(b.endDate),
      status: b.status,
    })),
  };
});
