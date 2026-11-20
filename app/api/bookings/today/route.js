import Booking from "@/models/Booking";
import { handler } from "@/lib/api-auth";
import { utcDayRange } from "@/lib/server-utils";

// Aktivitas hari ini: tamu yang akan check-in atau check-out hari ini.
export const GET = handler(async (req) => {
  // date=YYYY-MM-DD: hari kalender klien (hindari selisih zona waktu). Default: hari UTC server.
  const date = new URL(req.url).searchParams.get("date");
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? new Date(`${date}T00:00:00Z`) : new Date();
  const { start, end } = utcDayRange(Number.isNaN(day.getTime()) ? new Date() : day);
  return await Booking.find({
    deletedAt: null,
    $or: [
      { status: "unconfirmed", startDate: { $gte: start, $lte: end } },
      { status: "checked-in", endDate: { $gte: start, $lte: end } },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("cabin", "name")
    .populate("guest", "fullName nationality countryFlag");
});
