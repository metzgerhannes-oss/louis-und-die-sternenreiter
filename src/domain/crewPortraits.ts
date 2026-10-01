import type { ProfileId } from "./profiles";

export type CrewPortraitId = ProfileId | "louis";

const base = import.meta.env.BASE_URL;

export const crewPortraits: Record<CrewPortraitId, string> = {
  philipp: `${base}assets/crew/philipp.webp`,
  charly: `${base}assets/crew/charly.webp`,
  olli: `${base}assets/crew/olli.webp`,
  louis: `${base}assets/crew/louis.webp`
};
