import { describe, expect, it } from "vitest";
import {
  isGameplayStorageKey,
  resetGameStateForRelease,
  type ReleaseResetStorage
} from "../src/services/releaseReset";

class MemoryStorage implements ReleaseResetStorage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

describe("release reset", () => {
  it("recognizes gameplay progress but not preferences or submitted ideas", () => {
    expect(isGameplayStorageKey("sternenreiter.chapter1")).toBe(true);
    expect(isGameplayStorageKey("sternenreiter.chapter2.cinder")).toBe(true);
    expect(isGameplayStorageKey("sternenreiter.adventure")).toBe(true);
    expect(isGameplayStorageKey("sternenreiter.crew-resources")).toBe(true);
    expect(isGameplayStorageKey("sternenreiter.completed-star-points")).toBe(true);

    expect(isGameplayStorageKey("sternenreiter.active-profile")).toBe(false);
    expect(isGameplayStorageKey("sternenreiter.audio")).toBe(false);
    expect(isGameplayStorageKey("sternenreiter.speech.philipp")).toBe(false);
    expect(isGameplayStorageKey("sternenreiter.pending-ideas")).toBe(false);
  });

  it("resets gameplay exactly once for a new release", () => {
    const storage = new MemoryStorage();

    storage.setItem("sternenreiter.chapter1", "{\"introSeen\":true}");
    storage.setItem("sternenreiter.chapter2.cinder", "{\"complete\":true}");
    storage.setItem("sternenreiter.adventure", "{\"mainStoryFinished\":true}");
    storage.setItem("sternenreiter.crew-resources", "{\"stardust\":8}");
    storage.setItem("sternenreiter.completed-star-points", "[{}]");
    storage.setItem("sternenreiter.active-profile", "philipp");
    storage.setItem("sternenreiter.audio", "{\"enabled\":true}");
    storage.setItem("sternenreiter.speech.philipp", "{\"autoRead\":true}");
    storage.setItem("sternenreiter.pending-ideas", "[{\"id\":\"idea-1\"}]");

    expect(resetGameStateForRelease("release-a", storage)).toBe(true);

    expect(storage.getItem("sternenreiter.chapter1")).toBeNull();
    expect(storage.getItem("sternenreiter.chapter2.cinder")).toBeNull();
    expect(storage.getItem("sternenreiter.adventure")).toBeNull();
    expect(storage.getItem("sternenreiter.crew-resources")).toBeNull();
    expect(storage.getItem("sternenreiter.completed-star-points")).toBeNull();

    expect(storage.getItem("sternenreiter.active-profile")).toBe("philipp");
    expect(storage.getItem("sternenreiter.audio")).toBe("{\"enabled\":true}");
    expect(storage.getItem("sternenreiter.speech.philipp")).toBe(
      "{\"autoRead\":true}"
    );
    expect(storage.getItem("sternenreiter.pending-ideas")).toBe(
      "[{\"id\":\"idea-1\"}]"
    );
    expect(storage.getItem("sternenreiter.release-id")).toBe("release-a");

    storage.setItem("sternenreiter.chapter1", "{\"introSeen\":true}");
    expect(resetGameStateForRelease("release-a", storage)).toBe(false);
    expect(storage.getItem("sternenreiter.chapter1")).not.toBeNull();

    expect(resetGameStateForRelease("release-b", storage)).toBe(true);
    expect(storage.getItem("sternenreiter.chapter1")).toBeNull();
    expect(storage.getItem("sternenreiter.release-id")).toBe("release-b");
  });
});
