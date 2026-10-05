import { describe, expect, it } from "vitest";
import { chapter1StoryBeats } from "../src/domain/chapter1";
import { hasChapter1ActionChallenge } from "../src/features/story/Chapter1ActionChallenge";

describe("chapter 1 storyboard", () => {
  it("keeps all three children and Louis represented in the major story beats", () => {
    for (const id of ["intro", "energy-cell", "cooling", "navigation", "ship-test", "launch"] as const) {
      const speakers = new Set(chapter1StoryBeats[id].lines.map((line) => line.speaker));
      expect(speakers).toEqual(new Set(["Philipp", "Charly", "Olli", "Louis"]));
    }
  });

  it("requires interaction for every technical story action after the intro", () => {
    expect(hasChapter1ActionChallenge("intro")).toBe(false);

    for (const id of ["energy-cell", "cooling", "navigation", "ship-test", "launch"] as const) {
      expect(hasChapter1ActionChallenge(id)).toBe(true);
      expect(chapter1StoryBeats[id].action).toBeDefined();
    }
  });

  it("ends with the crew launching together toward Cinder", () => {
    const launch = chapter1StoryBeats.launch;
    expect(launch.action).toBe("launched");
    expect(launch.lines.at(-1)?.text).toContain("Cinder");
  });
});
