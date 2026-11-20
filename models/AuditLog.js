import mongoose from "mongoose";
import { baseTransform } from "./_transform";

// Jejak aktivitas: siapa melakukan apa, kapan. Hanya ditambah, tidak pernah diubah.
const auditSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    userName: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    entity: { type: String, default: "" },
    entityId: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: { transform: baseTransform } }
);
auditSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditSchema);
