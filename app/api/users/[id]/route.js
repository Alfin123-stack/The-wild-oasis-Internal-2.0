import User from "@/models/User";
import { assertObjectId, handler, HttpError } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { userAdminUpdateSchema } from "@/lib/validators";

// Admin: nonaktifkan/aktifkan user atau ubah peran.
export const PATCH = handler(
  async (req, { params, user }) => {
    assertObjectId(params.id);
    const data = userAdminUpdateSchema.parse(await req.json());
    if (params.id === user.id && (data.isActive === false || data.role === "staff")) {
      throw new HttpError(400, "You cannot deactivate or demote your own account");
    }
    const target = await User.findById(params.id);
    if (!target) throw new HttpError(404, "User not found");

    // Jangan sampai tidak ada admin aktif sama sekali.
    const losingAdmin = target.role === "admin" && (data.isActive === false || data.role === "staff");
    if (losingAdmin && (await User.countDocuments({ role: "admin", isActive: { $ne: false } })) <= 1) {
      throw new HttpError(409, "At least one active admin is required");
    }
    target.set(data);
    await target.save();
    const action = data.isActive === false ? "user.deactivate" : data.isActive ? "user.activate" : "user.role";
    await logAudit(user, action, "user", target._id, `${target.email}${data.role ? ` -> ${data.role}` : ""}`);
    return target;
  },
  { admin: true }
);
