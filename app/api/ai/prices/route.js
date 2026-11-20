import Cabin from "@/models/Cabin";
import { handler } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { aiEnabled, assertAiQuota, generateText } from "@/lib/ai/provider";
import { addDays, getCabinStats, todayKeyUTC, validKey } from "@/lib/insights";
import { getOccupancy } from "@/lib/insights";

// Saran harga: aturan sederhana dari okupansi internal. Angka dihitung server dan dibatasi
// maksimum 15%; model hanya menulis alasannya. Admin yang menerapkan, lewat edit cabin.
export const GET = handler(
  async (req, { user }) => {
    const d = new URL(req.url).searchParams.get("date");
    const today = validKey(d) ? d : todayKeyUTC();
    const [ahead, behind, cabins] = await Promise.all([
      getCabinStats(today, addDays(today, 30)),
      getCabinStats(addDays(today, -30), today),
      Cabin.find({ isArchived: { $ne: true } }).sort({ name: 1 }),
    ]);
    const overall = await getOccupancy(today, addDays(today, 30));
    const aheadBy = Object.fromEntries(ahead.map((c) => [c.cabinId, c]));
    const behindBy = Object.fromEntries(behind.map((c) => [c.cabinId, c]));

    const rows = cabins.map((c) => {
      const id = String(c._id);
      const next = aheadBy[id]?.occupancyPct ?? 0;
      const last = behindBy[id]?.occupancyPct ?? 0;
      const pct = next >= 85 ? 10 : next >= 70 ? 5 : next < 25 ? -10 : next < 40 ? -5 : 0;
      const suggested = Math.max(0, Math.round(c.regularPrice * (1 + pct / 100)));
      return {
        cabinId: id,
        cabin: c.name,
        currentPrice: c.regularPrice,
        suggestedPrice: suggested,
        changePct: pct,
        occupancyNext30: next,
        occupancyLast30: last,
        reason: pct === 0
          ? `Occupancy ${next}% over the next 30 days is in a healthy range.`
          : pct > 0
            ? `${next}% booked for the next 30 days, so demand is high.`
            : `Only ${next}% booked for the next 30 days, so a lower price may fill dates.`,
      };
    });

    let usedAi = false;
    if (aiEnabled() && rows.some((r) => r.changePct !== 0)) {
      try {
        assertAiQuota(user.id);
        const r = await generateText({
          json: true,
          system: "You explain price suggestions to a hotel manager. You do not change numbers. Use only the data given.",
          prompt: `For each cabin write one short sentence (max 20 words) explaining the suggestion. Return JSON: [{"cabinId": string, "reason": string}].\n${JSON.stringify(rows.map(({ cabinId, cabin, currentPrice, suggestedPrice, occupancyNext30, occupancyLast30 }) => ({ cabinId, cabin, currentPrice, suggestedPrice, occupancyNext30, occupancyLast30 })))}`,
        });
        const list = JSON.parse(r.text);
        const byId = Object.fromEntries((Array.isArray(list) ? list : []).map((x) => [x.cabinId, String(x.reason || "").slice(0, 200)]));
        rows.forEach((x) => { if (byId[x.cabinId]) x.reason = byId[x.cabinId]; });
        usedAi = true;
      } catch (err) {
        console.error("[ai] prices fallback:", err.message);
      }
    }
    await logAudit(user, "ai.prices", "cabin", "", usedAi ? "ai reasons" : "rule reasons");
    return {
      note: "Suggestions use your own bookings only. They do not include competitor rates, local events or seasons.",
      overallOccupancyNext30: overall.occupancyPct,
      suggestions: rows,
      usedAi,
    };
  },
  { admin: true }
);
