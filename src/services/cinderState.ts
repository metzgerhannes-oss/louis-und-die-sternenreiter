import {
  cinderStoryBeats,
  type CinderAction,
  type CinderStoryBeat,
  type CinderStoryBeatId
} from "../domain/chapter2";
import {
  cinderDistributionStarPoint,
  cinderMoistureStarPoint
} from "../domain/starPoints";
import { isStarPointCompleted } from "./starPointState";

export type CinderState = {
  landingSeen: boolean;
  problemKnown: boolean;
  intakeInspected: boolean;
  stardustCollected: boolean;
  routeSurveyed: boolean;
  waterCelebrated: boolean;
  driveUpgraded: boolean;
  complete: boolean;
};

const STORAGE_KEY = "sternenreiter.chapter2.cinder";

const initialState: CinderState = {
  landingSeen: false,
  problemKnown: false,
  intakeInspected: false,
  stardustCollected: false,
  routeSurveyed: false,
  waterCelebrated: false,
  driveUpgraded: false,
  complete: false
};

export function loadCinderState(): CinderState {
  if (typeof window === "undefined") return initialState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as Partial<CinderState>;
    return {
      landingSeen: Boolean(parsed.landingSeen),
      problemKnown: Boolean(parsed.problemKnown),
      intakeInspected: Boolean(parsed.intakeInspected),
      stardustCollected: Boolean(parsed.stardustCollected),
      routeSurveyed: Boolean(parsed.routeSurveyed),
      waterCelebrated: Boolean(parsed.waterCelebrated),
      driveUpgraded: Boolean(parsed.driveUpgraded),
      complete: Boolean(parsed.complete)
    };
  } catch {
    return initialState;
  }
}

export function applyCinderAction(action: CinderAction): CinderState {
  const next = { ...loadCinderState() };

  switch (action) {
    case "landing-seen":
      next.landingSeen = true;
      break;
    case "problem-known":
      next.problemKnown = true;
      break;
    case "intake-inspected":
      next.intakeInspected = true;
      break;
    case "stardust-collected":
      next.stardustCollected = true;
      break;
    case "route-surveyed":
      next.routeSurveyed = true;
      break;
    case "water-celebrated":
      next.waterCelebrated = true;
      break;
    case "drive-upgraded":
      next.driveUpgraded = true;
      break;
    case "cinder-complete":
      next.driveUpgraded = true;
      next.complete = true;
      break;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getCinderObjective(state = loadCinderState()): string {
  if (state.complete) return "Cinder abgeschlossen · Kurs Moss";
  if (state.driveUpgraded) return "Das Upgrade sitzt. Setzt Kurs auf Moss.";
  if (!state.landingSeen) return "Landet gemeinsam auf Cinder.";
  if (!state.problemKnown) return "Sucht die Siedlung Staubhafen.";
  if (!state.intakeInspected) return "Untersucht mit Rika die alten Kondensatorfelder.";
  if (!isStarPointCompleted(cinderMoistureStarPoint.id)) {
    return "Hilf Louis, wieder Wasser aus Cinders Luft zu gewinnen.";
  }
  if (!state.stardustCollected) return "Untersucht das Leuchten am reparierten Kondensatorfeld.";
  if (!state.routeSurveyed) return "Findet einen sicheren Weg für das Wasser durch den Canyon.";
  if (!isStarPointCompleted(cinderDistributionStarPoint.id)) {
    return "Bringt das gewonnene Wasser bis nach Staubhafen.";
  }
  if (!state.waterCelebrated) return "Kehrt nach Staubhafen zurück.";
  return "Holt Rikas Antriebsupgrade bei der Werkstatt ab.";
}

export function getCinderBeat(id: CinderStoryBeatId): CinderStoryBeat {
  return cinderStoryBeats[id];
}

export function getCinderBeatForHotspot(
  hotspotId: string,
  state = loadCinderState()
): CinderStoryBeat | null {
  if (hotspotId === "settlement") {
    if (!state.problemKnown) return cinderStoryBeats.settlement;
    if (state.stardustCollected && !state.routeSurveyed) {
      return cinderStoryBeats["route-survey"];
    }
    if (
      isStarPointCompleted(cinderDistributionStarPoint.id) &&
      !state.waterCelebrated
    ) {
      return cinderStoryBeats["water-restored"];
    }
  }

  if (hotspotId === "condensers" && state.problemKnown && !state.intakeInspected) {
    return cinderStoryBeats["inspect-intake"];
  }

  if (
    hotspotId === "stardust" &&
    isStarPointCompleted(cinderMoistureStarPoint.id) &&
    !state.stardustCollected
  ) {
    return cinderStoryBeats.stardust;
  }

  if (hotspotId === "workshop" && state.waterCelebrated && !state.driveUpgraded) {
    return cinderStoryBeats["drive-upgrade"];
  }

  return null;
}
