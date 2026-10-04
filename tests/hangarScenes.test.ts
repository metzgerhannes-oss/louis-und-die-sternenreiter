import { describe, expect, it } from "vitest";
import type { Chapter1State } from "../src/services/chapter1State";
import {
  getOverviewTarget,
  getRelevantShipScene
} from "../src/features/scenes/HangarFixedScene";

const baseState: Chapter1State = {
  introSeen: true,
  energyCellInstalled: false,
  coolingRepaired: false,
  navigationRestored: false,
  shipTested: false,
  launched: false
};

describe("Hangar storyboard scene flow", () => {
  it("keeps the ship dark before the energy cell is installed", () => {
    expect(getRelevantShipScene(baseState)).toBe("ship");
  });

  it("routes the ship through cooling, navigation and system test in order", () => {
    expect(
      getRelevantShipScene({
        ...baseState,
        energyCellInstalled: true
      })
    ).toBe("cooling");

    expect(
      getRelevantShipScene({
        ...baseState,
        energyCellInstalled: true,
        coolingRepaired: true
      })
    ).toBe("navigation");

    expect(
      getRelevantShipScene({
        ...baseState,
        energyCellInstalled: true,
        coolingRepaired: true,
        navigationRestored: true
      })
    ).toBe("system-test");
  });

  it("routes overview hotspots to their dedicated scenes", () => {
    expect(getOverviewTarget("energy-distributor", baseState)).toBe("energy");
    expect(getOverviewTarget("workbench", baseState)).toBe("workbench");
    expect(getOverviewTarget("hangar-door", baseState)).toBe("gate");
    expect(getOverviewTarget("louis", baseState)).toBe("crew");
  });
});
