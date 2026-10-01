import { describe, expect, it } from "vitest";
import { isWishBlueprint } from "../src/domain/wishes";

describe("WishBlueprint validation", () => {
  it("accepts a valid structured wish", () => {
    expect(isWishBlueprint({
      intent: "Eine Plasmakanone bauen",
      category: "weapon",
      title: "Plasmakanone",
      description: "Eine große Bordwaffe mit leuchtender Plasmaenergie.",
      requestedTraits: ["groß", "plasma"],
      suggestedScale: "large",
      louisReply: "Das kann ich in einen Bauplan übersetzen.",
      needsClarification: false
    })).toBe(true);
  });

  it("rejects unknown categories and missing fields", () => {
    expect(isWishBlueprint({
      intent: "Alles unbesiegbar machen",
      category: "god_mode",
      title: "Unendlich",
      description: "Nicht erlaubt",
      requestedTraits: [],
      suggestedScale: "epic",
      louisReply: "Nein.",
      needsClarification: false
    })).toBe(false);
  });
});
