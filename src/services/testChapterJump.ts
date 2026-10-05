import {
  adventureWorldOrder,
  type AdventureWorldId
} from "../domain/adventure";

export type TestChapterTarget =
  | "chapter1"
  | "cinder"
  | AdventureWorldId;

const CHAPTER1_KEY = "sternenreiter.chapter1";
const CINDER_KEY = "sternenreiter.chapter2.cinder";
const ADVENTURE_KEY = "sternenreiter.adventure";
const RESOURCES_KEY = "sternenreiter.crew-resources";
const STARPOINTS_KEY = "sternenreiter.completed-star-points";

const chapter1Start = {
  introSeen: false,
  energyCellInstalled: false,
  coolingRepaired: false,
  navigationRestored: false,
  shipTested: false,
  launched: false
};

const chapter1Complete = {
  introSeen: true,
  energyCellInstalled: true,
  coolingRepaired: true,
  navigationRestored: true,
  shipTested: true,
  launched: true
};

const cinderStart = {
  landingSeen: false,
  problemKnown: false,
  intakeInspected: false,
  stardustCollected: false,
  waterCelebrated: false,
  driveUpgraded: false,
  complete: false
};

const cinderComplete = {
  landingSeen: true,
  problemKnown: true,
  intakeInspected: true,
  stardustCollected: true,
  waterCelebrated: true,
  driveUpgraded: true,
  complete: true
};

export type TestChapterStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

function write(storage: TestChapterStorage, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}

export function prepareTestChapter(
  target: TestChapterTarget,
  storage?: TestChapterStorage
): void {
  if (!storage && typeof window === "undefined") return;
  const targetStorage = storage ?? window.localStorage;

  targetStorage.removeItem(STARPOINTS_KEY);

  if (target === "chapter1") {
    write(targetStorage, CHAPTER1_KEY, chapter1Start);
    write(targetStorage, CINDER_KEY, cinderStart);
    targetStorage.removeItem(ADVENTURE_KEY);
    write(targetStorage, RESOURCES_KEY, { stardust: 0, scrapParts: 0 });
    return;
  }

  write(targetStorage, CHAPTER1_KEY, chapter1Complete);

  if (target === "cinder") {
    write(targetStorage, CINDER_KEY, cinderStart);
    targetStorage.removeItem(ADVENTURE_KEY);
    write(targetStorage, RESOURCES_KEY, { stardust: 0, scrapParts: 0 });
    return;
  }

  write(targetStorage, CINDER_KEY, cinderComplete);

  const targetIndex = adventureWorldOrder.indexOf(target);
  const completedWorlds =
    targetIndex > 0 ? adventureWorldOrder.slice(0, targetIndex) : [];

  write(targetStorage, ADVENTURE_KEY, {
    currentWorld: target,
    stepByWorld: { [target]: 0 },
    completedWorlds,
    mainStoryFinished: false,
    freeTravelUnlocked: false
  });

  // Teststarts in later chapters need enough shared resource so that upcoming
  // tier-C star points are not blocked by skipped reward beats.
  write(targetStorage, RESOURCES_KEY, { stardust: 12, scrapParts: 0 });
}
