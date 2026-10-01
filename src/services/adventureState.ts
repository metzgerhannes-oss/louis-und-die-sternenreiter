import {
  adventureWorldOrder,
  adventureWorlds,
  type AdventureStep,
  type AdventureWorldId
} from "../domain/adventure";

export type AdventureState = {
  currentWorld: AdventureWorldId;
  stepByWorld: Partial<Record<AdventureWorldId, number>>;
  completedWorlds: AdventureWorldId[];
  mainStoryFinished: boolean;
  freeTravelUnlocked: boolean;
};

const STORAGE_KEY = "sternenreiter.adventure";
const initialState: AdventureState = {
  currentWorld: "moss",
  stepByWorld: {},
  completedWorlds: [],
  mainStoryFinished: false,
  freeTravelUnlocked: false
};

function sanitizeWorld(value: unknown): AdventureWorldId {
  return adventureWorldOrder.includes(value as AdventureWorldId)
    ? (value as AdventureWorldId)
    : "moss";
}

export function loadAdventureState(): AdventureState {
  if (typeof window === "undefined") return initialState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as Partial<AdventureState>;
    const stepByWorld: Partial<Record<AdventureWorldId, number>> = {};

    for (const id of adventureWorldOrder) {
      const value = parsed.stepByWorld?.[id];
      if (typeof value === "number" && Number.isFinite(value)) {
        stepByWorld[id] = Math.max(
          0,
          Math.min(Math.floor(value), adventureWorlds[id].steps.length - 1)
        );
      }
    }

    return {
      currentWorld: sanitizeWorld(parsed.currentWorld),
      stepByWorld,
      completedWorlds: Array.isArray(parsed.completedWorlds)
        ? parsed.completedWorlds
            .map(sanitizeWorld)
            .filter((id, index, all) => all.indexOf(id) === index)
        : [],
      mainStoryFinished: Boolean(parsed.mainStoryFinished),
      freeTravelUnlocked: Boolean(parsed.freeTravelUnlocked)
    };
  } catch {
    return initialState;
  }
}

function save(state: AdventureState): AdventureState {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function getAdventureStep(
  state = loadAdventureState(),
  worldId = state.currentWorld
): AdventureStep {
  const index = state.stepByWorld[worldId] ?? 0;
  return adventureWorlds[worldId].steps[
    Math.min(index, adventureWorlds[worldId].steps.length - 1)
  ];
}

export function getAdventureStepIndex(
  state = loadAdventureState(),
  worldId = state.currentWorld
): number {
  return state.stepByWorld[worldId] ?? 0;
}

export function advanceAdventureStep(worldId: AdventureWorldId): AdventureState {
  const state = loadAdventureState();
  const world = adventureWorlds[worldId];
  const current = state.stepByWorld[worldId] ?? 0;
  const max = world.steps.length - 1;

  if (current >= max) {
    return state;
  }

  return save({
    ...state,
    currentWorld: worldId,
    stepByWorld: {
      ...state.stepByWorld,
      [worldId]: current + 1
    }
  });
}

export function travelAdventureWorld(nextWorld: AdventureWorldId): AdventureState {
  const state = loadAdventureState();
  const current = state.currentWorld;
  const completedWorlds = state.completedWorlds.includes(current)
    ? state.completedWorlds
    : [...state.completedWorlds, current];

  return save({
    ...state,
    currentWorld: nextWorld,
    completedWorlds,
    stepByWorld: {
      ...state.stepByWorld,
      [nextWorld]: state.stepByWorld[nextWorld] ?? 0
    }
  });
}

export function visitAdventureWorld(worldId: AdventureWorldId): AdventureState {
  const state = loadAdventureState();
  return save({ ...state, currentWorld: worldId });
}

export function finishMainStory(): AdventureState {
  const state = loadAdventureState();
  const completedWorlds: AdventureWorldId[] = state.completedWorlds.includes("heart-of-ways")
    ? state.completedWorlds
    : [...state.completedWorlds, "heart-of-ways"];

  return save({
    ...state,
    completedWorlds,
    mainStoryFinished: true,
    freeTravelUnlocked: true
  });
}

export function getAdventureObjective(state = loadAdventureState()): string {
  if (state.mainStoryFinished) {
    return "Hüter der Wege · Freie Reisen sind freigeschaltet.";
  }
  return getAdventureStep(state).objective;
}

export function getAdventureLocationLabel(
  state = loadAdventureState()
): string {
  const world = adventureWorlds[state.currentWorld];
  return `${world.chapter} · ${world.title}`;
}

export function isWorldUnlocked(
  worldId: AdventureWorldId,
  state = loadAdventureState()
): boolean {
  if (state.freeTravelUnlocked) return true;
  if (worldId === state.currentWorld) return true;
  if (state.completedWorlds.includes(worldId)) return true;

  const currentIndex = adventureWorldOrder.indexOf(state.currentWorld);
  const targetIndex = adventureWorldOrder.indexOf(worldId);
  return targetIndex <= currentIndex;
}
