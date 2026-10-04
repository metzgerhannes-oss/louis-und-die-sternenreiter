import { describe, expect, it } from "vitest";
import type { Chapter1State } from "../src/services/chapter1State";
import {
  getOverviewTarget,
  getRelevantShipScene,
  getSceneImageName
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
  it("routes the ship through cooling, navigation and system test in order", () => {
    expect(getRelevantShipScene(baseState)).toBe("ship");

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

  it("uses V3 story-native closed states before the gate is solved", () => {
    expect(getSceneImageName("overview", baseState, false, false)).toBe(
      "hangar-main-blackout-v3.webp"
    );
    expect(getSceneImageName("energy", baseState, false, false)).toBe(
      "hangar-energy-v3.webp"
    );
    expect(getSceneImageName("workbench", baseState, false, false)).toBe(
      "hangar-workbench-dark-v3.webp"
    );
    expect(getSceneImageName("ship", baseState, false, false)).toBe(
      "hangar-ship-dark-v3.webp"
    );

    const powered = { ...baseState };
    expect(getSceneImageName("overview", powered, true, false)).toBe(
      "hangar-main-powered-v3.webp"
    );
    expect(getSceneImageName("workbench", powered, true, false)).toBe(
      "hangar-workbench-v3.webp"
    );

    const shipActive = { ...baseState, energyCellInstalled: true };
    expect(getSceneImageName("overview", shipActive, true, false)).toBe(
      "hangar-main-active-v3.webp"
    );
    expect(getSceneImageName("ship", shipActive, true, false)).toBe(
      "hangar-ship-v3.webp"
    );
    expect(getSceneImageName("cooling", shipActive, true, false)).toBe(
      "hangar-cooling-v3.webp"
    );
    expect(getSceneImageName("navigation", shipActive, true, false)).toBe(
      "hangar-navigation-v3.webp"
    );
    expect(getSceneImageName("system-test", shipActive, true, false)).toBe(
      "hangar-systemtest-v3.webp"
    );
    expect(getSceneImageName("gate", shipActive, true, false)).toBe(
      "hangar-gate-closed-v3.webp"
    );
  });

  it("opens only views that actually need an open gate after the solution", () => {
    const ready = {
      ...baseState,
      energyCellInstalled: true,
      coolingRepaired: true,
      navigationRestored: true,
      shipTested: true
    };

    expect(getSceneImageName("overview", ready, true, true)).toBe(
      "hangar-main-open-v3.webp"
    );
    expect(getSceneImageName("gate", ready, true, true)).toBe(
      "hangar-gate-open-v3.webp"
    );

    expect(getSceneImageName("energy", ready, true, true)).toBe(
      "hangar-energy-v3.webp"
    );
    expect(getSceneImageName("workbench", ready, true, true)).toBe(
      "hangar-workbench-v3.webp"
    );
    expect(getSceneImageName("cooling", ready, true, true)).toBe(
      "hangar-cooling-v3.webp"
    );
    expect(getSceneImageName("navigation", ready, true, true)).toBe(
      "hangar-navigation-v3.webp"
    );
    expect(getSceneImageName("system-test", ready, true, true)).toBe(
      "hangar-systemtest-v3.webp"
    );
  });
});
