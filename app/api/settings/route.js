import Setting from "@/models/Setting";
import { handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { settingUpdateSchema } from "@/lib/validators";

export const GET = handler(async () => {
  // Dokumen tunggal; dibuat dengan nilai default bila belum ada.
  return (await Setting.findOne()) || (await Setting.create({}));
});

export const PATCH = handler(
  async (req, { user }) => {
    const data = settingUpdateSchema.parse(await req.json());
    const current = (await Setting.findOne()) || (await Setting.create({}));
    const min = data.minBookingLength ?? current.minBookingLength;
    const max = data.maxBookingLength ?? current.maxBookingLength;
    if (min > max) throw new HttpError(400, "Minimum nights can't be higher than maximum nights");
    const updated = await Setting.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    await logAudit(user, "settings.update", "settings", updated._id, Object.keys(data).join(", "));
    return updated;
  },
  { admin: true }
);
