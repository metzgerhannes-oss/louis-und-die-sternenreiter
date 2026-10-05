import { describe, expect, it } from "vitest";
import {
  failureReactionSpecs,
  type FailureReactionKind
} from "../src/features/story/Chapter1FailureReaction";

describe("chapter 1 failure consequence frames", () => {
  it("has a visual consequence for every failure family", () => {
    const expected: FailureReactionKind[] = [
      "energy-low",
      "energy-overheat",
      "energy-lock",
      "coolant-burst",
      "seal-slip",
      "clamp-kickback",
      "navigation-glitch",
      "system-abort",
      "launch-abort"
    ];

    expect(Object.keys(failureReactionSpecs).sort()).toEqual(expected.sort());
  });

  it("keeps reactions short enough to return quickly to play", () => {
    for (const spec of Object.values(failureReactionSpecs)) {
      expect(spec.durationMs).toBeGreaterThanOrEqual(900);
      expect(spec.durationMs).toBeLessThanOrEqual(1300);
      expect(spec.image).toMatch(/assets\/scenes\/hangar\/.*\.webp$/);
      expect(spec.className).toMatch(/^reaction-/);
    }
  });

  it("uses scene-specific images instead of a generic error card", () => {
    expect(failureReactionSpecs["coolant-burst"].image).toContain(
      "hangar-cooling-v4.webp"
    );
    expect(failureReactionSpecs["navigation-glitch"].image).toContain(
      "hangar-navigation-v4.webp"
    );
    expect(failureReactionSpecs["system-abort"].image).toContain(
      "hangar-systemtest-v4.webp"
    );
    expect(failureReactionSpecs["launch-abort"].image).toContain(
      "hangar-gate-open-v7.webp"
    );
  });
});
