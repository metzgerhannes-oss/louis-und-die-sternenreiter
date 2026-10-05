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

function write(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function prepareTestChapter(target: TestChapterTarget): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STARPOINTS_KEY);

  if (target === "chapter1") {
    write(CHAPTER1_KEY, chapter1Start);
    write(CINDER_KEY, cinderStart);
    window.localStorage.removeItem(ADVENTURE_KEY);
    write(RESOURCES_KEY, { stardust: 0, scrapParts: 0 });
    return;
  }

  write(CHAPTER1_KEY, chapter1Complete);

  if (target === "cinder") {
    write(CINDER_KEY, cinderStart);
    window.localStorage.removeItem(ADVENTURE_KEY);
    write(RESOURCES_KEY, { stardust: 0, scrapParts: 0 });
    return;
  }

  write(CINDER_KEY, cinderComplete);

  const targetIndex = adventureWorldOrder.indexOf(target);
  const completedWorlds =
    targetIndex > 0 ? adventureWorldOrder.slice(0, targetIndex) : [];

  write(ADVENTURE_KEY, {
    currentWorld: target,
    stepByWorld: { [target]: 0 },
    completedWorlds,
    mainStoryFinished: false,
    freeTravelUnlocked: false
  });

  // Teststarts in later chapters need enough shared resource so that upcoming
  // tier-C star points are not blocked by skipped reward beats.
  write(RESOURCES_KEY, { stardust: 12, scrapParts: 0 });
}
