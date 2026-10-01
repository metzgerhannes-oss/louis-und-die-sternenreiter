import { describe, expect, it } from "vitest";
import {
  asVoiceRole,
  voiceProfiles,
  type VoiceRole
} from "../src/services/speech/characterVoices";

describe("character voice profiles", () => {
  it("has a distinct profile for every core crew member", () => {
    const crew: VoiceRole[] = ["Philipp", "Charly", "Olli", "Louis"];

    for (const member of crew) {
      expect(voiceProfiles[member]).toBeDefined();
      expect(voiceProfiles[member].preferredNames.length).toBeGreaterThan(0);
    }

    expect(voiceProfiles.Louis.pitch).toBeLessThan(voiceProfiles.Philipp.pitch);
    expect(voiceProfiles.Olli.pitch).toBeGreaterThan(voiceProfiles.Philipp.pitch);
    expect(voiceProfiles.Charly.pitch).not.toBe(voiceProfiles.Louis.pitch);
  });

  it("maps story speakers and falls back safely to the narrator", () => {
    expect(asVoiceRole("Louis")).toBe("Louis");
    expect(asVoiceRole("M-4")).toBe("M-4");
    expect(asVoiceRole("Herz")).toBe("Herz");
    expect(asVoiceRole("Unbekannt")).toBe("Narrator");
    expect(asVoiceRole(undefined)).toBe("Narrator");
  });

  it("keeps all configured speech rates and pitches in browser-safe ranges", () => {
    for (const profile of Object.values(voiceProfiles)) {
      expect(profile.rateMultiplier).toBeGreaterThanOrEqual(0.75);
      expect(profile.rateMultiplier).toBeLessThanOrEqual(1.15);
      expect(profile.pitch).toBeGreaterThanOrEqual(0.65);
      expect(profile.pitch).toBeLessThanOrEqual(1.3);
    }
  });
});
