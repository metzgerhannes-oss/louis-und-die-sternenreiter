import { describe, expect, it } from "vitest";
import {
  getCrewMates,
  getProfile,
  playerProfiles
} from "../src/domain/profiles";

describe("player profiles", () => {
  it("contains the three fixed starting profiles", () => {
    expect(playerProfiles.map((profile) => profile.id)).toEqual([
      "charly",
      "philipp",
      "olli"
    ]);
  });

  it("resolves known ids and rejects unknown ids", () => {
    expect(getProfile("philipp")?.displayName).toBe("Philipp");
    expect(getProfile("unknown")).toBeNull();
  });

  it("keeps both other children in the crew regardless of the active profile", () => {
    expect(getCrewMates("philipp").map((profile) => profile.id)).toEqual([
      "charly",
      "olli"
    ]);
    expect(getCrewMates("charly").map((profile) => profile.id)).toEqual([
      "philipp",
      "olli"
    ]);
  });

  it("encodes the approved relative crew proportions", () => {
    expect(getProfile("charly")!.scaleFactor).toBeGreaterThan(
      getProfile("philipp")!.scaleFactor
    );
    expect(getProfile("olli")!.scaleFactor).toBeLessThan(
      getProfile("philipp")!.scaleFactor
    );
  });
});
