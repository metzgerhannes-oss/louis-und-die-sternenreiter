import { describe, expect, it } from "vitest";
import { cinderStoryBeats } from "../src/domain/chapter2";
import {
  cinderDistributionStarPoint,
  cinderMoistureStarPoint
} from "../src/domain/starPoints";

describe("Cinder chapter 2A", () => {
  it("keeps Philipp, Charly, Olli and Louis present in every major Cinder story beat", () => {
    const coreCrew = ["Philipp", "Charly", "Olli", "Louis"];

    for (const beat of Object.values(cinderStoryBeats)) {
      const speakers = new Set(beat.lines.map((line) => line.speaker));
      for (const member of coreCrew) {
        expect(speakers.has(member as never)).toBe(true);
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

  it("ends the Cinder arc by revealing Moss", () => {
    const finalBeat = cinderStoryBeats["drive-upgrade"];
    expect(finalBeat.action).toBe("cinder-complete");
    expect(finalBeat.lines.at(-1)?.text).toContain("Moss");
  });
});
