import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Koneksi di-cache di globalThis supaya hot reload (dev) dan serverless (prod)
// tidak membuka koneksi baru di setiap request.
let cached = globalThis._mongoose;
if (!cached) cached = globalThis._mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in the environment");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
