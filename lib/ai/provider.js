// Lapisan penyedia model. Hanya file ini yang tahu Gemini; fitur lain memanggil generateText()
// dan runWithTools(), sehingga model/penyedia bisa diganti tanpa menyentuh fitur.
import { HttpError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const KEY = () => process.env.GEMINI_API_KEY;
const MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";
// Model cadangan (dipisah koma) dipakai bila model utama sibuk (503/429) atau tidak ditemukan (404).
const FALLBACKS = () =>
  (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.1-flash-lite,gemini-flash-lite-latest")
    .split(",").map((m) => m.trim()).filter(Boolean);
const RETRYABLE = new Set([404, 429, 500, 502, 503, 504]);
const BASE = () => process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
const ENDPOINT = (m) => `${BASE()}/v1beta/models/${m}:generateContent`;

export function aiEnabled() {
  return process.env.AI_ENABLED !== "false" && !!KEY();
}

export function assertAi() {
  if (!aiEnabled()) {
    throw new HttpError(503, "The assistant is not available right now. Please ask an admin.");
  }
}

// Batas per user: 20 per menit dan 150 per hari.
export function assertAiQuota(userId) {
  if (!checkRateLimit(`ai-min:${userId}`, { max: 20, windowMs: 60_000 })) {
    throw new HttpError(429, "Too many AI requests. Wait a minute and try again.");
  }
  if (!checkRateLimit(`ai-day:${userId}`, { max: 150, windowMs: 86_400_000 })) {
    throw new HttpError(429, "Daily AI limit reached. Try again tomorrow.");
  }
}

async function callModel(model, body) {
  try {
    return await fetch(ENDPOINT(model), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY() },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`[ai] ${model} request failed:`, err.message);
    return null;
  }
}

// Mencoba model utama, lalu cadangan. `models` membatasi daftar (dipakai setelah model terpilih,
// karena thought signature tidak boleh dipindah antar model).
async function generate(body, models) {
  const list = models || [MODEL(), ...FALLBACKS().filter((m) => m !== MODEL())];
  let last = null;
  for (let i = 0; i < list.length; i++) {
    let res = await callModel(list[i], body);
    if (res && res.status === 503 && list.length === 1) res = await callModel(list[i], body); // satu kali ulang
    if (res?.ok) return { json: await res.json(), model: list[i] };
    last = res;
    if (res) console.error("[ai]", list[i], res.status, (await res.text()).slice(0, 200));
    if (res && !RETRYABLE.has(res.status)) break;
  }
  if (!last) throw new HttpError(502, "The AI service did not respond. Try again.");
  if (last.status === 429) throw new HttpError(429, "The AI service is busy or over its limit. Try again soon.");
  if (last.status === 503) throw new HttpError(503, "The AI service is overloaded right now. Try again in a minute.");
  throw new HttpError(502, "The AI service returned an error.");
}

const textOf = (content) => (content?.parts || []).filter((p) => p.text).map((p) => p.text).join("").trim();
const tokensOf = (r) => r?.usageMetadata?.totalTokenCount || 0;

export async function generateText({ system, prompt, json = false }) {
  assertAi();
  const { json: r } = await generate({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, ...(json ? { responseMimeType: "application/json" } : {}) },
  });
  const text = textOf(r.candidates?.[0]?.content);
  if (!text) throw new HttpError(502, "The AI service returned an empty answer.");
  return { text, tokens: tokensOf(r) };
}

// tools: { nama: { description, parameters, run(args) -> { data, rows } } }
// `data` dikirim ke model (tanpa data pribadi); `rows` hanya untuk ditampilkan di UI.
export async function runWithTools({ system, question, tools, maxRounds = 4 }) {
  assertAi();
  // Gemini menolak OBJECT tanpa properti; alat tanpa parameter dikirim tanpa `parameters`.
  const declarations = Object.entries(tools).map(([name, t]) => ({
    name,
    description: t.description,
    ...(Object.keys(t.parameters?.properties || {}).length ? { parameters: t.parameters } : {}),
  }));
  const contents = [{ role: "user", parts: [{ text: question }] }];
  const used = [];
  const sources = [];
  let tokens = 0;
  let chosen = null;

  for (let round = 0; round < maxRounds; round++) {
    const { json: r, model } = await generate(
      {
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: [{ functionDeclarations: declarations }],
        generationConfig: { temperature: 0.2 },
      },
      chosen ? [chosen] : undefined
    );
    chosen = model;
    tokens += tokensOf(r);
    const content = r.candidates?.[0]?.content;
    const calls = (content?.parts || []).filter((p) => p.functionCall);
    if (!calls.length) {
      const text = textOf(content);
      if (!text) throw new HttpError(502, "The AI service returned an empty answer.");
      return { text, tools: used, sources, tokens };
    }
    contents.push(content); // dikembalikan apa adanya (termasuk thought signature)
    const results = [];
    for (const { functionCall: fc } of calls) {
      const tool = tools[fc.name];
      let out;
      if (!tool) out = { data: { error: "Unknown tool" }, rows: [] };
      else {
        try {
          out = await tool.run(fc.args || {});
        } catch (err) {
          out = { data: { error: err.message }, rows: [] };
        }
      }
      used.push({ name: fc.name, args: fc.args || {} });
      if (out.rows?.length) sources.push({ tool: fc.name, rows: out.rows.slice(0, 50) });
      results.push({ functionResponse: { name: fc.name, response: { result: out.data } } });
    }
    contents.push({ role: "user", parts: results });
  }
  throw new HttpError(502, "The question needed too many steps. Try asking something narrower.");
}
