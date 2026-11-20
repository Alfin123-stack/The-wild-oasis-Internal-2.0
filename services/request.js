import { signOut } from "next-auth/react";

// Pembungkus fetch tipis: melempar Error(message) dari respons server { message }.
export async function request(url, { redirectOn401 = true, json, ...options } = {}) {
  const init = { ...options };
  if (json !== undefined) {
    init.body = JSON.stringify(json);
    init.headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Can't reach the server. Check your internet connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respons kosong / bukan JSON
  }

  if (!res.ok) {
    if (
      res.status === 401 &&
      redirectOn401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      // signOut menghapus cookie sesi; tanpa itu middleware mengembalikan /login -> /dashboard (loop)
      // untuk user yang dinonaktifkan tetapi tokennya masih berlaku.
      signOut({ callbackUrl: "/login" });
    }
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// Upload gambar ke Cloudinary lewat /api/upload. Mengembalikan URL aman.
export async function uploadImage(file, folder = "cabins") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const { url } = await request("/api/upload", { method: "POST", body: form });
  return url;
}
