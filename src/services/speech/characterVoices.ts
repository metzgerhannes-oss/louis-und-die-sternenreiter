export type VoiceRole =
  | "Narrator"
  | "Louis"
  | "Philipp"
  | "Charly"
  | "Olli"
  | "Rika"
  | "Dr. Niva"
  | "M-4"
  | "Bram"
  | "Archiv"
  | "Herz";

export type VoiceProfile = {
  rateMultiplier: number;
  pitch: number;
  preferredNames: readonly string[];
};

export const coreVoiceRoles: readonly VoiceRole[] = [
  "Louis",
  "Philipp",
  "Charly",
  "Olli"
];

/**
 * Character voices intentionally stay close to natural device pitch.
 * Large pitch shifts made iOS/Safari system voices sound synthetic and metallic.
 * Character identity now comes primarily from the best native voice plus a small
 * tempo/pitch nuance.
 */
export const voiceProfiles: Record<VoiceRole, VoiceProfile> = {
  Narrator: {
    rateMultiplier: 0.98,
    pitch: 1,
    preferredNames: ["Helena", "Anna", "Petra", "Markus", "Martin"]
  },
  Louis: {
    rateMultiplier: 0.9,
    pitch: 0.97,
    preferredNames: ["Markus", "Martin", "Thomas", "Daniel", "Yannick"]
  },
  Philipp: {
    rateMultiplier: 0.97,
    pitch: 0.99,
    preferredNames: ["Daniel", "Yannick", "Martin", "Markus", "Thomas"]
  },
  Charly: {
    rateMultiplier: 0.98,
    pitch: 1.02,
    preferredNames: ["Anna", "Helena", "Marlene", "Petra", "Katja"]
  },
  Olli: {
    rateMultiplier: 1.02,
    pitch: 1.04,
    preferredNames: ["Yannick", "Daniel", "Markus", "Martin", "Thomas"]
  },
  Rika: {
    rateMultiplier: 0.98,
    pitch: 1.02,
    preferredNames: ["Petra", "Anna", "Helena", "Katja"]
  },
  "Dr. Niva": {
    rateMultiplier: 0.95,
    pitch: 1.01,
    preferredNames: ["Helena", "Petra", "Anna", "Marlene"]
  },
  "M-4": {
    rateMultiplier: 0.9,
    pitch: 0.96,
    preferredNames: ["Daniel", "Martin", "Markus"]
  },
  Bram: {
    rateMultiplier: 0.91,
    pitch: 0.97,
    preferredNames: ["Thomas", "Markus", "Martin", "Daniel"]
  },
  Archiv: {
    rateMultiplier: 0.88,
    pitch: 0.97,
    preferredNames: ["Martin", "Markus", "Daniel", "Thomas"]
  },
  Herz: {
    rateMultiplier: 0.86,
    pitch: 0.96,
    preferredNames: ["Markus", "Martin", "Thomas", "Daniel"]
  }
};

export function asVoiceRole(value: string | null | undefined): VoiceRole {
  if (
    value === "Louis" ||
    value === "Philipp" ||
    value === "Charly" ||
    value === "Olli" ||
    value === "Rika" ||
    value === "Dr. Niva" ||
    value === "M-4" ||
    value === "Bram" ||
    value === "Archiv" ||
    value === "Herz"
  ) {
    return value;
  }

  return "Narrator";
}
