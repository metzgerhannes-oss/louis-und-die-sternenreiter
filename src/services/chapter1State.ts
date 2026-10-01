import {
  chapter1StoryBeats,
  type Chapter1Action,
  type Chapter1StoryBeat,
  type Chapter1StoryBeatId
} from "../domain/chapter1";
import {
  hangarEnergyStarPoint,
  hangarGateStarPoint
} from "../domain/starPoints";
import { isStarPointCompleted } from "./starPointState";

export type Chapter1State = {
  introSeen: boolean;
  energyCellInstalled: boolean;
  coolingRepaired: boolean;
  navigationRestored: boolean;
  shipTested: boolean;
  launched: boolean;
};

const STORAGE_KEY = "sternenreiter.chapter1";

const initialState: Chapter1State = {
  introSeen: false,
  energyCellInstalled: false,
  coolingRepaired: false,
  navigationRestored: false,
  shipTested: false,
  launched: false
};

export function loadChapter1State(): Chapter1State {
  if (typeof window === "undefined") {
    return initialState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Chapter1State>;
    return {
      introSeen: Boolean(parsed.introSeen),
      energyCellInstalled: Boolean(parsed.energyCellInstalled),
      coolingRepaired: Boolean(parsed.coolingRepaired),
      navigationRestored: Boolean(parsed.navigationRestored),
      shipTested: Boolean(parsed.shipTested),
      launched: Boolean(parsed.launched)
    };
  } catch {
    return initialState;
  }
}

export function applyChapter1Action(action: Chapter1Action): Chapter1State {
  const state = loadChapter1State();
  const next = { ...state };

  switch (action) {
    case "intro-seen":
      next.introSeen = true;
      break;
    case "energy-cell-installed":
      next.energyCellInstalled = true;
      break;
    case "cooling-repaired":
      next.coolingRepaired = true;
      break;
    case "navigation-restored":
      next.navigationRestored = true;
      break;
    case "ship-tested":
      next.shipTested = true;
      break;
    case "launched":
      next.launched = true;
      break;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getChapter1Objective(state = loadChapter1State()): string {
  if (state.launched) return "Kapitel 1 abgeschlossen · Kurs Cinder";
  if (!state.introSeen) return "Bleibt zusammen und seht euch in Hangar 3 um.";
  if (!isStarPointCompleted(hangarEnergyStarPoint.id)) {
    return "Finde heraus, warum die Werkbank keinen Strom bekommt.";
  }
  if (!state.energyCellInstalled) return "Untersucht das Ersatzteilregal an der Werkbank.";
  if (!state.coolingRepaired) return "Repariert die gerissene Kühlleitung am Schiff.";
  if (!state.navigationRestored) return "Bringt das Navigationsmodul wieder zum Laufen.";
  if (!state.shipTested) return "Testet gemeinsam die Schiffssysteme.";
  if (!isStarPointCompleted(hangarGateStarPoint.id)) {
    return "Das Hangartor klemmt. Louis entdeckt dort einen neuen Sternenpunkt.";
  }
  return "Alles bereit. Öffnet den Weg und startet nach Cinder.";
}

export function getChapter1BeatForHotspot(
  hotspotId: "ship" | "workbench" | "hangar-door",
  state = loadChapter1State()
): Chapter1StoryBeat | null {
  const energyReady = isStarPointCompleted(hangarEnergyStarPoint.id);
  const gateReady = isStarPointCompleted(hangarGateStarPoint.id);

  if (hotspotId === "workbench" && energyReady && !state.energyCellInstalled) {
    return chapter1StoryBeats["energy-cell"];
  }

  if (hotspotId === "ship") {
    if (!state.energyCellInstalled) return null;
    if (!state.coolingRepaired) return chapter1StoryBeats.cooling;
    if (!state.navigationRestored) return chapter1StoryBeats.navigation;
    if (!state.shipTested) return chapter1StoryBeats["ship-test"];
  }

  if (hotspotId === "hangar-door" && state.shipTested && gateReady && !state.launched) {
    return chapter1StoryBeats.launch;
  }

  return null;
}

export function getStoryBeat(id: Chapter1StoryBeatId): Chapter1StoryBeat {
  return chapter1StoryBeats[id];
}
