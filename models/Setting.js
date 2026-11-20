import mongoose from "mongoose";
import { baseTransform } from "./_transform";

// Satu dokumen saja. Nama field `breakFastPrice` dipertahankan sesuai UI lama.
const settingSchema = new mongoose.Schema(
  {
    minBookingLength: { type: Number, default: 3 },
    maxBookingLength: { type: Number, default: 30 },
    maxGuestsPerBooking: { type: Number, default: 10 },
    breakFastPrice: { type: Number, default: 15 },
    // Ambang kartu insight (Fase 3).
    lowOccupancyPct: { type: Number, default: 40 },
    unpaidWithinDays: { type: Number, default: 2 },
    idleCabinDays: { type: Number, default: 30 },
  },
  { timestamps: true, toJSON: { transform: baseTransform } }
);

export default mongoose.models.Setting || mongoose.model("Setting", settingSchema);
