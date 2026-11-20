import Cabin from "@/models/Cabin";
import { handler } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { cabinSchema } from "@/lib/validators";
import { paginate, parsePage, parseSort } from "@/lib/server-utils";

export const GET = handler(async (req) => {
  const sp = new URL(req.url).searchParams;

  const filter = {};
  // Cabin yang diarsipkan disembunyikan, kecuali diminta (halaman Cabins admin).
  if (sp.get("archived") !== "include") filter.isArchived = { $ne: true };
  const discount = sp.get("discount");
  if (discount === "with-discount") filter.discount = { $gt: 0 };
  if (discount === "no-discount") filter.discount = 0;

  const sort = parseSort(sp.get("sortBy"), ["name", "maxCapacity", "regularPrice"], {
    name: 1,
  });

  const query = Cabin.find(filter)
    .collation({ locale: "en", numericOrdering: true })
    .sort(sort);
  const [cabins, count] = await Promise.all([
    paginate(query, parsePage(sp)),
    Cabin.countDocuments(filter),
  ]);
  return { cabins, count };
});

export const POST = handler(
  async (req, { user }) => {
    const data = cabinSchema.parse(await req.json());
    const cabin = await Cabin.create(data);
    await logAudit(user, "cabin.create", "cabin", cabin._id, cabin.name);
    return cabin;
  },
  { admin: true }
);
