import Booking from "@/models/Booking";
import { handler } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { aiEnabled, assertAiQuota, generateText } from "@/lib/ai/provider";
import { addDays, getCabinStats, getOccupancy, getInsightCards, todayKeyUTC, validKey } from "@/lib/insights";
import { dayDate } from "@/lib/booking-rules";

const sum = (a, k) => a.reduce((n, x) => n + (x[k] || 0), 0);

// Laporan mingguan: angka dihitung server; model hanya merapikan kalimatnya (jika AI aktif).
export const GET = handler(
  async (req, { user }) => {
    const d = new URL(req.url).searchParams.get("date");
    const today = validKey(d) ? d : todayKeyUTC();
    const wk = addDays(today, -7);
    const prev = addDays(today, -14);

    const [occ, occPrev, stats, statsPrev, cancelled, newBookings, cards] = await Promise.all([
      getOccupancy(wk, today),
      getOccupancy(prev, wk),
      getCabinStats(wk, today),
      getCabinStats(prev, wk),
      Booking.countDocuments({ deletedAt: null, status: "cancelled", updatedAt: { $gte: dayDate(wk) } }),
      Booking.countDocuments({ deletedAt: null, status: { $ne: "cancelled" }, createdAt: { $gte: dayDate(wk) } }),
      getInsightCards(today),
    ]);
    const revenue = sum(stats, "revenue");
    const revenuePrev = sum(statsPrev, "revenue");
    const figures = {
      period: `${wk} to ${today}`,
      occupancyPct: occ.occupancyPct,
      occupancyPrevPct: occPrev.occupancyPct,
      revenue,
      revenuePrev,
      newBookings,
      cancellations: cancelled,
      lateCheckOuts: cards.find((c) => c.id === "overdue")?.value ?? 0,
      unpaidArrivals: cards.find((c) => c.id === "unpaid")?.value ?? 0,
      topCabin: [...stats].sort((a, b) => b.revenue - a.revenue)[0]?.cabin || "",
    };

    const fallback = [
      `Week ${figures.period}: occupancy ${figures.occupancyPct}% (previous week ${figures.occupancyPrevPct}%).`,
      `Revenue $${revenue} (previous week $${revenuePrev}). ${newBookings} new bookings, ${cancelled} cancellations.`,
      figures.topCabin ? `Top cabin by revenue: ${figures.topCabin}.` : "",
      figures.lateCheckOuts ? `${figures.lateCheckOuts} late check-out(s) need attention.` : "",
      figures.unpaidArrivals ? `${figures.unpaidArrivals} arrival(s) are still unpaid.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    let narrative = fallback;
    let usedAi = false;
    if (aiEnabled()) {
      try {
        assertAiQuota(user.id);
        const r = await generateText({
          system: "You turn hotel figures into a short weekly summary for the manager. Use only the numbers given. No invented causes.",
          prompt: `Write 3 to 5 plain sentences summarising this week. Mention what changed versus the previous week and what needs attention.\n${JSON.stringify(figures)}`,
        });
        narrative = r.text;
        usedAi = true;
      } catch (err) {
        console.error("[ai] report fallback:", err.message);
      }
    }
    await logAudit(user, "ai.report", "report", "", usedAi ? "ai" : "template");
    return { figures, narrative, usedAi };
  },
  { admin: true }
);
