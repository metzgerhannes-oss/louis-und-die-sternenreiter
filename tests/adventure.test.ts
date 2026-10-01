import { describe, expect, it } from "vitest";
import {
  adventureWorldOrder,
  adventureWorlds,
  type AdventureSpeaker
} from "../src/domain/adventure";
import { adventureStarPoints } from "../src/domain/adventureStarPoints";

const coreCrew: AdventureSpeaker[] = ["Philipp", "Charly", "Olli", "Louis"];

describe("main story from Moss to the finale", () => {
  it("keeps the full core crew present in every scripted story beat", () => {
    for (const world of Object.values(adventureWorlds)) {
      for (const step of world.steps) {
        if (step.kind !== "story") continue;

        const speakers = new Set(step.beat.lines.map((line) => line.speaker));
        for (const crewMember of coreCrew) {
          expect(
            speakers.has(crewMember),
            `${world.id} / ${step.beat.id} misses ${crewMember}`
          ).toBe(true);
        }
      }
    }
  });

  it("travels through the worlds in the intended story order", () => {
    expect(adventureWorldOrder).toEqual([
      "moss",
      "junction-12",
      "empty-path",
      "distortion",
      "glass-coast",
      "cloud-ocean",
      "scrap-ring",
      "heart-of-ways"
    ]);

    for (let index = 0; index < adventureWorldOrder.length - 1; index += 1) {
      const world = adventureWorlds[adventureWorldOrder[index]];
      const travel = world.steps.at(-1);
      expect(travel?.kind).toBe("travel");
      if (travel?.kind === "travel") {
        expect(travel.nextWorld).toBe(adventureWorldOrder[index + 1]);
      }
    }
  });

  it("ends at the Heart of the Ways with a real ending", () => {
    const finalStep = adventureWorlds["heart-of-ways"].steps.at(-1);
    expect(finalStep?.kind).toBe("travel");

    if (finalStep?.kind === "travel") {
      expect(finalStep.ending).toBe(true);
      expect(finalStep.nextWorld).toBeUndefined();
    }
  });

  it("allows a child's own idea at every remaining star point", () => {
    for (const point of adventureStarPoints) {
      expect(point.customIdeaAllowed, point.id).toBe(true);
    }
  });

  it("keeps the empty path bounded to a provisional sample instead of auto-canonizing a whole world", () => {
    const emptyWorld = adventureWorlds["empty-path"];
    const starPoint = emptyWorld.steps.find(
      (step) => step.kind === "starpoint"
    );

    expect(starPoint?.kind).toBe("starpoint");
    if (starPoint?.kind === "starpoint") {
      expect(starPoint.point.id).toBe("empty-path-anchor");
      expect(starPoint.point.context).toContain("provisorischen");
      expect(starPoint.point.resultSummary).toContain("Ideenbuch");
    }
  });

  it("has enough scripted stardust rewards to pay all remaining tier-C costs", () => {
    let balance = 1; // Cinder leaves the shared crew with 1.

    for (const worldId of adventureWorldOrder) {
      for (const step of adventureWorlds[worldId].steps) {
        if (step.kind === "story") {
          balance += step.beat.rewardStardust ?? 0;
        }

        if (step.kind === "starpoint") {
          balance -= step.point.stardustCost ?? 0;
          expect(
            balance,
            `negative stardust after ${step.point.id}`
          ).toBeGreaterThanOrEqual(0);
        }
      }
    }

    expect(balance).toBeGreaterThanOrEqual(0);
  });
});
