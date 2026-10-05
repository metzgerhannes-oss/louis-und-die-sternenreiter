import { describe, expect, it } from "vitest";
import {
  coolingControlCanRun,
  coolingDisplayOrder,
  coolingRequiredOrder,
  navigationBandStrength,
  navigationIsStable,
  systemControlCanRun,
  systemDisplayOrder,
  systemRequiredOrder
} from "../src/features/story/Chapter1ActionChallenge";

describe("chapter 1 discovery interactions", () => {
  it("does not display cooling controls in solution order", () => {
    expect(coolingDisplayOrder).not.toEqual(coolingRequiredOrder);
    expect(coolingControlCanRun([], "pressure")).toBe(false);
    expect(coolingControlCanRun([], "valve")).toBe(true);
    expect(coolingControlCanRun(["valve"], "clamp")).toBe(true);
    expect(coolingControlCanRun(["valve"], "seal")).toBe(false);
  });

  it("requires players to tune navigation by feedback instead of target labels", () => {
    expect(navigationBandStrength(68, 68)).toBe(100);
    expect(navigationBandStrength(50, 68)).toBeLessThan(50);
    expect(navigationIsStable([68, 42, 81])).toBe(true);
    expect(navigationIsStable([68, 42, 60])).toBe(false);
  });

  it("does not display system controls in startup order", () => {
    expect(systemDisplayOrder).not.toEqual(systemRequiredOrder);
    expect(systemControlCanRun([], "drive")).toBe(false);
    expect(systemControlCanRun([], "energy")).toBe(true);
    expect(systemControlCanRun(["energy"], "cooling")).toBe(true);
    expect(systemControlCanRun(["energy", "cooling"], "navigation")).toBe(true);
    expect(
      systemControlCanRun(["energy", "cooling", "navigation"], "drive")
    ).toBe(true);
  });
});
