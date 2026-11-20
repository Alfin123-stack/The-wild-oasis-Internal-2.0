import mongoose from "mongoose";
import { baseTransform } from "./_transform";

const cabinSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    maxCapacity: { type: Number, required: true, min: 1 },
    regularPrice: { type: Number, required: true, min: 0 },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator(v) {
          return v <= this.regularPrice;
        },
        message: "Discount must not exceed regular price",
      },
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { transform: baseTransform } }
);

export default mongoose.models.Cabin || mongoose.model("Cabin", cabinSchema);
