import bcrypt from "bcryptjs";
import User from "@/models/User";
import { handler, HttpError } from "@/lib/api-auth";
import { signupSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

// Daftar anggota tim (tanpa passwordHash: select:false + transform toJSON).
export const GET = handler(async () => {
  return await User.find().sort({ createdAt: 1 });
});

// Membuat akun staf baru. Hanya user yang sudah login yang bisa memanggilnya
// (middleware + requireUser); tidak ada pendaftaran publik.
export const POST = handler(async (req, { user: actor }) => {
  const data = signupSchema.parse(await req.json());
  if (await User.exists({ email: data.email })) {
    throw new HttpError(409, "That email address is already in use");
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    passwordHash,
    role: "staff",
  });
  await logAudit(actor, "user.create", "user", user._id, user.email);
  return user;
}, { admin: true });
