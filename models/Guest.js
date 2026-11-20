import mongoose from "mongoose";
import { baseTransform } from "./_transform";

const guestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, index: true, lowercase: true },
    nationality: { type: String, default: "" },
    nationalID: { type: String, default: "" },
    countryFlag: { type: String, default: "" },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { transform: baseTransform } }
);

export default mongoose.models.Guest || mongoose.model("Guest", guestSchema);
