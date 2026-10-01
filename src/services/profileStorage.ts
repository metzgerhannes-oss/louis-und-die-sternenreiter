import { getProfile, type PlayerProfile } from "../domain/profiles";

const ACTIVE_PROFILE_KEY = "sternenreiter.active-profile";

export function loadActiveProfile(): PlayerProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  return getProfile(window.localStorage.getItem(ACTIVE_PROFILE_KEY));
}

export function saveActiveProfile(profile: PlayerProfile): void {
  window.localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
}

export function clearActiveProfile(): void {
  window.localStorage.removeItem(ACTIVE_PROFILE_KEY);
}
