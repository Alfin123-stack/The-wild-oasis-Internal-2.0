import bcrypt from "bcryptjs";
import User from "@/models/User";
import { handler, HttpError } from "@/lib/api-auth";
import { profileUpdateSchema } from "@/lib/validators";

export const GET = handler(async (_req, { user }) => {
  const me = await User.findById(user.id);
  if (!me) throw new HttpError(401, "Unauthorized");
  return me;
});

export const PATCH = handler(async (req, { user }) => {
  const data = profileUpdateSchema.parse(await req.json());
  const me = await User.findById(user.id).select("+passwordHash");
  if (!me) throw new HttpError(401, "Unauthorized");

  if (data.fullName) me.fullName = data.fullName;
  if (data.avatar) me.avatar = data.avatar;

  if (data.password) {
    if (!data.currentPassword) throw new HttpError(400, "Current password is required");
    const ok = await bcrypt.compare(data.currentPassword, me.passwordHash);
    if (!ok) throw new HttpError(400, "Current password is incorrect");
    me.passwordHash = await bcrypt.hash(data.password, 12);
  }

  await me.save();
  return me;
});
