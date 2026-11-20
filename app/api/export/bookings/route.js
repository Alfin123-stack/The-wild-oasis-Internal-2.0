import Booking from "@/models/Booking";
import Guest from "@/models/Guest";
import { requireUser, errorResponse } from "@/lib/api-auth";
import { keyOf } from "@/lib/insights";

// Sel yang diawali = + - @ dibuka sebagai rumus di Excel; beri awalan ' agar aman (CSV injection).
const cell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req) {
  try {
    await requireUser();
    const sp = new URL(req.url).searchParams;
    const filter = { deletedAt: null };
    const status = sp.get("status");
    if (["unconfirmed", "checked-in", "checked-out", "cancelled"].includes(status)) filter.status = status;
    const q = (sp.get("q") || "").trim().slice(0, 60);
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const guests = await Guest.find({ $or: [{ fullName: rx }, { email: rx }] }).select("_id").limit(300);
      filter.guest = { $in: guests.map((g) => g._id) };
    }
    const rows = await Booking.find(filter)
      .sort({ startDate: -1 })
      .limit(5000)
      .populate("cabin", "name")
      .populate("guest", "fullName email");

    const head = ["Booking ID", "Guest", "Email", "Cabin", "Check-in", "Check-out", "Nights", "Guests", "Status", "Paid", "Breakfast", "Total"];
    const lines = [head.map(cell).join(",")];
    for (const b of rows) {
      lines.push(
        [
          b._id,
          b.guest?.fullName,
          b.guest?.email,
          b.cabin?.name,
          keyOf(b.startDate),
          keyOf(b.endDate),
          b.numNights,
          b.numGuests,
          b.status,
          b.isPaid ? "yes" : "no",
          b.hasBreakfast ? "yes" : "no",
          b.totalPrice,
        ]
          .map(cell)
          .join(",")
      );
    }
    return new Response("﻿" + lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bookings-${keyOf(new Date())}.csv"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
