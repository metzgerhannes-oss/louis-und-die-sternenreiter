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

export const voiceProfiles: Record<VoiceRole, VoiceProfile> = {
  Narrator: {
    rateMultiplier: 0.96,
    pitch: 1,
    preferredNames: ["Helena", "Anna", "Petra", "Markus", "Martin"]
  },
  Louis: {
    rateMultiplier: 0.86,
    pitch: 0.72,
    preferredNames: ["Markus", "Martin", "Thomas", "Daniel", "Yannick"]
  },
  Philipp: {
    rateMultiplier: 0.98,
    pitch: 0.92,
    preferredNames: ["Daniel", "Yannick", "Martin", "Markus", "Thomas"]
  },
  Charly: {
    rateMultiplier: 1,
    pitch: 1.16,
    preferredNames: ["Anna", "Helena", "Marlene", "Petra", "Katja"]
  },
  Olli: {
    rateMultiplier: 1.08,
    pitch: 1.3,
    preferredNames: ["Yannick", "Daniel", "Markus", "Martin", "Thomas"]
  },
  Rika: {
    rateMultiplier: 0.98,
    pitch: 1.06,
    preferredNames: ["Petra", "Anna", "Helena", "Katja"]
  },
  "Dr. Niva": {
    rateMultiplier: 0.94,
    pitch: 1.02,
    preferredNames: ["Helena", "Petra", "Anna", "Marlene"]
  },
  "M-4": {
    rateMultiplier: 0.88,
    pitch: 0.72,
    preferredNames: ["Daniel", "Martin", "Markus"]
  },
  Bram: {
    rateMultiplier: 0.88,
    pitch: 0.76,
    preferredNames: ["Thomas", "Markus", "Martin", "Daniel"]
  },
  Archiv: {
    rateMultiplier: 0.82,
    pitch: 0.7,
    preferredNames: ["Martin", "Markus", "Daniel", "Thomas"]
  },
  Herz: {
    rateMultiplier: 0.8,
    pitch: 0.66,
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
