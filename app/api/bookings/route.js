import Booking from "@/models/Booking";
import Guest from "@/models/Guest";
import Cabin from "@/models/Cabin";
import Setting from "@/models/Setting";
import { handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { bookingCreateSchema, guestSchema } from "@/lib/validators";
import { assertNoConflict, dayDate, nightsBetween, overlapQuery } from "@/lib/booking-rules";
import { paginate, parsePage, parseSort } from "@/lib/server-utils";

const STATUSES = ["unconfirmed", "checked-in", "checked-out", "cancelled"];

export const GET = handler(async (req) => {
  const sp = new URL(req.url).searchParams;

  const filter = { deletedAt: null };
  const status = sp.get("status");
  if (STATUSES.includes(status)) filter.status = status;

  // Pencarian: nama atau email tamu
  const q = (sp.get("q") || "").trim().slice(0, 60);
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const guests = await Guest.find({ $or: [{ fullName: rx }, { email: rx }] })
      .select("_id")
      .limit(300);
    filter.guest = { $in: guests.map((g) => g._id) };
  }

  const sort = parseSort(sp.get("sortBy"), ["startDate", "totalPrice"], {
    startDate: -1,
  });

  const query = Booking.find(filter)
    .sort(sort)
    .populate("cabin", "name")
    .populate("guest", "fullName email");

  const [bookings, count] = await Promise.all([
    paginate(query, parsePage(sp)),
    Booking.countDocuments(filter),
  ]);
  return { bookings, count };
});

// Membuat booking baru. Harga, jumlah malam, dan bentrok dihitung di server;
// angka dari browser tidak dipercaya.
export const POST = handler(async (req, { user }) => {
  const data = bookingCreateSchema.parse(await req.json());
  const start = dayDate(data.startDate);
  const end = dayDate(data.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new HttpError(400, "Invalid dates");

  const numNights = nightsBetween(start, end);
  if (numNights < 1) throw new HttpError(400, "Check-out must be after check-in");
  const yesterday = Date.now() - 86400000;
  if (start.getTime() < yesterday - (yesterday % 86400000)) {
    throw new HttpError(400, "Start date cannot be in the past");
  }

  const settings = (await Setting.findOne()) || (await Setting.create({}));
  if (numNights < settings.minBookingLength) {
    throw new HttpError(400, `Minimum stay is ${settings.minBookingLength} nights`);
  }
  if (numNights > settings.maxBookingLength) {
    throw new HttpError(400, `Maximum stay is ${settings.maxBookingLength} nights`);
  }
  if (data.numGuests > settings.maxGuestsPerBooking) {
    throw new HttpError(400, `Maximum ${settings.maxGuestsPerBooking} guests per booking`);
  }

  const cabin = await Cabin.findById(data.cabin);
  if (!cabin || cabin.isArchived) throw new HttpError(404, "Cabin not available");
  if (data.numGuests > cabin.maxCapacity) {
    throw new HttpError(400, `This cabin sleeps up to ${cabin.maxCapacity} guests`);
  }
  await assertNoConflict(cabin._id, start, end);

  let guestId = data.guest;
  if (data.newGuest) {
    const g = guestSchema.parse(data.newGuest);
    const existing = await Guest.findOne({ email: g.email });
    guestId = existing ? existing._id : (await Guest.create(g))._id;
  } else if (!(await Guest.exists({ _id: guestId }))) {
    throw new HttpError(404, "Guest not found");
  }

  const cabinPrice = numNights * (cabin.regularPrice - cabin.discount);
  const extrasPrice = data.hasBreakfast ? settings.breakFastPrice * numNights * data.numGuests : 0;

  const booking = await Booking.create({
    startDate: start,
    endDate: end,
    numNights,
    numGuests: data.numGuests,
    cabinPrice,
    extrasPrice,
    totalPrice: cabinPrice + extrasPrice,
    status: "unconfirmed",
    hasBreakfast: data.hasBreakfast,
    isPaid: data.isPaid,
    observations: data.observations,
    cabin: cabin._id,
    guest: guestId,
    createdBy: user.id,
  });

  // Dua staf menyimpan hampir bersamaan: yang dibuat lebih akhir mengalah.
  const clash = await Booking.findOne({
    ...overlapQuery(cabin._id, start, end, booking._id),
    _id: { $lt: booking._id },
  }).select("_id");
  if (clash) {
    await Booking.deleteOne({ _id: booking._id });
    throw new HttpError(409, "This cabin was just booked by someone else for those dates");
  }

  await logAudit(user, "booking.create", "booking", booking._id, `${cabin.name}, ${data.startDate} to ${data.endDate}`);
  return booking;
});
