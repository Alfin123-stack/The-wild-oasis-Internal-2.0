import Booking from "@/models/Booking";
import { handler, HttpError } from "@/lib/api-auth";
import { BLOCKING } from "@/lib/booking-rules";
import { utcDayRange } from "@/lib/server-utils";

// GET /api/bookings/range?kind=bookings|stays&date=<ISO>
//  - bookings: booking yang DIBUAT sejak `date` (untuk Sales & Bookings di dashboard)
//  - stays:    booking yang DIMULAI sejak `date` (untuk occupancy & durasi)
//  - timeline: GET ...?kind=timeline&from=<ISO>&to=<ISO> (booking yang beririsan)
export const GET = handler(async (req) => {
  const sp = new URL(req.url).searchParams;
  const kind = sp.get("kind");

  // timeline: booking yang beririsan dengan jendela [from, to] (maks 92 hari)
  if (kind === "timeline") {
    const tFrom = new Date(sp.get("from"));
    const tTo = new Date(sp.get("to"));
    if (Number.isNaN(tFrom.getTime()) || Number.isNaN(tTo.getTime()) || tTo < tFrom) {
      throw new HttpError(400, "Invalid from/to");
    }
    if (tTo - tFrom > 92 * 24 * 60 * 60 * 1000) throw new HttpError(400, "Range too large");
    return await Booking.find({ ...BLOCKING, startDate: { $lte: tTo }, endDate: { $gte: tFrom } })
      .sort({ startDate: 1 })
      .populate("cabin", "name")
      .populate("guest", "fullName email nationality countryFlag");
  }

  const from = new Date(sp.get("date"));
  if (Number.isNaN(from.getTime())) throw new HttpError(400, "Invalid date");
  const { end } = utcDayRange();

  if (kind === "bookings") {
    return await Booking.find({ ...BLOCKING, createdAt: { $gte: from, $lte: end } }).select(
      "createdAt totalPrice extrasPrice"
    );
  }
  if (kind === "stays") {
    return await Booking.find({ ...BLOCKING, startDate: { $gte: from, $lte: end } }).populate(
      "guest",
      "fullName"
    );
  }
  throw new HttpError(400, "kind must be 'bookings' or 'stays'");
});
