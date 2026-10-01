export const wishCategories = [
  "ship",
  "weapon",
  "tool",
  "companion_gear",
  "world_object",
  "cosmetic",
  "story_idea"
] as const;

export type WishCategory = (typeof wishCategories)[number];
export type WishScale = "small" | "medium" | "large" | "epic";

export type WishBlueprint = {
  intent: string;
  category: WishCategory;
  title: string;
  description: string;
  requestedTraits: string[];
  suggestedScale: WishScale;
  louisReply: string;
  needsClarification: boolean;
  clarificationQuestion?: string;
};

export type WishContext = {
  starPointId: string;
  locationId: string;
  allowedTier: "A" | "B" | "C" | "D";
};

export function isWishBlueprint(value: unknown): value is WishBlueprint {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.intent === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    Array.isArray(item.requestedTraits) &&
    item.requestedTraits.every((trait) => typeof trait === "string") &&
    wishCategories.includes(item.category as WishCategory) &&
    ["small", "medium", "large", "epic"].includes(String(item.suggestedScale)) &&
    typeof item.louisReply === "string" &&
    typeof item.needsClarification === "boolean" &&
    (item.clarificationQuestion === undefined || typeof item.clarificationQuestion === "string")
  );
}
