import Cabin from "@/models/Cabin";
import Booking from "@/models/Booking";
import { handler, HttpError } from "@/lib/api-auth";
import { dayDate, overlapQuery } from "@/lib/booking-rules";

// Cabin yang kosong untuk rentang tanggal dan muat jumlah tamu.
export const GET = handler(async (req) => {
  const sp = new URL(req.url).searchParams;
  const s = sp.get("start");
  const e = sp.get("end");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "") || !/^\d{4}-\d{2}-\d{2}$/.test(e || "")) {
    throw new HttpError(400, "start and end are required (YYYY-MM-DD)");
  }
  const start = dayDate(s);
  const end = dayDate(e);
  if (end <= start) throw new HttpError(400, "End must be after start");
  const guests = Math.max(1, Number(sp.get("guests")) || 1);

  const cabins = await Cabin.find({ isArchived: { $ne: true }, maxCapacity: { $gte: guests } }).sort({ name: 1 });
  const taken = await Booking.distinct("cabin", overlapQuery({ $in: cabins.map((c) => c._id) }, start, end));
  const takenSet = new Set(taken.map(String));
  return cabins.filter((c) => !takenSet.has(String(c._id)));
});
