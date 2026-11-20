import mongoose from "mongoose";
// Wajib: populate("cabin"/"guest") butuh model terdaftar. Tanpa import ini, route yang
// hanya mengimpor Booking gagal dengan MissingSchemaError (500).
import "./Cabin";
import "./Guest";

const bookingSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    numNights: { type: Number, required: true },
    numGuests: { type: Number, required: true },
    cabinPrice: { type: Number, default: 0 },
    extrasPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["unconfirmed", "checked-in", "checked-out", "cancelled"],
      default: "unconfirmed",
      index: true,
    },
    hasBreakfast: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    observations: { type: String, default: "" },
    // Soft delete: booking yang "dihapus" masih bisa dipulihkan (Undo) oleh admin.
    deletedAt: { type: Date, default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cabin: { type: mongoose.Schema.Types.ObjectId, ref: "Cabin", required: true, index: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      // Bentuk JSON dibuat sama dengan versi Supabase supaya komponen UI tidak
      // perlu banyak diubah: created_at, guests, cabins.
      transform(_doc, ret) {
        ret.id = String(ret._id);
        ret.created_at = ret.createdAt;
        ret.cabins = ret.cabin;
        ret.guests = ret.guest;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.cabin;
        delete ret.guest;
        return ret;
      },
    },
  }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
