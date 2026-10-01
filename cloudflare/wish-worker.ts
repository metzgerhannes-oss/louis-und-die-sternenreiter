export interface Env {
  AI: {
    run(model: string, input: Record<string, unknown>): Promise<unknown>;
  };
  ALLOWED_ORIGIN?: string;
}

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

const SYSTEM_PROMPT = `Du bist Louis, Sternenformer 07, in einem kindgerechten Sci-Fi-Spiel.
Interpretiere ausschließlich den Wunsch des Kindes. Erzeuge keine Spielbefehle und keine endgültigen Werte.
Antworte ausschließlich als JSON-Objekt mit:
intent, category, title, description, requestedTraits, suggestedScale, louisReply, needsClarification, clarificationQuestion.
category muss exakt einer dieser Werte sein:
ship, weapon, tool, companion_gear, world_object, cosmetic, story_idea.
suggestedScale muss exakt small, medium, large oder epic sein.
louisReply ist kurz, freundlich und auf Deutsch.
Keine Markdown-Zäune, kein Text außerhalb des JSON.`;

function corsHeaders(origin: string | null, allowedOrigin?: string) {
  const allow = allowedOrigin || "*";
  const actual = allow === "*" ? "*" : origin === allow ? origin : "";
  return {
    "access-control-allow-origin": actual || allow,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "content-type": "application/json; charset=utf-8"
  };
}

function extractText(result: unknown): string {
  if (typeof result === "string") return result;
  if (!result || typeof result !== "object") return "";
  const value = result as Record<string, unknown>;
  if (typeof value.response === "string") return value.response;
  if (typeof value.result === "string") return value.result;
  return "";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "method_not_allowed" }, { status: 405, headers });
    }

    try {
      const body = (await request.json()) as {
        text?: unknown;
        context?: unknown;
      };

      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!text || text.length > 1200) {
        return Response.json({ error: "invalid_wish" }, { status: 400, headers });
      }

      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              wish: text,
              context: body.context ?? {}
            })
          }
        ],
        max_tokens: 450,
        temperature: 0.3
      });

      const raw = extractText(result).trim();
      const blueprint = JSON.parse(raw);

      return Response.json({ blueprint }, { status: 200, headers });
    } catch {
      return Response.json({ error: "wish_interpretation_failed" }, { status: 502, headers });
    }
  }
};
