import { request, uploadImage } from "./request";

export async function getCabins({ page, discount, sortBy, archived } = {}) {
  const params = new URLSearchParams();
  if (archived) params.set("archived", "include");
  if (page) params.set("page", page);
  if (discount) params.set("discount", discount);
  if (sortBy) params.set("sortBy", sortBy);
  return request(`/api/cabins?${params}`); // { cabins, count }
}

export async function deleteCabin(id) {
  return request(`/api/cabins/${id}`, { method: "DELETE" });
}

// image bisa berupa File (upload baru ke Cloudinary) atau string URL (dipertahankan).
export async function addEditCabin(newData, id) {
  let image = newData.image;
  if (image && typeof image !== "string") image = await uploadImage(image, "cabins");

  const payload = { ...newData, image: image || "" };

  if (id) return request(`/api/cabins/${id}`, { method: "PATCH", json: payload });
  return request("/api/cabins", { method: "POST", json: payload });
}

// Arsipkan/pulihkan: hanya mengirim isArchived, tanpa menyentuh field lain (mis. gambar).
export async function setCabinArchived(id, isArchived) {
  return request(`/api/cabins/${id}`, { method: "PATCH", json: { isArchived } });
}
