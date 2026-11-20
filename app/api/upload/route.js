import { handler, HttpError } from "@/lib/api-auth";
import { uploadBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const FOLDERS = { cabins: "wild-oasis/cabins", avatars: "wild-oasis/avatars" };

export const POST = handler(async (req) => {
  const form = await req.formData();
  const file = form.get("file");
  const folder = FOLDERS[form.get("folder")] || FOLDERS.cabins;

  if (!file || typeof file === "string") throw new HttpError(400, "File is required");
  if (!file.type?.startsWith("image/")) throw new HttpError(400, "Only images are allowed");
  if (file.size > MAX_SIZE) throw new HttpError(400, "Image must be 2 MB or smaller");

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await uploadBuffer(buffer, folder);
    return { url: result.secure_url };
  } catch (err) {
    console.error(err);
    throw new HttpError(502, "Image upload failed");
  }
});
