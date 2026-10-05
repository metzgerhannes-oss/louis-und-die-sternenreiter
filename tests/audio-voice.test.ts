import { describe, expect, it } from "vitest";
import {
  asVoiceRole,
  voiceProfiles,
  type VoiceRole
} from "../src/services/speech/characterVoices";

describe("character voice profiles", () => {
  it("has a profile for every core crew member", () => {
    const crew: VoiceRole[] = ["Philipp", "Charly", "Olli", "Louis"];

    for (const member of crew) {
      expect(voiceProfiles[member]).toBeDefined();
      expect(voiceProfiles[member].preferredNames.length).toBeGreaterThan(0);
    }
  });

  it("keeps character pitch close to natural speech", () => {
    const crew: VoiceRole[] = ["Philipp", "Charly", "Olli", "Louis"];

    for (const member of crew) {
      expect(voiceProfiles[member].pitch).toBeGreaterThanOrEqual(0.95);
      expect(voiceProfiles[member].pitch).toBeLessThanOrEqual(1.05);
    }

    expect(voiceProfiles.Louis.rateMultiplier).toBeLessThan(
      voiceProfiles.Olli.rateMultiplier
    );
  });

  it("maps story speakers and falls back safely to the narrator", () => {
    expect(asVoiceRole("Louis")).toBe("Louis");
    expect(asVoiceRole("M-4")).toBe("M-4");
    expect(asVoiceRole("Herz")).toBe("Herz");
    expect(asVoiceRole("Unbekannt")).toBe("Narrator");
    expect(asVoiceRole(undefined)).toBe("Narrator");
  });

  it("keeps all configured speech rates and pitches in natural browser-safe ranges", () => {
    for (const profile of Object.values(voiceProfiles)) {
      expect(profile.rateMultiplier).toBeGreaterThanOrEqual(0.8);
      expect(profile.rateMultiplier).toBeLessThanOrEqual(1.08);
      expect(profile.pitch).toBeGreaterThanOrEqual(0.95);
      expect(profile.pitch).toBeLessThanOrEqual(1.05);
    }
  });
});
