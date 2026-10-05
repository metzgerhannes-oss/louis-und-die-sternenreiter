import { describe, expect, it } from "vitest";
import { cinderStoryBeats } from "../src/domain/chapter2";
import {
  driveControlCanRun,
  driveDisplayOrder,
  driveRequiredOrder,
  hasCinderActionChallenge,
  isCorrectCondenserDiagnosis,
  isSafeLandingZone,
  isSafeWaterRoute
} from "../src/features/story/CinderActionChallenge";
import type { CrewSpeaker } from "../src/domain/chapter1";
import {
  cinderDistributionStarPoint,
  cinderMoistureStarPoint
} from "../src/domain/starPoints";

describe("Cinder chapter 2A", () => {
  it("keeps Philipp, Charly, Olli and Louis present in every major Cinder story beat", () => {
    const coreCrew: CrewSpeaker[] = ["Philipp", "Charly", "Olli", "Louis"];

    for (const beat of Object.values(cinderStoryBeats)) {
      const speakers = new Set(beat.lines.map((line) => line.speaker));
      for (const member of coreCrew) {
        expect(speakers.has(member)).toBe(true);
      }
    }
  });

  it("teaches two different creation scales", () => {
    expect(cinderMoistureStarPoint.tier).toBe("B");
    expect(cinderMoistureStarPoint.stardustCost).toBe(0);
    expect(cinderDistributionStarPoint.tier).toBe("C");
    expect(cinderDistributionStarPoint.stardustCost).toBe(1);
  });

  it("keeps free child ideas available at both Cinder star points", () => {
    expect(cinderMoistureStarPoint.customIdeaAllowed).toBe(true);
    expect(cinderDistributionStarPoint.customIdeaAllowed).toBe(true);
  });

  it("turns the core Cinder beats into real player actions", () => {
    for (const id of ["landing", "inspect-intake", "route-survey", "drive-upgrade"] as const) {
      expect(hasCinderActionChallenge(id)).toBe(true);
    }

    expect(isSafeLandingZone("mesa-lee")).toBe(true);
    expect(isSafeLandingZone("rotors")).toBe(false);
    expect(isSafeLandingZone("salt-flat")).toBe(false);

    expect(isCorrectCondenserDiagnosis("heat-transfer")).toBe(true);
    expect(isCorrectCondenserDiagnosis("no-moisture")).toBe(false);
    expect(isCorrectCondenserDiagnosis("weak-wind")).toBe(false);

    expect(isSafeWaterRoute("service-trench")).toBe(true);
    expect(isSafeWaterRoute("surface")).toBe(false);
    expect(isSafeWaterRoute("canyon-floor")).toBe(false);
  });

  it("does not display the drive-upgrade controls in solution order", () => {
    expect(driveDisplayOrder).not.toEqual(driveRequiredOrder);
    expect(driveControlCanRun([], "couple")).toBe(false);
    expect(driveControlCanRun([], "power")).toBe(true);
    expect(driveControlCanRun(["power"], "mount")).toBe(true);
    expect(driveControlCanRun(["power", "mount"], "coil")).toBe(true);
    expect(driveControlCanRun(["power", "mount", "coil"], "couple")).toBe(true);
  });

  it("installs the drive upgrade before the separate departure to Moss", () => {
    const finalBeat = cinderStoryBeats["drive-upgrade"];
    expect(finalBeat.action).toBe("drive-upgraded");
    expect(finalBeat.lines.at(-1)?.text).toContain("Moss");
  });
});
