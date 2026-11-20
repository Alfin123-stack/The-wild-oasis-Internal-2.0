import { handler } from "@/lib/api-auth";
import { getInsightCards, getTodayTasks, todayKeyUTC, validKey } from "@/lib/insights";

// GET /api/insights?date=YYYY-MM-DD (hari kalender klien)
export const GET = handler(async (req) => {
  const d = new URL(req.url).searchParams.get("date");
  const date = validKey(d) ? d : todayKeyUTC();
  const [cards, tasks] = await Promise.all([getInsightCards(date), getTodayTasks(date)]);
  return { date, cards, tasks };
});
