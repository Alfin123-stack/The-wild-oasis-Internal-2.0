import { request } from "./request";

export async function getSettings() {
  return request("/api/settings");
}

// newSetting berbentuk { namaSetting: nilaiBaru }
export async function updateSetting(newSetting) {
  return request("/api/settings", { method: "PATCH", json: newSetting });
}
