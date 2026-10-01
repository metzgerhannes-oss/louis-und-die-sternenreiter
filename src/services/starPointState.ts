import type { PlayerProfile } from "../domain/profiles";
import type { StarPointDefinition } from "../domain/starPoints";

export type CompletedStarPoint = {
  starPointId: string;
  profileId: string;
  ideaText: string;
  optionId: string | null;
  inputMethod: "prepared" | "text" | "voice";
  completedAt: string;
};

const STORAGE_KEY = "sternenreiter.completed-star-points";

function readAll(): CompletedStarPoint[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CompletedStarPoint[]) : [];
  } catch {
    return [];
  }
}

export function isStarPointCompleted(starPointId: string): boolean {
  return readAll().some((entry) => entry.starPointId === starPointId);
}

export function getCompletedStarPoint(
  starPointId: string
): CompletedStarPoint | null {
  return readAll().find((entry) => entry.starPointId === starPointId) ?? null;
}

export function completeStarPoint(
  point: StarPointDefinition,
  profile: PlayerProfile,
  input: {
    ideaText: string;
    optionId?: string | null;
    inputMethod: CompletedStarPoint["inputMethod"];
  }
): CompletedStarPoint {
  const completed: CompletedStarPoint = {
    starPointId: point.id,
    profileId: profile.id,
    ideaText: input.ideaText.trim(),
    optionId: input.optionId ?? null,
    inputMethod: input.inputMethod,
    completedAt: new Date().toISOString()
  };

  const all = readAll().filter((entry) => entry.starPointId !== point.id);
  all.push(completed);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  return completed;
}
