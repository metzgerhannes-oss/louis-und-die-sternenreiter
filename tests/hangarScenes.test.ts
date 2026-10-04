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

  it("uses V4 native-art closed states before the gate is solved", () => {
    expect(getSceneImageName("overview", baseState, false, false)).toBe(
      "hangar-main-blackout-v4.webp"
    );
    expect(getSceneImageName("energy", baseState, false, false)).toBe(
      "hangar-energy-v4.webp"
    );
    expect(getSceneImageName("workbench", baseState, false, false)).toBe(
      "hangar-workbench-dark-v4.webp"
    );
    expect(getSceneImageName("ship", baseState, false, false)).toBe(
      "hangar-ship-dark-v4.webp"
    );

    const powered = { ...baseState };
    expect(getSceneImageName("overview", powered, true, false)).toBe(
      "hangar-main-powered-v4.webp"
    );
    expect(getSceneImageName("workbench", powered, true, false)).toBe(
      "hangar-workbench-v4.webp"
    );

    const shipActive = { ...baseState, energyCellInstalled: true };
    expect(getSceneImageName("overview", shipActive, true, false)).toBe(
      "hangar-main-active-v4.webp"
    );
    expect(getSceneImageName("ship", shipActive, true, false)).toBe(
      "hangar-ship-v4.webp"
    );
    expect(getSceneImageName("cooling", shipActive, true, false)).toBe(
      "hangar-cooling-v4.webp"
    );
    expect(getSceneImageName("navigation", shipActive, true, false)).toBe(
      "hangar-navigation-v4.webp"
    );
    expect(getSceneImageName("system-test", shipActive, true, false)).toBe(
      "hangar-systemtest-v4.webp"
    );
    expect(getSceneImageName("gate", shipActive, true, false)).toBe(
      "hangar-gate-closed-v4.webp"
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
      "hangar-main-open-v5.webp"
    );
    expect(getSceneImageName("gate", ready, true, true)).toBe(
      "hangar-gate-open-v5.webp"
    );

    expect(getSceneImageName("energy", ready, true, true)).toBe(
      "hangar-energy-v4.webp"
    );
    expect(getSceneImageName("workbench", ready, true, true)).toBe(
      "hangar-workbench-v4.webp"
    );
    expect(getSceneImageName("cooling", ready, true, true)).toBe(
      "hangar-cooling-v4.webp"
    );
    expect(getSceneImageName("navigation", ready, true, true)).toBe(
      "hangar-navigation-v4.webp"
    );
    expect(getSceneImageName("system-test", ready, true, true)).toBe(
      "hangar-systemtest-v4.webp"
    );
  });
});
