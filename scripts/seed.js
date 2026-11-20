// Mengisi MongoDB dengan data contoh yang konsisten dan relatif terhadap HARI INI,
// sehingga dashboard (7/30/90 hari), Today's activity, dan grafik selalu terisi.
//
// Pakai:  npm run seed
//   - menghapus & mengisi ulang: cabins, guests, bookings, settings
//   - membuat/memperbarui akun contoh (admin + 2 staf)
//   - opsi --keep-users: tidak menyentuh akun
//
// Password akun contoh: env SEED_PASSWORD, atau default "wildoasis123" (HANYA untuk pengembangan).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { addDays, differenceInCalendarDays } from "date-fns";
import { cabins as cabinData } from "../data/data-cabins.js";
import { guests as guestData } from "../data/data-guests.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI belum diisi (.env.local).");
  process.exit(1);
}

// Pengaman: seed MENGHAPUS data dan membuat akun contoh. Jangan jalankan di database produksi.
if (!process.argv.includes("--yes")) {
  const host = uri.replace(/^[a-z+]+:\/\/([^@]*@)?/i, "").split(/[/?]/)[0];
  console.error(`Seed akan menimpa data di "${host}".\nJalankan ulang dengan --yes bila ini database pengembangan.`);
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && !process.env.SEED_PASSWORD) {
  console.error("Di NODE_ENV=production, SEED_PASSWORD wajib diisi (tidak ada password default).");
  process.exit(1);
}

const BREAKFAST_PRICE = 15;
const KEEP_USERS = process.argv.includes("--keep-users");
const SEED_PASSWORD = process.env.SEED_PASSWORD || "wildoasis123";

const loose = () => new mongoose.Schema({}, { strict: false, timestamps: true });
const Cabin = mongoose.model("Cabin", loose());
const Guest = mongoose.model("Guest", loose());
const Booking = mongoose.model("Booking", loose());
const Setting = mongoose.model("Setting", loose());
const User = mongoose.model("User", loose());

// PRNG deterministik: hasil seed sama setiap dijalankan.
let seedState = 20260101;
function rnd() {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
}
const rint = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const todayUTC = new Date();
todayUTC.setUTCHours(0, 0, 0, 0);
const day = (offset) => addDays(todayUTC, offset);

// Satu booking "jangkar" per cabin supaya Today's activity selalu ada isinya:
// [mulai, selesai] dalam hari relatif terhadap hari ini.
const ANCHORS = [
  [0, 5],   // 001: check-in hari ini  -> Arriving
  [-4, 0],  // 002: check-out hari ini -> Departing
  [-2, 3],  // 003: sedang menginap
  [1, 6],   // 004: segera datang
  [-3, 0],  // 005: check-out hari ini -> Departing
  [0, 4],   // 006: check-in hari ini  -> Arriving
  [-5, 2],  // 007: sedang menginap
  [2, 7],   // 008: segera datang
];

const OBSERVATIONS = [
  "", "", "", "",
  "Late arrival around 10 PM, please keep the key at the front desk.",
  "Celebrating our anniversary, a quiet cabin would be appreciated.",
  "Allergic to nuts, please note for the breakfast.",
  "Traveling with a small dog.",
  "Would like extra blankets and pillows.",
  "Early check-in if possible.",
  "Vegetarian breakfast, please.",
];

function statusFor(start, end) {
  if (end < todayUTC) return "checked-out";
  if (start > todayUTC) return "unconfirmed";
  if (start.getTime() === todayUTC.getTime()) return "unconfirmed"; // akan datang hari ini
  return "checked-in";
}

// Bangun jadwal tiap cabin: jangkar + stay ke belakang (sampai -90 hari) dan ke depan (+35 hari).
function buildStays(cabinIndex) {
  const [a0, a1] = ANCHORS[cabinIndex % ANCHORS.length];
  const stays = [[a0, a1]];

  let cursor = a0;
  while (cursor > -90) {
    const nights = rint(3, 9);
    const end = cursor - rint(0, 4);
    const start = end - nights;
    if (start < -92) break;
    stays.unshift([start, end]);
    cursor = start;
  }

  cursor = a1;
  while (cursor < 35) {
    const start = cursor + rint(0, 4);
    const nights = rint(3, 9);
    if (start > 35) break;
    stays.push([start, start + nights]);
    cursor = start + nights;
  }
  return stays;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = [
    { fullName: "Admin Wild Oasis", email: "admin@wildoasis.com", role: "admin" },
    { fullName: "Sari Wulandari", email: "sari@wildoasis.com", role: "staff" },
    { fullName: "Budi Santoso", email: "budi@wildoasis.com", role: "staff" },
  ];
  for (const u of users) {
    await User.findOneAndUpdate(
      { email: u.email },
      { ...u, passwordHash, avatar: "" },
      { upsert: true, new: true }
    );
  }
  return users;
}

async function main() {
  await mongoose.connect(uri);
  console.log("Terhubung ke:", mongoose.connection.name);

  await Promise.all([
    Booking.deleteMany({}),
    Cabin.deleteMany({}),
    Guest.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  const cabinDocs = await Cabin.insertMany(cabinData);
  const guestDocs = await Guest.insertMany(guestData);

  const bookings = [];
  cabinDocs.forEach((cabin, idx) => {
    const src = cabinData[idx];
    buildStays(idx).forEach(([s, e]) => {
      const startDate = day(s);
      const endDate = day(e);
      const numNights = differenceInCalendarDays(endDate, startDate);
      const numGuests = rint(1, src.maxCapacity);
      const hasBreakfast = rnd() < 0.55;
      const cabinPrice = numNights * (src.regularPrice - src.discount);
      const extrasPrice = hasBreakfast ? numNights * BREAKFAST_PRICE * numGuests : 0;
      const status = statusFor(startDate, endDate);
      const isPaid =
        status === "checked-out" ? true : status === "checked-in" ? rnd() < 0.85 : rnd() < 0.4;
      // Dibuat 3-25 hari sebelum check-in, tapi tidak di masa depan.
      const createdAt = new Date(
        Math.min(startDate.getTime() - rint(3, 25) * 86400000 + rint(8, 20) * 3600000, Date.now())
      );
      bookings.push({
        startDate,
        endDate,
        numNights,
        numGuests,
        cabinPrice,
        extrasPrice,
        totalPrice: cabinPrice + extrasPrice,
        status,
        hasBreakfast,
        isPaid,
        observations: pick(OBSERVATIONS),
        cabin: cabin._id,
        guest: pick(guestDocs)._id,
        createdAt,
        updatedAt: createdAt,
      });
    });
  });
  await Booking.insertMany(bookings, { timestamps: false });

  await Setting.create({
    minBookingLength: 3,
    maxBookingLength: 30,
    maxGuestsPerBooking: 10,
    breakFastPrice: BREAKFAST_PRICE,
  });

  console.log(
    `Selesai: ${cabinDocs.length} cabins, ${guestDocs.length} guests, ${bookings.length} bookings, 1 setting.`
  );

  if (!KEEP_USERS) {
    const users = await seedUsers();
    console.log("\nAkun contoh (password untuk semuanya: " + SEED_PASSWORD + "):");
    users.forEach((u) => console.log(`  ${u.role.padEnd(5)}  ${u.email}`));

    // Verifikasi: baca ulang dari database dan cocokkan password.
    const check = await User.findOne({ email: users[0].email }).lean();
    const ok = check?.passwordHash && (await bcrypt.compare(SEED_PASSWORD, check.passwordHash));
    console.log(
      `\nDatabase: ${mongoose.connection.host} / ${mongoose.connection.name}  |  total user: ${await User.countDocuments()}`
    );
    console.log(ok ? "Verifikasi login admin: OK" : "Verifikasi login admin: GAGAL (hash tidak cocok)");
    console.log("Pastikan MONGODB_URI di .env.local sama dengan yang dipakai saat menjalankan seed.");
    if (!process.env.SEED_PASSWORD) {
      console.log("\nPassword default hanya untuk pengembangan. Set SEED_PASSWORD atau ganti di halaman Account.");
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
