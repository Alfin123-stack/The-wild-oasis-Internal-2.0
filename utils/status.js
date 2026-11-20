// Warna status = tindakan (logika Mews).
// unconfirmed: perlu aksi · inhouse: sedang menginap · out: selesai.
export const STATUS_META = {
  unconfirmed: { label: "Unconfirmed", tone: "unconfirmed" },
  "checked-in": { label: "In-house", tone: "inhouse" },
  "checked-out": { label: "Checked out", tone: "out" },
  cancelled: { label: "Cancelled", tone: "alert" },
};

export function statusLabel(status) {
  return STATUS_META[status]?.label || String(status || "").replace("-", " ");
}

export function statusTone(status) {
  return STATUS_META[status]?.tone || "out";
}
