import { signIn, signOut } from "next-auth/react";
import { request, uploadImage } from "./request";

export async function signup({ fullName, email, password }) {
  return request("/api/users", { method: "POST", json: { fullName, email, password } });
}

export async function getUsers() {
  return request("/api/users");
}

export async function login({ email, password }) {
  const res = await signIn("credentials", { email, password, redirect: false });
  if (!res || res.error) throw new Error("Email or password is incorrect");
  return { user: { email } };
}

export async function getCurrentUser() {
  try {
    return await request("/api/users/me", { redirectOn401: false });
  } catch (err) {
    if (err.message === "Unauthorized") return null;
    throw err;
  }
}

export async function logout() {
  await signOut({ redirect: false });
}

export async function updateCurrentUser({ fullName, avatar, password, currentPassword }) {
  const payload = {};
  if (fullName) payload.fullName = fullName;
  if (password) {
    payload.password = password;
    payload.currentPassword = currentPassword;
  }
  if (avatar) payload.avatar = await uploadImage(avatar, "avatars");
  return request("/api/users/me", { method: "PATCH", json: payload });
}
