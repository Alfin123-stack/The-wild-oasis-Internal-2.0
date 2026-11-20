import { z } from "zod";
import Booking from "@/models/Booking";
import { assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { assertAiQuota, generateText } from "@/lib/ai/provider";
import { keyOf } from "@/lib/insights";

const schema = z.object({
  bookingId: z.string(),
  kind: z.enum(["confirmation", "reminder", "apology"]),
  language: z.string().trim().min(2).max(30).default("English"),
  note: z.string().trim().max(300).optional(),
});

const GOAL = {
  confirmation: "confirm the booking and say we look forward to the stay",
  reminder: "remind the guest of the upcoming check-in and ask them to reply if anything changes",
  apology: "apologise sincerely for a problem during or before the stay and offer to help",
};

// Draf pesan. Model hanya menerima nama depan, tanggal, nama cabin, dan jenis pesan.
// Tidak ada email, telepon, harga, atau catatan tamu. Staf yang meninjau dan mengirim sendiri.
export const POST = handler(async (req, { user }) => {
  const data = schema.parse(await req.json());
  assertObjectId(data.bookingId);
  assertAiQuota(user.id);
  const b = await Booking.findOne({ _id: data.bookingId, deletedAt: null })
    .populate("cabin", "name")
    .populate("guest", "fullName");
  if (!b) throw new HttpError(404, "Booking not found");

  const firstName = (b.guest?.fullName || "Guest").split(/\s+/)[0];
  const prompt = [
    `Write a short message (max 90 words) to ${firstName}, a hotel guest.`,
    `Goal: ${GOAL[data.kind]}.`,
    `Stay: cabin ${b.cabin?.name}, check-in ${keyOf(b.startDate)}, check-out ${keyOf(b.endDate)}, ${b.numNights} nights.`,
    data.note ? `Staff note to include in your own words: ${data.note}` : "",
    `Language: ${data.language}. Warm, plain, no emojis. Sign off as "The Wild Oasis team". Output only the message.`,
  ]
    .filter(Boolean)
    .join("\n");

  const { text, tokens } = await generateText({
    system: "You write short, polite guest messages for a small hotel. You never promise refunds, discounts or anything not given.",
    prompt,
  });
  await logAudit(user, "ai.draft", "booking", b._id, `${data.kind}; tokens: ${tokens}`);
  return { text };
});
