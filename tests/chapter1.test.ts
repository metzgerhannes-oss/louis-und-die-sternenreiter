import { describe, expect, it } from "vitest";
import { chapter1StoryBeats } from "../src/domain/chapter1";

describe("chapter 1 storyboard", () => {
  it("keeps all three children and Louis represented in the major story beats", () => {
    for (const id of ["intro", "energy-cell", "cooling", "navigation", "ship-test", "launch"] as const) {
      const speakers = new Set(chapter1StoryBeats[id].lines.map((line) => line.speaker));
      expect(speakers).toEqual(new Set(["Philipp", "Charly", "Olli", "Louis"]));
    }
  });

  it("ends with the crew launching together toward Cinder", () => {
    const launch = chapter1StoryBeats.launch;
    expect(launch.action).toBe("launched");
    expect(launch.lines.at(-1)?.text).toContain("Cinder");
  });
});
