import { describe, expect, it } from "vitest";
import {
  driveControlCanRun,
  driveDisplayOrder,
  driveRequiredOrder,
  hasCinderActionChallenge,
  isCorrectCondenserDiagnosis,
  isSafeLandingZone,
  isSafeWaterRoute
} from "../src/features/story/CinderActionChallenge";
import {
  getCinderReactionMinDisplayMs,
  type CinderFailureReactionKind
} from "../src/features/story/CinderFailureReaction";

describe("Cinder interactive chapter", () => {
  it("requires play for the landing, diagnosis, route survey and drive upgrade", () => {
    expect(hasCinderActionChallenge("landing")).toBe(true);
    expect(hasCinderActionChallenge("inspect-intake")).toBe(true);
    expect(hasCinderActionChallenge("route-survey")).toBe(true);
    expect(hasCinderActionChallenge("drive-upgrade")).toBe(true);
    expect(hasCinderActionChallenge("settlement")).toBe(false);
    expect(hasCinderActionChallenge("stardust")).toBe(false);
  });

  it("does not make every visible Cinder choice correct", () => {
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

  it("hides the drive installation sequence in a different display order", () => {
    expect(driveDisplayOrder).not.toEqual(driveRequiredOrder);
    expect(driveControlCanRun([], "couple")).toBe(false);
    expect(driveControlCanRun([], "power")).toBe(true);
    expect(driveControlCanRun(["power"], "mount")).toBe(true);
    expect(driveControlCanRun(["power", "mount"], "coil")).toBe(true);
    expect(
      driveControlCanRun(["power", "mount", "coil"], "couple")
    ).toBe(true);
  });

  it("keeps Cinder failure frames child-paced before continue appears", () => {
    const kinds: CinderFailureReactionKind[] = [
      "dust-blast",
      "ground-crack",
      "dry-air",
      "fan-dust",
      "coil-kickback",
      "coil-spark",
      "system-lock"
    ];

    for (const kind of kinds) {
      expect(getCinderReactionMinDisplayMs(kind)).toBeGreaterThanOrEqual(1900);
    }
  });
});
