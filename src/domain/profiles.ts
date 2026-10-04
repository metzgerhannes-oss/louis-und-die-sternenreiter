export type ProfileId = "charly" | "philipp" | "olli";

export type PlayerProfile = {
  id: ProfileId;
  databaseId: string;
  displayName: string;
  accentCss: string;
};

export const playerProfiles: readonly PlayerProfile[] = [
  {
    id: "charly",
    databaseId: "00000000-0000-0000-0000-000000000101",
    displayName: "Charly",
    accentCss: "#d66f8f"
  },
  {
    id: "philipp",
    databaseId: "00000000-0000-0000-0000-000000000102",
    displayName: "Philipp",
    accentCss: "#54a5c5"
  },
  {
    id: "olli",
    databaseId: "00000000-0000-0000-0000-000000000103",
    displayName: "Olli",
    accentCss: "#d49a52"
  }
] as const;

export function getProfile(id: string | null | undefined): PlayerProfile | null {
  return playerProfiles.find((profile) => profile.id === id) ?? null;
}

export function getCrewMates(activeProfileId: ProfileId): PlayerProfile[] {
  return playerProfiles.filter((profile) => profile.id !== activeProfileId);
}
