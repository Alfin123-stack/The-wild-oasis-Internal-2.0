import AuditLog from "@/models/AuditLog";
import { handler } from "@/lib/api-auth";

export const GET = handler(
  async (req) => {
    const sp = new URL(req.url).searchParams;
    const filter = {};
    if (/^[a-f\d]{24}$/i.test(sp.get("user") || "")) filter.user = sp.get("user");
    const action = sp.get("action");
    if (action && /^[a-z.]+$/.test(action)) filter.action = new RegExp(`^${action.replace(".", "\\.")}`);
    const day = sp.get("date");
    if (/^\d{4}-\d{2}-\d{2}$/.test(day || "")) {
      filter.createdAt = { $gte: new Date(`${day}T00:00:00Z`), $lt: new Date(new Date(`${day}T00:00:00Z`).getTime() + 86400000) };
    }
    const limit = Math.min(Number(sp.get("limit")) || 100, 300);
    return await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
  },
  { admin: true }
);
