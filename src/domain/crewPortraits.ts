import type { ProfileId } from "./profiles";

export type CrewPortraitId = ProfileId | "louis";

const base = import.meta.env.BASE_URL;

export const crewPortraits: Record<CrewPortraitId, string> = {
  philipp: `${base}assets/crew/philipp-portrait-v4.webp`,
  charly: `${base}assets/crew/charly-portrait-v4.webp`,
  olli: `${base}assets/crew/olli-portrait-v4.webp`,
  louis: `${base}assets/crew/louis.webp`
};
