import { handler } from "@/lib/api-auth";
import { aiEnabled } from "@/lib/ai/provider";

export const GET = handler(async () => ({ enabled: aiEnabled() }));
