const RELEASE_STORAGE_KEY = "sternenreiter.release-id";

const GAMEPLAY_KEY_PREFIXES = [
  "sternenreiter.chapter",
  "sternenreiter.adventure"
] as const;

const GAMEPLAY_KEYS = new Set([
  "sternenreiter.crew-resources",
  "sternenreiter.completed-star-points"
]);

export type ReleaseResetStorage = Pick<
  Storage,
  "length" | "key" | "getItem" | "setItem" | "removeItem"
>;

export function isGameplayStorageKey(key: string): boolean {
  if (GAMEPLAY_KEYS.has(key)) return true;
  return GAMEPLAY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function resetGameStateForRelease(
  releaseId: string | undefined,
  storage?: ReleaseResetStorage
): boolean {
  if (!releaseId || typeof window === "undefined" && !storage) {
    return false;
  }

  const target = storage ?? window.localStorage;
  const previousReleaseId = target.getItem(RELEASE_STORAGE_KEY);

  if (previousReleaseId === releaseId) {
    return false;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < target.length; index += 1) {
    const key = target.key(index);
    if (key && isGameplayStorageKey(key)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    target.removeItem(key);
  }

  target.setItem(RELEASE_STORAGE_KEY, releaseId);
  return true;
}
