import { z } from "zod";
import { handler } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { assertAi, assertAiQuota, runWithTools } from "@/lib/ai/provider";
import { ASK_SYSTEM, buildTools } from "@/lib/ai/tools";
import { todayKeyUTC, validKey } from "@/lib/insights";

export const maxDuration = 60;

const schema = z.object({
  question: z.string().trim().min(2, "Type a question").max(500, "Keep the question under 500 characters"),
  date: z.string().optional(),
});

export const POST = handler(async (req, { user }) => {
  assertAi();
  const { question, date } = schema.parse(await req.json());
  assertAiQuota(user.id);
  const today = validKey(date) ? date : todayKeyUTC();

  const { tools, resolveNames } = buildTools(today);
  const result = await runWithTools({ system: ASK_SYSTEM(today), question, tools });
  // Isi pertanyaan/jawaban tidak disimpan; hanya alat yang dipakai dan jumlah token.
  await logAudit(user, "ai.ask", "ai", "", `tools: ${result.tools.map((t) => t.name).join(", ") || "none"}; tokens: ${result.tokens}`);
  // checked=false: model menjawab tanpa memanggil alat data; UI memperingatkan staf.
  return { answer: resolveNames(result.text), tools: result.tools, sources: result.sources, checked: result.tools.length > 0 };
});
