// Membuat akun admin pertama.
// Pakai:  npm run create-admin -- "Nama Lengkap" email@contoh.com
// Password dibaca dari env ADMIN_PASSWORD atau ditanyakan di terminal (tidak ditulis ke file).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI belum diisi (.env.local).");
  process.exit(1);
}

const [fullName, emailRaw] = process.argv.slice(2);
if (!fullName || !emailRaw) {
  console.error('Pakai: npm run create-admin -- "Nama Lengkap" email@contoh.com');
  process.exit(1);
}
const email = emailRaw.trim().toLowerCase();

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password (min 8 karakter): ");
  rl.close();
}
if (!password || password.length < 8) {
  console.error("Password minimal 8 karakter.");
  process.exit(1);
}

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      fullName: String,
      email: { type: String, unique: true },
      passwordHash: String,
      avatar: { type: String, default: "" },
      role: { type: String, default: "staff" },
    },
    { timestamps: true }
  )
);

await mongoose.connect(uri);
const passwordHash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate(
  { email },
  { fullName, email, passwordHash, role: "admin" },
  { upsert: true, new: true }
);
console.log(`Admin siap: ${email}`);
await mongoose.disconnect();
