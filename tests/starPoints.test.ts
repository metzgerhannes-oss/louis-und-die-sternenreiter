import { describe, expect, it } from "vitest";
import { hangarEnergyStarPoint } from "../src/domain/starPoints";

describe("first Hangar 3 star point", () => {
  it("is a material-bound tier B creation point", () => {
    expect(hangarEnergyStarPoint.tier).toBe("B");
    expect(hangarEnergyStarPoint.locationId).toBe("hangar-3");
  });

  it("offers prepared solutions while still allowing a child's own idea", () => {
    expect(hangarEnergyStarPoint.preparedOptions.length).toBeGreaterThanOrEqual(3);
    expect(hangarEnergyStarPoint.customIdeaAllowed).toBe(true);
  });

  it("does not define a global world replacement", () => {
    expect(hangarEnergyStarPoint.id).toBe("hangar-energy-distributor");
    expect(hangarEnergyStarPoint.context).toContain("Werkbank");
  });
});
