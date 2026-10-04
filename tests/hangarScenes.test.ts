import { readFileSync } from "node:fs";
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

  it("uses native closed-gate V2 artwork before the gate solution", () => {
    expect(getSceneImageName("overview", baseState, false, false)).toBe(
      "hangar-main-blackout-v2.webp"
    );
    expect(getSceneImageName("energy", baseState, false, false)).toBe(
      "hangar-energy-v2.webp"
    );
    expect(getSceneImageName("workbench", baseState, false, false)).toBe(
      "hangar-workbench-dark-v2.webp"
    );
    expect(getSceneImageName("ship", baseState, false, false)).toBe(
      "hangar-ship-dark-v2.webp"
    );

    const powered = { ...baseState };
    expect(getSceneImageName("overview", powered, true, false)).toBe(
      "hangar-main-powered-v2.webp"
    );
    expect(getSceneImageName("workbench", powered, true, false)).toBe(
      "hangar-workbench-v2.webp"
    );

    const shipActive = { ...baseState, energyCellInstalled: true };
    expect(getSceneImageName("overview", shipActive, true, false)).toBe(
      "hangar-main-active-v2.webp"
    );
    expect(getSceneImageName("ship", shipActive, true, false)).toBe(
      "hangar-ship-v2.webp"
    );

    expect(
      getSceneImageName(
        "system-test",
        { ...shipActive, coolingRepaired: true, navigationRestored: true },
        true,
        false
      )
    ).toBe("hangar-systemtest-v2.webp");
    expect(getSceneImageName("gate", shipActive, true, false)).toBe(
      "hangar-gate-closed-v2.webp"
    );
  });

  it("switches every scene to a native open-state image only after the gate solution", () => {
    const ready = {
      ...baseState,
      energyCellInstalled: true,
      coolingRepaired: true,
      navigationRestored: true,
      shipTested: true
    };

    const scenes = [
      "overview",
      "energy",
      "workbench",
      "ship",
      "cooling",
      "navigation",
      "system-test",
      "gate",
      "crew"
    ] as const;

    for (const scene of scenes) {
      const image = getSceneImageName(scene, ready, true, true);
      expect(image).toMatch(/-open-v2\.webp$/);
      expect(image).not.toContain("-v1.");
    }
  });

  it("does not reintroduce CSS gate, starfield or blackout compositing", () => {
    const component = readFileSync(
      new URL("../src/features/scenes/HangarFixedScene.tsx", import.meta.url),
      "utf8"
    );
    const css = readFileSync(
      new URL("../src/app/app.css", import.meta.url),
      "utf8"
    );

    expect(component).not.toContain("story-gate-shutter");
    expect(component).not.toContain("story-open-gate-space");
    expect(component).not.toContain("story-blackout-haze");
    expect(css).not.toContain(".story-gate-shutter");
    expect(css).not.toContain(".story-open-gate-space");
    expect(css).not.toContain(".story-blackout-haze");
  });
});
