import { describe, expect, it } from "vitest";
import {
  prepareTestChapter,
  type TestChapterStorage
} from "../src/services/testChapterJump";

class MemoryStorage implements TestChapterStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

function read(storage: MemoryStorage, key: string) {
  const raw = storage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

describe("test chapter launcher", () => {
  it("starts chapter 1 from a clean Hangar state", () => {
    const storage = new MemoryStorage();
    storage.setItem("sternenreiter.completed-star-points", "[{}]");

    prepareTestChapter("chapter1", storage);

    expect(read(storage, "sternenreiter.chapter1")).toEqual({
      introSeen: false,
      energyCellInstalled: false,
      coolingRepaired: false,
      navigationRestored: false,
      shipTested: false,
      launched: false
    });
    expect(storage.getItem("sternenreiter.completed-star-points")).toBeNull();
    expect(read(storage, "sternenreiter.crew-resources").stardust).toBe(0);
  });

  it("starts Cinder with chapter 1 already completed", () => {
    const storage = new MemoryStorage();

    prepareTestChapter("cinder", storage);

    expect(read(storage, "sternenreiter.chapter1").launched).toBe(true);
    expect(read(storage, "sternenreiter.chapter2.cinder").landingSeen).toBe(false);
    expect(storage.getItem("sternenreiter.adventure")).toBeNull();
  });

  it("starts a later world at step zero with its previous worlds completed", () => {
    const storage = new MemoryStorage();

    prepareTestChapter("distortion", storage);

    const cinder = read(storage, "sternenreiter.chapter2.cinder");
    const adventure = read(storage, "sternenreiter.adventure");
    const resources = read(storage, "sternenreiter.crew-resources");

    expect(cinder.complete).toBe(true);
    expect(adventure.currentWorld).toBe("distortion");
    expect(adventure.stepByWorld.distortion).toBe(0);
    expect(adventure.completedWorlds).toEqual([
      "moss",
      "junction-12",
      "empty-path"
    ]);
    expect(resources.stardust).toBeGreaterThanOrEqual(8);
  });
});
