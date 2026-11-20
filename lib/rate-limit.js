// Rate limit sederhana di memori (per instance). Cukup untuk aplikasi internal;
// untuk skala besar ganti dengan Redis/Upstash.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const store = globalThis._rateLimitStore || (globalThis._rateLimitStore = new Map());

export function checkRateLimit(key, { max = MAX_ATTEMPTS, windowMs = WINDOW_MS } = {}) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.start > windowMs) {
    store.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export function resetRateLimit(key) {
  store.delete(key);
}
