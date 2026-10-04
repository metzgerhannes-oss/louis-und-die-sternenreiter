import { useEffect, useState } from "react";
import type { Chapter1StoryBeat } from "../domain/chapter1";
import type { PlayerProfile } from "../domain/profiles";
import {
  hangarEnergyStarPoint,
  hangarGateStarPoint,
  type StarPointDefinition
} from "../domain/starPoints";
import { LouisDialog } from "../features/companion/LouisDialog";
import {
  HangarFixedScene,
  type HangarHotspotId,
  type HangarSceneId
} from "../features/scenes/HangarFixedScene";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { ReadAloudButton } from "../features/speech/ReadAloudButton";
import { StarPointFlow } from "../features/starpoints/StarPointFlow";
import { Chapter1StoryDialog } from "../features/story/Chapter1StoryDialog";
import { appEventBus } from "../services/appEventBus";
import {
  getChapter1BeatForHotspot,
  getChapter1Objective,
  getStoryBeat,
  loadChapter1State
} from "../services/chapter1State";
import { loadCrewResources } from "../services/crewResources";
import {
  clearActiveProfile,
  loadActiveProfile,
  saveActiveProfile
} from "../services/profileStorage";
import { browserSpeech } from "../services/speech/browserSpeech";
import { loadSpeechSettings } from "../services/speech/speechSettings";
import { isStarPointCompleted } from "../services/starPointState";
import { PwaStatus } from "./PwaStatus";

type DialogState =
  | { kind: "louis" }
  | { kind: "story"; beat: Chapter1StoryBeat }
  | { kind: "starpoint"; point: StarPointDefinition }
  | { kind: "info"; title: string; text: string }
  | null;

export function App() {
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(() =>
    loadActiveProfile()
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [sceneId, setSceneId] = useState<HangarSceneId>("overview");
  const [revision, setRevision] = useState(0);
  const [launchComplete, setLaunchComplete] = useState(false);

  const refresh = () => setRevision((value) => value + 1);

  useEffect(() => {
    const offStarPoint = appEventBus.on("starpoint:completed", ({ id }) => {
      refresh();

      if (id === hangarEnergyStarPoint.id) {
        setSceneId("workbench");
      }

      if (id === hangarGateStarPoint.id) {
        setSceneId("gate");
      }
    });
    const offResources = appEventBus.on("resources:changed", refresh);

    return () => {
      offStarPoint();
      offResources();
    };
  }, []);

  useEffect(() => {
    if (!activeProfile || dialog || launchComplete) return;

    const chapter = loadChapter1State();
    if (!chapter.introSeen) {
      setDialog({ kind: "story", beat: getStoryBeat("intro") });
    }
  }, [activeProfile, dialog, launchComplete, revision]);

  const selectProfile = (profile: PlayerProfile) => {
    saveActiveProfile(profile);
    setActiveProfile(profile);
    setDialog(null);
    setSceneId("overview");
  };

  const switchProfile = () => {
    browserSpeech.stop();
    clearActiveProfile();
    setActiveProfile(null);
    setDialog(null);
    setSceneId("overview");
  };

  const closeDialog = () => {
    browserSpeech.stop();
    setDialog(null);
  };

  const afterStoryBeat = (beat: Chapter1StoryBeat) => {
    refresh();

    if (beat.id === "energy-cell") {
      setSceneId("ship");
      return;
    }

    if (beat.id === "cooling") {
      setSceneId("navigation");
      return;
    }

    if (beat.id === "navigation") {
      setSceneId("system-test");
      return;
    }

    if (beat.id === "ship-test") {
      setSceneId("gate");
    }
  };

  if (!activeProfile) {
    return (
      <>
        <ProfileSelect onSelect={selectProfile} />
        <PwaStatus />
      </>
    );
  }

  void revision;

  const chapter = loadChapter1State();
  const resources = loadCrewResources();
  const speechSettings = loadSpeechSettings(activeProfile.id);
  const energyReady = isStarPointCompleted(hangarEnergyStarPoint.id);
  const gateReady = isStarPointCompleted(hangarGateStarPoint.id);
  const mission = getChapter1Objective(chapter);

  const showInfo = (title: string, text: string) => {
    setDialog({ kind: "info", title, text });
  };

  const interact = (id: HangarHotspotId) => {
    if (id === "louis") {
      setDialog({ kind: "louis" });
      return;
    }

    if (id === "energy-distributor") {
      if (!energyReady) {
        setDialog({ kind: "starpoint", point: hangarEnergyStarPoint });
        return;
      }

      showInfo(
        "Energieverteiler",
        "Die neue Verbindung hält. Von hier aus fließt wieder Strom zur Werkbank."
      );
      return;
    }

    if (id === "workbench") {
      if (!energyReady) {
        showInfo(
          "Werkbank ohne Strom",
          "Die Werkbank ist noch dunkel. Die Leitungen führen zum alten Energieverteiler links daneben."
        );
        return;
      }

      const beat = getChapter1BeatForHotspot("workbench", chapter);
      if (beat) {
        setDialog({ kind: "story", beat });
        return;
      }

      showInfo(
        "Werkbank",
        chapter.energyCellInstalled
          ? "Die Werkbank läuft wieder. Die brauchbare Energiezelle ist bereits im Schiff."
          : "Zwischen Werkzeugen und Ersatzteilen blinkt eine schwere Energiezelle."
      );
      return;
    }

    if (id === "ship") {
      if (!chapter.energyCellInstalled) {
        showInfo(
          "Das alte Sternenschiff",
          "Ohne Energiezelle bleibt das Schiff vollständig dunkel. Vielleicht gibt es an der Werkbank ein brauchbares Ersatzteil."
        );
        return;
      }

      if (sceneId === "ship" && !chapter.coolingRepaired) {
        setSceneId("cooling");
        return;
      }

      if (sceneId === "cooling" && !chapter.coolingRepaired) {
        setDialog({ kind: "story", beat: getStoryBeat("cooling") });
        return;
      }

      if (sceneId === "navigation" && !chapter.navigationRestored) {
        setDialog({ kind: "story", beat: getStoryBeat("navigation") });
        return;
      }

      if (sceneId === "system-test" && !chapter.shipTested) {
        setDialog({ kind: "story", beat: getStoryBeat("ship-test") });
        return;
      }

      const beat = getChapter1BeatForHotspot("ship", chapter);
      if (beat) {
        setDialog({ kind: "story", beat });
        return;
      }

      showInfo(
        "Das alte Sternenschiff",
        chapter.shipTested
          ? "Energie, Kühlung und Navigation reagieren. Das Schiff wäre startklar – wenn das Hangartor mitspielen würde."
          : "Einige Systeme reagieren bereits. Am Schiff gibt es noch Arbeit."
      );
      return;
    }

    if (!chapter.shipTested) {
      showInfo(
        "Hangartor",
        "Das schwere Tor bewegt sich keinen Millimeter. Erst sollte das Schiff technisch startklar sein."
      );
      return;
    }

    if (!gateReady) {
      setDialog({ kind: "starpoint", point: hangarGateStarPoint });
      return;
    }

    const beat = getChapter1BeatForHotspot("hangar-door", chapter);
    if (beat) {
      setDialog({ kind: "story", beat });
      return;
    }

    showInfo(
      "Offenes Hangartor",
      "Der Weg ist frei. Hinter Hangar 3 liegt das Sternenfeld."
    );
  };

  return (
    <main className="app-shell">
      {launchComplete ? (
        <section className="fixed-launch-complete">
          <img
            className="launch-scene-image"
            src={import.meta.env.BASE_URL + "assets/scenes/hangar/hangar-gate-v1.webp"}
            alt=""
          />
          <div className="launch-starfield" aria-hidden="true" />
          <div className="fixed-launch-card">
            <p className="eyebrow">Kapitel 1 abgeschlossen</p>
            <h1>Der erste Weg</h1>
            <p>
              Das Hangartor ist offen, das Schiff läuft und vor der Crew leuchtet
              ein schwacher Kurs nach Cinder.
            </p>
            <button type="button" onClick={() => setLaunchComplete(false)}>
              Hangar 3 noch einmal ansehen
            </button>
          </div>
        </section>
      ) : (
        <HangarFixedScene
          profile={activeProfile}
          mission={mission}
          stardust={resources.stardust}
          state={chapter}
          energyReady={energyReady}
          gateReady={gateReady}
          sceneId={sceneId}
          onNavigate={setSceneId}
          onInteract={interact}
          onSwitchProfile={switchProfile}
        />
      )}

      <PwaStatus suppressed={Boolean(dialog)} />

      {dialog && !launchComplete && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={
            dialog.kind === "story" || dialog.kind === "starpoint"
              ? undefined
              : closeDialog
          }
        >
          {dialog.kind === "louis" ? (
            <LouisDialog profile={activeProfile} onClose={closeDialog} />
          ) : dialog.kind === "story" ? (
            <Chapter1StoryDialog
              beat={dialog.beat}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onStateChange={() => afterStoryBeat(dialog.beat)}
              onClose={closeDialog}
              onLaunch={() => {
                browserSpeech.stop();
                setDialog(null);
                setLaunchComplete(true);
              }}
            />
          ) : dialog.kind === "starpoint" ? (
            <StarPointFlow
              point={dialog.point}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onClose={closeDialog}
            />
          ) : (
            <section
              className="dialog-card scene-info-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="scene-info-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="dialog-close-button"
                aria-label="Dialog schließen"
                onClick={closeDialog}
              >
                ×
              </button>
              <p className="eyebrow">Hangar 3 · Untersuchung</p>
              <h2 id="scene-info-title">{dialog.title}</h2>
              <p>{dialog.text}</p>
              <div className="dialog-actions">
                <ReadAloudButton
                  text={dialog.title + ". " + dialog.text}
                  rate={speechSettings.rate}
                />
                <button type="button" onClick={closeDialog}>
                  Zurück zur Szene
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
