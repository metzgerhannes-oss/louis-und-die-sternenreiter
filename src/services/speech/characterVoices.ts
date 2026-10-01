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

export const voiceProfiles: Record<VoiceRole, VoiceProfile> = {
  Narrator: {
    rateMultiplier: 0.98,
    pitch: 1,
    preferredNames: ["Anna", "Petra", "Helena", "Markus", "Martin"]
  },
  Louis: {
    rateMultiplier: 0.94,
    pitch: 0.88,
    preferredNames: ["Markus", "Martin", "Daniel", "Thomas", "Yannick"]
  },
  Philipp: {
    rateMultiplier: 1.02,
    pitch: 1.08,
    preferredNames: ["Yannick", "Markus", "Martin", "Daniel"]
  },
  Charly: {
    rateMultiplier: 1.02,
    pitch: 1.13,
    preferredNames: ["Anna", "Helena", "Petra", "Marlene", "Katja"]
  },
  Olli: {
    rateMultiplier: 1.06,
    pitch: 1.2,
    preferredNames: ["Yannick", "Markus", "Martin", "Daniel"]
  },
  Rika: {
    rateMultiplier: 0.98,
    pitch: 1.02,
    preferredNames: ["Petra", "Anna", "Helena", "Katja"]
  },
  "Dr. Niva": {
    rateMultiplier: 0.95,
    pitch: 1,
    preferredNames: ["Helena", "Petra", "Anna", "Marlene"]
  },
  "M-4": {
    rateMultiplier: 0.9,
    pitch: 0.78,
    preferredNames: ["Markus", "Martin", "Daniel"]
  },
  Bram: {
    rateMultiplier: 0.9,
    pitch: 0.82,
    preferredNames: ["Markus", "Martin", "Thomas", "Daniel"]
  },
  Archiv: {
    rateMultiplier: 0.84,
    pitch: 0.74,
    preferredNames: ["Markus", "Martin", "Daniel", "Thomas"]
  },
  Herz: {
    rateMultiplier: 0.82,
    pitch: 0.7,
    preferredNames: ["Markus", "Martin", "Daniel", "Thomas"]
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
