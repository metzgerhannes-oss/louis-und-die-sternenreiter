import { describe, expect, it } from "vitest";
import { buildStructuredIdea } from "../src/features/creator/creatorModel";

describe("creator model", () => {
  it("keeps the child's original idea and structures follow-up answers", () => {
    const result = buildStructuredIdea("Ein Planet mit fliegenden Fischen", {
      place: "Hinter Junction 12",
      look: "Wolken und leuchtende Fische",
      activity: "Einen Wetterturm reparieren",
      special: "Die Fische schwimmen durch Wolken"
    });

    expect(result.summary).toBe("Ein Planet mit fliegenden Fischen");
    expect(result.place).toBe("Hinter Junction 12");
    expect(result.special).toContain("Wolken");
  });
});
