// Seluruh tanggal booking disimpan sebagai hari UTC, jadi ditampilkan sebagai hari UTC
// supaya tidak bergeser di zona waktu lain.
const DAY = 86400000;

export const utcMidnight = (d) => {
  const x = new Date(d);
  return Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
};

// Hari kalender LOKAL pengguna ("2026-11-09"). Tanggal booking disimpan sebagai tengah malam UTC
// dari hari kalender yang sama, jadi key ini yang dipakai sebagai "hari ini".
export const todayKey = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const keyToDate = (key) => new Date(`${key}T00:00:00Z`);

export const addDaysKey = (key, n) =>
  new Date(keyToDate(key).getTime() + n * DAY).toISOString().slice(0, 10);

export const diffDays = (a, b) => Math.round((utcMidnight(a) - utcMidnight(b)) / DAY);

export const fmtUTC = (d, opts = { month: "short", day: "2-digit", year: "numeric" }) =>
  new Intl.DateTimeFormat("en", { ...opts, timeZone: "UTC" }).format(new Date(d));
