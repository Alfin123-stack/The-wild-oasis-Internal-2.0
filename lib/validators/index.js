import { z } from "zod";

export const cabinSchema = z
  .object({
    name: z.string().trim().min(1, "Cabin name is required").max(60, "Cabin name is too long"),
    maxCapacity: z.coerce.number().int("Use a whole number").min(1, "Capacity must be at least 1").max(20, "Capacity can't be more than 20"),
    regularPrice: z.coerce.number().min(0, "Price can't be negative").max(100000, "Price is too high"),
    discount: z.coerce.number().min(0, "Discount can't be negative").default(0),
    description: z.string().trim().max(500, "Description is too long").default(""),
    image: z.string().default(""),
  })
  .refine((d) => d.discount <= d.regularPrice, {
    message: "Discount must be lower than regular price",
    path: ["discount"],
  });

export const cabinUpdateSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  maxCapacity: z.coerce.number().int().min(1).max(20).optional(),
  regularPrice: z.coerce.number().min(0).max(100000).optional(),
  discount: z.coerce.number().min(0).optional(),
  description: z.string().trim().max(500).optional(),
  image: z.string().optional(),
  isArchived: z.boolean().optional(),
});

// Hanya field ini yang boleh diubah lewat PATCH booking.
export const bookingUpdateSchema = z
  .object({
    status: z.enum(["unconfirmed", "checked-in", "checked-out", "cancelled"]),
    isPaid: z.boolean(),
    hasBreakfast: z.boolean(),
    extrasPrice: z.coerce.number().min(0),
    totalPrice: z.coerce.number().min(0),
    observations: z.string().max(1000),
  })
  .partial()
  .strict();

export const settingUpdateSchema = z
  .object({
    minBookingLength: z.coerce.number().int().min(1).max(365),
    maxBookingLength: z.coerce.number().int().min(1).max(365),
    maxGuestsPerBooking: z.coerce.number().int().min(1).max(50),
    breakFastPrice: z.coerce.number().min(0).max(1000),
    lowOccupancyPct: z.coerce.number().min(0).max(100),
    unpaidWithinDays: z.coerce.number().min(0).max(30),
    idleCabinDays: z.coerce.number().min(1).max(365),
  })
  .partial()
  .strict();

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password needs a minimum of 8 characters").max(72, "Password can be at most 72 characters"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80, "Name is too long").optional(),
  avatar: z.string().url().startsWith("https://", "Avatar must be an https link").max(500).optional(),
  currentPassword: z.string().max(72).optional(),
  password: z.string().min(8, "Password needs a minimum of 8 characters").max(72, "Password can be at most 72 characters").optional(),
});

const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-03-14");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const guestSchema = z.object({
  fullName: z.string().trim().min(1, "Guest name is required").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  nationality: z.string().trim().max(60).default(""),
  phone: z.string().trim().max(40).default(""),
  notes: z.string().trim().max(1000).default(""),
});
export const guestUpdateSchema = guestSchema.partial().strict();

export const bookingCreateSchema = z
  .object({
    cabin: objectId,
    guest: objectId.optional(),
    newGuest: guestSchema.optional(),
    startDate: dayKey,
    endDate: dayKey,
    numGuests: z.coerce.number().int().min(1, "At least 1 guest"),
    hasBreakfast: z.boolean().default(false),
    isPaid: z.boolean().default(false),
    observations: z.string().trim().max(1000).default(""),
  })
  .refine((d) => !!d.guest !== !!d.newGuest, { message: "Choose a guest or enter a new one", path: ["guest"] });

export const userAdminUpdateSchema = z
  .object({ isActive: z.boolean(), role: z.enum(["admin", "staff"]) })
  .partial()
  .strict();
