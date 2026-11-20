import { PAGE_SIZE } from "@/utils/constant";

export function parsePage(searchParams) {
  const page = Number(searchParams.get("page"));
  return Number.isInteger(page) && page > 0 ? page : null;
}

export function paginate(query, page) {
  if (!page) return query;
  return query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
}

// "field-asc" / "field-desc" -> { field: 1 | -1 }, hanya field yang di-whitelist.
export function parseSort(value, allowed, fallback) {
  const [field, dir] = String(value || "").split("-");
  if (!allowed.includes(field) || !["asc", "desc"].includes(dir)) return fallback;
  return { [field]: dir === "asc" ? 1 : -1 };
}

export function utcDayRange(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}
