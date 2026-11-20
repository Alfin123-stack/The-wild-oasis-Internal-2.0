import Booking from "@/models/Booking";
import Cabin from "@/models/Cabin";
import Setting from "@/models/Setting";
import { BLOCKING, dayDate } from "@/lib/booking-rules";

const DAY = 86400000;
export const keyOf = (d) => new Date(d).toISOString().slice(0, 10);
export const addDays = (key, n) => keyOf(dayDate(key).getTime() + n * DAY);
export const validKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k || "") && !Number.isNaN(dayDate(k).getTime());
export const todayKeyUTC = () => keyOf(new Date());

export async function getSettings() {
  return (await Setting.findOne()) || (await Setting.create({}));
}

// Okupansi untuk [from, to) dalam hari. Dihitung dari malam yang terisi / (cabin aktif x hari).
export async function getOccupancy(fromKey, toKey) {
  const from = dayDate(fromKey);
  const to = dayDate(toKey);
  const days = Math.max(1, Math.round((to - from) / DAY));
  const cabinCount = await Cabin.countDocuments({ isArchived: { $ne: true } });
  const bookings = await Booking.find({ ...BLOCKING, startDate: { $lt: to }, endDate: { $gt: from } }).select(
    "startDate endDate"
  );
  const perDay = Array.from({ length: days }, () => 0);
  for (const b of bookings) {
    const s = Math.max(b.startDate.getTime(), from.getTime());
    const e = Math.min(b.endDate.getTime(), to.getTime());
    for (let t = s; t < e; t += DAY) perDay[Math.round((t - from.getTime()) / DAY)] += 1;
  }
  const occupiedNights = perDay.reduce((a, b) => a + b, 0);
  const capacity = cabinCount * days;
  return {
    from: fromKey,
    to: toKey,
    cabins: cabinCount,
    occupiedNights,
    capacityNights: capacity,
    occupancyPct: capacity ? Math.min(100, Math.round((occupiedNights / capacity) * 1000) / 10) : 0,
    daily: perDay.map((n, i) => ({
      date: addDays(fromKey, i),
      occupied: n,
      pct: cabinCount ? Math.min(100, Math.round((n / cabinCount) * 100)) : 0,
    })),
  };
}

// Pendapatan dan malam terisi per cabin pada [from, to).
export async function getCabinStats(fromKey, toKey) {
  const from = dayDate(fromKey);
  const to = dayDate(toKey);
  const days = Math.max(1, Math.round((to - from) / DAY));
  const cabins = await Cabin.find({ isArchived: { $ne: true } }).sort({ name: 1 });
  const bookings = await Booking.find({ ...BLOCKING, startDate: { $lt: to }, endDate: { $gt: from } }).select(
    "cabin startDate endDate totalPrice numNights"
  );
  const map = new Map(cabins.map((c) => [String(c._id), { cabin: c.name, cabinId: String(c._id), nights: 0, revenue: 0, bookings: 0 }]));
  for (const b of bookings) {
    const row = map.get(String(b.cabin));
    if (!row) continue;
    const s = Math.max(b.startDate.getTime(), from.getTime());
    const e = Math.min(b.endDate.getTime(), to.getTime());
    const nights = Math.max(0, Math.round((e - s) / DAY));
    row.nights += nights;
    row.bookings += 1;
    // Pendapatan dibagi proporsional bila booking melewati batas rentang.
    row.revenue += b.numNights ? Math.round((b.totalPrice * nights) / b.numNights) : 0;
  }
  return [...map.values()].map((r) => ({ ...r, occupancyPct: Math.round((r.nights / days) * 1000) / 10 }));
}

const summarize = (b) => ({
  id: String(b.id || b._id),
  guest: b.guest?.fullName || "",
  guestEmail: b.guest?.email || "",
  cabin: b.cabin?.name || "",
  startDate: keyOf(b.startDate),
  endDate: keyOf(b.endDate),
  nights: b.numNights,
  status: b.status,
  isPaid: b.isPaid,
  total: b.totalPrice,
});

const populate = (q) => q.populate("cabin", "name").populate("guest", "fullName email");

// Tugas hari ini: yang bisa langsung ditindaklanjuti staf.
export async function getTodayTasks(todayKey) {
  const day = dayDate(todayKey);
  const next = new Date(day.getTime() + DAY);
  const settings = await getSettings();
  const soon = new Date(day.getTime() + (settings.unpaidWithinDays + 1) * DAY);

  const [checkIns, checkOuts, overdue, unpaid] = await Promise.all([
    populate(Booking.find({ deletedAt: null, status: "unconfirmed", startDate: { $gte: day, $lt: next } })),
    populate(Booking.find({ deletedAt: null, status: "checked-in", endDate: { $gte: day, $lt: next } })),
    populate(Booking.find({ deletedAt: null, status: "checked-in", endDate: { $lt: day } })),
    populate(
      Booking.find({
        ...BLOCKING,
        isPaid: false,
        status: "unconfirmed",
        startDate: { $gte: day, $lt: soon },
      }).sort({ startDate: 1 })
    ),
  ]);
  return {
    date: todayKey,
    checkIns: checkIns.map(summarize),
    checkOuts: checkOuts.map(summarize),
    overdueCheckOuts: overdue.map(summarize),
    unpaidSoon: unpaid.map(summarize),
  };
}

const escRx = (q) => String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Pencarian booking untuk asisten. Semua tanggal inklusif (YYYY-MM-DD).
//  arrivesFrom/To = tanggal check-in, departsFrom/To = tanggal check-out,
//  stayingFrom/To = menginap pada rentang itu (booking yang beririsan).
export async function searchBookings({
  status, arrivesFrom, arrivesTo, departsFrom, departsTo, stayingFrom, stayingTo, cabin, unpaid, limit = 30,
} = {}) {
  const filter = { deletedAt: null };
  if (["unconfirmed", "checked-in", "checked-out", "cancelled"].includes(status)) filter.status = status;
  const and = [];
  const span = (field, from, to) => {
    const c = {};
    if (validKey(from)) c.$gte = dayDate(from);
    if (validKey(to)) c.$lt = new Date(dayDate(to).getTime() + DAY);
    if (Object.keys(c).length) and.push({ [field]: c });
  };
  span("startDate", arrivesFrom, arrivesTo);
  span("endDate", departsFrom, departsTo);
  if (validKey(stayingFrom) || validKey(stayingTo)) {
    if (validKey(stayingTo)) and.push({ startDate: { $lt: new Date(dayDate(stayingTo).getTime() + DAY) } });
    if (validKey(stayingFrom)) and.push({ endDate: { $gt: dayDate(stayingFrom) } });
  }
  if (and.length) filter.$and = and;
  if (unpaid) filter.isPaid = false;
  if (cabin) {
    // Filter cabin di database (bukan setelah limit), agar hasil tidak terpotong diam-diam.
    const ids = await Cabin.find({ name: new RegExp(escRx(cabin), "i") }).distinct("_id");
    filter.cabin = { $in: ids };
  }
  const max = Math.min(limit, 50);
  const [rows, total] = await Promise.all([
    populate(Booking.find(filter).sort({ startDate: 1 }).limit(max)),
    Booking.countDocuments(filter),
  ]);
  return { rows: rows.map(summarize), total, truncated: total > max };
}

// Kartu insight berbasis aturan (tanpa AI). Setiap kartu: angka, aturan, dan tautan ke daftar.
export async function getInsightCards(todayKey) {
  const settings = await getSettings();
  const tasks = await getTodayTasks(todayKey);
  const horizon = addDays(todayKey, 14);
  const occ = await getOccupancy(todayKey, horizon);
  const lowDays = occ.daily.filter((d) => d.pct < settings.lowOccupancyPct);

  const idleFrom = addDays(todayKey, -settings.idleCabinDays);
  const idleStats = await getCabinStats(idleFrom, todayKey);
  const idle = idleStats.filter((c) => c.bookings === 0);

  const weekAgo = addDays(todayKey, -7);
  const fourWeeksAgo = addDays(todayKey, -35);
  const [cancelWeek, cancelPrev] = await Promise.all([
    Booking.countDocuments({ deletedAt: null, status: "cancelled", updatedAt: { $gte: dayDate(weekAgo) } }),
    Booking.countDocuments({
      deletedAt: null,
      status: "cancelled",
      updatedAt: { $gte: dayDate(fourWeeksAgo), $lt: dayDate(weekAgo) },
    }),
  ]);
  const avgPrev = cancelPrev / 4;

  return [
    {
      id: "overdue",
      tone: tasks.overdueCheckOuts.length ? "alert" : "ok",
      title: "Late check-outs",
      value: tasks.overdueCheckOuts.length,
      rule: "Checked in, and the end date has passed.",
      href: "/bookings?status=checked-in&sortBy=startDate-asc",
      items: tasks.overdueCheckOuts.slice(0, 5),
    },
    {
      id: "unpaid",
      tone: tasks.unpaidSoon.length ? "warn" : "ok",
      title: "Unpaid arrivals",
      value: tasks.unpaidSoon.length,
      rule: `Arriving within ${settings.unpaidWithinDays} days and not paid.`,
      href: "/bookings?status=unconfirmed&sortBy=startDate-asc",
      items: tasks.unpaidSoon.slice(0, 5),
    },
    {
      id: "quiet",
      tone: lowDays.length ? "warn" : "ok",
      title: "Quiet dates ahead",
      value: lowDays.length,
      rule: `Days in the next 14 with occupancy under ${settings.lowOccupancyPct}%.`,
      href: "/bookings/timeline",
      items: lowDays.slice(0, 5).map((d) => ({ label: `${d.date}: ${d.pct}%` })),
    },
    {
      id: "idle",
      tone: idle.length ? "warn" : "ok",
      title: "Idle cabins",
      value: idle.length,
      rule: `No bookings in the last ${settings.idleCabinDays} days.`,
      href: "/cabins",
      items: idle.slice(0, 5).map((c) => ({ label: c.cabin })),
    },
    {
      id: "cancellations",
      tone: cancelWeek > 2 * avgPrev && cancelWeek >= 2 ? "alert" : "ok",
      title: "Cancellations this week",
      value: cancelWeek,
      rule: `Alert when more than twice the 4-week average (${avgPrev.toFixed(1)} per week).`,
      href: "/bookings?status=cancelled",
      items: [],
    },
  ];
}
