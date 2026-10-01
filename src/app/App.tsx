import { useEffect, useState } from "react";
import type { Chapter1StoryBeat } from "../domain/chapter1";
import type { CinderStoryBeat } from "../domain/chapter2";
import type { PlayerProfile } from "../domain/profiles";
import {
  hangarGateStarPoint,
  type StarPointDefinition
} from "../domain/starPoints";
import { LouisDialog } from "../features/companion/LouisDialog";
import { TouchControls } from "../features/game/TouchControls";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { ReadAloudButton } from "../features/speech/ReadAloudButton";
import { StarPointFlow } from "../features/starpoints/StarPointFlow";
import { Chapter1StoryDialog } from "../features/story/Chapter1StoryDialog";
import { CinderStoryDialog } from "../features/story/CinderStoryDialog";
import { LaunchSequence } from "../features/story/LaunchSequence";
import { PhaserGame } from "../game/PhaserGame";
import { gameEventBus, type HotspotInteraction } from "../game/EventBus";
import {
  getChapter1BeatForHotspot,
  getChapter1Objective,
  getStoryBeat,
  loadChapter1State
} from "../services/chapter1State";
import {
  getCinderBeat,
  getCinderBeatForHotspot,
  getCinderObjective,
  loadCinderState
} from "../services/cinderState";
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
  | { kind: "hotspot"; interaction: HotspotInteraction }
  | { kind: "starpoint"; point: StarPointDefinition }
  | { kind: "chapter1-story"; beat: Chapter1StoryBeat }
  | { kind: "cinder-story"; beat: CinderStoryBeat }
  | null;

type HangarHotspotId = "ship" | "workbench" | "hangar-door";

function isHangarHotspotId(id: string): id is HangarHotspotId {
  return id === "ship" || id === "workbench" || id === "hangar-door";
}

export function App() {
  const [scene, setScene] = useState("Boot");
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(() =>
    loadActiveProfile()
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [storyRevision, setStoryRevision] = useState(0);
  const [resourceRevision, setResourceRevision] = useState(0);
  const [launching, setLaunching] = useState(false);

  const refreshStory = () => {
    setStoryRevision((revision) => revision + 1);
  };

  const refreshChapter1 = () => {
    refreshStory();
    gameEventBus.emit("chapter1:state-changed", undefined);
  };

  useEffect(() => {
    const offScene = gameEventBus.on("scene:ready", ({ sceneKey }) => {
      setScene(sceneKey);
      setDialog(null);
    });

    const offLouis = gameEventBus.on("interaction:louis", () => {
      setDialog({ kind: "louis" });
    });

    const offHotspot = gameEventBus.on("interaction:hotspot", (interaction) => {
      if (interaction.area === "cinder") {
        const beat = getCinderBeatForHotspot(interaction.id, loadCinderState());
        if (beat) {
          setDialog({ kind: "cinder-story", beat });
          return;
        }

        setDialog({ kind: "hotspot", interaction });
        return;
      }

      if (!isHangarHotspotId(interaction.id)) {
        setDialog({ kind: "hotspot", interaction });
        return;
      }

      const chapterState = loadChapter1State();

      if (
        interaction.id === "hangar-door" &&
        chapterState.shipTested &&
        !isStarPointCompleted(hangarGateStarPoint.id)
      ) {
        setDialog({ kind: "starpoint", point: hangarGateStarPoint });
        return;
      }

      const beat = getChapter1BeatForHotspot(interaction.id, chapterState);
      if (beat) {
        setDialog({ kind: "chapter1-story", beat });
        return;
      }

      setDialog({ kind: "hotspot", interaction });
    });

    const offStarPoint = gameEventBus.on("interaction:starpoint", (point) => {
      setDialog({ kind: "starpoint", point });
    });

    const offStarPointCompleted = gameEventBus.on("starpoint:completed", () => {
      refreshStory();
    });

    const offChapter2 = gameEventBus.on("chapter2:state-changed", () => {
      refreshStory();
    });

    const offResources = gameEventBus.on("resources:changed", () => {
      setResourceRevision((revision) => revision + 1);
    });

    return () => {
      offScene();
      offLouis();
      offHotspot();
      offStarPoint();
      offStarPointCompleted();
      offChapter2();
      offResources();
    };
  }, []);

  useEffect(() => {
    if (!activeProfile || dialog || launching) {
      return;
    }

    if (scene === "CinderScene") {
      const cinder = loadCinderState();
      if (!cinder.landingSeen) {
        setDialog({ kind: "cinder-story", beat: getCinderBeat("landing") });
      }
      return;
    }

    if (scene === "HangarScene") {
      const chapter1 = loadChapter1State();
      if (!chapter1.introSeen) {
        setDialog({ kind: "chapter1-story", beat: getStoryBeat("intro") });
      }
    }
  }, [activeProfile, dialog, launching, scene, storyRevision]);

  useEffect(() => {
    if (!activeProfile || dialog?.kind !== "hotspot") {
      return;
    }

    const settings = loadSpeechSettings(activeProfile.id);
    if (settings.autoRead) {
      browserSpeech.speak(
        `${dialog.interaction.title}. ${dialog.interaction.text}`,
        { rate: settings.rate }
      );
    }

    return () => browserSpeech.stop();
  }, [activeProfile, dialog]);

  const selectProfile = (profile: PlayerProfile) => {
    saveActiveProfile(profile);
    setActiveProfile(profile);
    setDialog(null);
    setLaunching(false);
  };

  const switchProfile = () => {
    browserSpeech.stop();
    clearActiveProfile();
    setActiveProfile(null);
    setDialog(null);
    setLaunching(false);
  };

  const closeDialog = () => {
    browserSpeech.stop();
    setDialog(null);
  };

  if (!activeProfile) {
    return (
      <>
        <ProfileSelect onSelect={selectProfile} />
        <PwaStatus />
      </>
    );
  }

  void resourceRevision;

  const speechSettings = loadSpeechSettings(activeProfile.id);
  const cinderState = loadCinderState();
  const resources = loadCrewResources();
  const onCinder = scene === "CinderScene";
  const objective = onCinder
    ? getCinderObjective(cinderState)
    : cinderState.complete
      ? "Cinder versorgt · Neuer Sternenpfad entdeckt: Moss"
      : getChapter1Objective(loadChapter1State());

  const locationLabel = onCinder
    ? "Kapitel 2 · Cinder"
    : cinderState.complete
      ? "Hangar 3 · Zwischenstopp"
      : "Kapitel 1 · Hangar 3";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{locationLabel}</p>
          <h1>Louis &amp; die Sternenreiter</h1>
        </div>
        <div className="profile-chip">
          <span
            className="profile-chip-dot"
            style={{ background: activeProfile.accentCss }}
            aria-hidden="true"
          />
          <strong>Aktiv: {activeProfile.displayName}</strong>
          <span className="status-pill">Crew 4/4</span>
          {(onCinder || resources.stardust > 0) && (
            <span className="status-pill stardust-pill">
              ✦ {resources.stardust}
            </span>
          )}
        </div>
      </header>

      <section className="game-stage" aria-label="Spielbereich">
        {launching ? (
          <LaunchSequence onReturn={() => setLaunching(false)} />
        ) : (
          <>
            <PhaserGame key={activeProfile.id} profile={activeProfile} />
            <div className="chapter-objective">
              <span>Aktuelles Ziel</span>
              <strong>{objective}</strong>
            </div>
            <TouchControls />
          </>
        )}
      </section>

      <footer className="control-bar">
        {!launching && (
          <>
            <button
              type="button"
              onClick={() => gameEventBus.emit("ui:louis:ping", undefined)}
            >
              Louis rufen
            </button>
            <span className="desktop-hint">{objective}</span>

            {onCinder && cinderState.complete && (
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  gameEventBus.emit("scene:goto", { sceneKey: "HangarScene" })
                }
              >
                Zurück zu Hangar 3
              </button>
            )}

            {!onCinder && cinderState.complete && (
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  gameEventBus.emit("scene:goto", { sceneKey: "CinderScene" })
                }
              >
                Cinder besuchen
              </button>
            )}

            <button type="button" className="secondary-button" onClick={switchProfile}>
              Aktive Figur wechseln
            </button>
          </>
        )}

        {launching && <span>Philipp · Charly · Olli · Louis · Kurs Cinder</span>}
      </footer>

      <PwaStatus />

      {dialog && !launching && (
        <div className="dialog-backdrop" role="presentation" onClick={closeDialog}>
          {dialog.kind === "louis" ? (
            <LouisDialog profile={activeProfile} onClose={closeDialog} />
          ) : dialog.kind === "starpoint" ? (
            <StarPointFlow
              point={dialog.point}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onClose={closeDialog}
            />
          ) : dialog.kind === "chapter1-story" ? (
            <Chapter1StoryDialog
              beat={dialog.beat}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onStateChange={refreshChapter1}
              onClose={closeDialog}
              onLaunch={() => {
                browserSpeech.stop();
                setDialog(null);
                setLaunching(true);
              }}
            />
          ) : dialog.kind === "cinder-story" ? (
            <CinderStoryDialog
              beat={dialog.beat}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onStateChange={refreshStory}
              onClose={closeDialog}
            />
          ) : (
            <section
              className="dialog-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="eyebrow">
                {dialog.interaction.area === "cinder"
                  ? "Cinder · ganze Crew"
                  : "Hangar 3 · ganze Crew"}
              </p>
              <h2 id="game-dialog-title">{dialog.interaction.title}</h2>
              <p>{dialog.interaction.text}</p>
              <div className="dialog-actions">
                <ReadAloudButton
                  text={`${dialog.interaction.title}. ${dialog.interaction.text}`}
                  rate={speechSettings.rate}
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeDialog}
                >
                  Weiter
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
