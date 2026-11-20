import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { authConfig } from "./auth.config";

let dummyHash;
const getDummyHash = () => (dummyHash ||= bcrypt.hashSync("not-a-real-password", 12));

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();

        if (!checkRateLimit(`login:${email}`)) return null;

        let user;
        try {
          await connectDB();
          user = await User.findOne({ email }).select("+passwordHash");
        } catch (err) {
          // Tanpa ini, database yang tidak terjangkau terlihat sama dengan "password salah".
          console.error("[auth] Gagal mengakses MongoDB:", err.message);
          return null;
        }
        // Bandingkan dengan hash palsu agar waktu respons sama (tidak membocorkan apakah email ada).
        if (!user) {
          await bcrypt.compare(parsed.data.password, getDummyHash());
          console.warn(`[auth] User tidak ditemukan: ${email} (sudah menjalankan "npm run seed" ke database ini?)`);
          return null;
        }

        if (user.isActive === false) {
          console.warn(`[auth] Akun nonaktif: ${email}`);
          return null;
        }

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          console.warn(`[auth] Password salah untuk ${email}`);
          return null;
        }

        resetRateLimit(`login:${email}`);
        return {
          id: String(user._id),
          name: user.fullName,
          email: user.email,
          image: user.avatar || null,
          role: user.role,
        };
      },
    }),
  ],
});
