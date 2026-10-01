export type ProfileId = "charly" | "philipp" | "olli";

export type PlayerProfile = {
  id: ProfileId;
  displayName: string;
  avatarId: string;
  accent: number;
  accentCss: string;
  suit: number;
  suitCss: string;
  initials: string;
};

export const playerProfiles: readonly PlayerProfile[] = [
  {
    id: "charly",
    displayName: "Charly",
    avatarId: "charly-default",
    accent: 0xd66f8f,
    accentCss: "#d66f8f",
    suit: 0x4e5f72,
    suitCss: "#4e5f72",
    initials: "C"
  },
  {
    id: "philipp",
    displayName: "Philipp",
    avatarId: "philipp-default",
    accent: 0x54a5c5,
    accentCss: "#54a5c5",
    suit: 0x4d5b48,
    suitCss: "#4d5b48",
    initials: "P"
  },
  {
    id: "olli",
    displayName: "Olli",
    avatarId: "olli-default",
    accent: 0xd49a52,
    accentCss: "#d49a52",
    suit: 0x665a4e,
    suitCss: "#665a4e",
    initials: "O"
  }
] as const;

export function getProfile(id: string | null | undefined): PlayerProfile | null {
  return playerProfiles.find((profile) => profile.id === id) ?? null;
}
