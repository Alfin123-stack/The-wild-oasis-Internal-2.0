import AuditLog from "@/models/AuditLog";

// Mencatat aktivitas. Kegagalan mencatat tidak boleh menggagalkan aksi utama.
export async function logAudit(user, action, entity, entityId, summary = "") {
  try {
    await AuditLog.create({
      user: user?.id,
      userName: user?.name || user?.email || "",
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      summary: String(summary).slice(0, 300),
    });
  } catch (err) {
    console.error("[audit] gagal mencatat:", err.message);
  }
}
