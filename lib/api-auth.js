import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wajib dipanggil di awal setiap Route Handler (pengganti RLS Supabase).
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "Unauthorized");
  await connectDB();
  // Peran dan status aktif dibaca dari database di setiap request, bukan dari token:
  // user yang dinonaktifkan atau diturunkan perannya langsung berlaku.
  const dbUser = await User.findById(session.user.id).select("role isActive fullName");
  if (!dbUser || dbUser.isActive === false) throw new HttpError(401, "Unauthorized");
  return { ...session.user, name: dbUser.fullName, role: dbUser.role };
}

export function assertAdmin(user) {
  if (user?.role !== "admin") throw new HttpError(403, "Only admins can do this");
}

// Pembungkus handler: auth + penanganan error seragam -> { message }.
export function handler(fn, { admin = false } = {}) {
  return async (req, ctx) => {
    try {
      const user = await requireUser();
      if (admin) assertAdmin(user);
      const params = ctx?.params ? await ctx.params : {};
      const result = await fn(req, { user, params });
      return Response.json(result);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err) {
  if (err instanceof HttpError) {
    return Response.json({ message: err.message }, { status: err.status });
  }
  if (err?.name === "ZodError") {
    const message = err.issues?.[0]?.message || "Invalid data";
    return Response.json({ message }, { status: 400 });
  }
  if (err?.name === "ValidationError") {
    // Hanya pesan yang kita tulis sendiri di model; jangan bocorkan nama model/path Mongoose.
    const first = Object.values(err.errors || {})[0];
    const msg = first?.kind === "user defined" || first?.kind === "required" || first?.kind === "min" || first?.kind === "max"
      ? first.message : "Some of the information is not valid. Please check the form.";
    return Response.json({ message: String(msg).replace(/^Path `[^`]*` /, "This field ") }, { status: 400 });
  }
  if (err?.name === "CastError") {
    return Response.json({ message: "Some of the information is not valid. Please check the form." }, { status: 400 });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const label = { email: "email address", name: "name" }[field] || "value";
    return Response.json({ message: `That ${label} is already in use. Please use a different one.` }, { status: 409 });
  }
  console.error(err);
  return Response.json({ message: "Something went wrong on the server" }, { status: 500 });
}

export function assertObjectId(id) {
  if (!/^[a-f\d]{24}$/i.test(String(id))) throw new HttpError(404, "Not found");
}
