import type { WishBlueprint, WishContext } from "../domain/wishes";
import { isWishBlueprint } from "../domain/wishes";

export type WishInterpretation =
  | { source: "ai"; blueprint: WishBlueprint }
  | { source: "offline"; blueprint: WishBlueprint; reason: string };

function fallbackBlueprint(text: string): WishBlueprint {
  const clean = text.trim();
  return {
    intent: clean,
    category: "world_object",
    title: "Eigener Entwurf",
    description: clean,
    requestedTraits: [],
    suggestedScale: "medium",
    louisReply: "Ich habe deinen Wunsch verstanden und als Entwurf behalten. Meine Sternenfunk-Verbindung ist gerade nicht verfügbar.",
    needsClarification: false
  };
}

export async function interpretWish(
  text: string,
  context: WishContext
): Promise<WishInterpretation> {
  const endpoint = import.meta.env.VITE_WISH_API_URL?.trim();

  if (!endpoint) {
    return {
      source: "offline",
      blueprint: fallbackBlueprint(text),
      reason: "Wunsch-KI ist auf diesem Build noch nicht verbunden."
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.trim(), context })
    });

    if (!response.ok) {
      throw new Error(`Wish API ${response.status}`);
    }

    const payload: unknown = await response.json();
    const candidate =
      payload && typeof payload === "object" && "blueprint" in payload
        ? (payload as { blueprint: unknown }).blueprint
        : payload;

    if (!isWishBlueprint(candidate)) {
      throw new Error("Ungültige WishBlueprint-Antwort");
    }

    return { source: "ai", blueprint: candidate };
  } catch (error) {
    return {
      source: "offline",
      blueprint: fallbackBlueprint(text),
      reason: error instanceof Error ? error.message : "Wunsch-KI nicht erreichbar."
    };
  }
}
