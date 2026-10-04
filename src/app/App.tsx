import { useEffect, useState } from "react";
import {
  adventureWorlds,
  type AdventureBeat,
  type AdventureWorldId
} from "../domain/adventure";
import type { Chapter1StoryBeat } from "../domain/chapter1";
import type { CinderStoryBeat } from "../domain/chapter2";
import type { PlayerProfile } from "../domain/profiles";
import {
  hangarGateStarPoint,
  type StarPointDefinition
} from "../domain/starPoints";
import { SoundDirector } from "../features/audio/SoundDirector";
import { LouisDialog } from "../features/companion/LouisDialog";
import { GameHud } from "../features/game/GameHud";
import { TouchControls } from "../features/game/TouchControls";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { ReadAloudButton } from "../features/speech/ReadAloudButton";
import { StarPointFlow } from "../features/starpoints/StarPointFlow";
import { AdventureStoryDialog } from "../features/story/AdventureStoryDialog";
import { Chapter1StoryDialog } from "../features/story/Chapter1StoryDialog";
import { CinderStoryDialog } from "../features/story/CinderStoryDialog";
import { FinaleSequence } from "../features/story/FinaleSequence";
import { LaunchSequence } from "../features/story/LaunchSequence";
import { PhaserGame } from "../game/PhaserGame";
import { gameEventBus, type HotspotInteraction } from "../game/EventBus";
import {
  advanceAdventureStep,
  finishMainStory,
  getAdventureLocationLabel,
  getAdventureObjective,
  getAdventureStep,
  loadAdventureState,
  travelAdventureWorld,
  visitAdventureWorld
} from "../services/adventureState";
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
  | { kind: "adventure-story"; beat: AdventureBeat; worldId: AdventureWorldId }
  | null;

type HangarHotspotId = "ship" | "workbench" | "hangar-door";
type FreeTravelTarget = "hangar" | "cinder" | AdventureWorldId;

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
  const [finale, setFinale] = useState(false);
  const [freeTravelTarget, setFreeTravelTarget] =
    useState<FreeTravelTarget>("hangar");

  const refreshStory = () => {
    setStoryRevision((revision) => revision + 1);
  };

  const refreshChapter1 = () => {
    refreshStory();
    gameEventBus.emit("chapter1:state-changed", undefined);
  };

  const refreshAdventure = () => {
    refreshStory();
    gameEventBus.emit("adventure:state-changed", undefined);
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
      if (interaction.area === "adventure" && interaction.worldId) {
        const adventure = loadAdventureState();
        const step = getAdventureStep(adventure, interaction.worldId);

        if (
          !adventure.mainStoryFinished &&
          interaction.worldId === adventure.currentWorld &&
          step.kind === "story" &&
          step.hotspotId === interaction.id
        ) {
          setDialog({
            kind: "adventure-story",
            beat: step.beat,
            worldId: interaction.worldId
          });
          return;
        }

        setDialog({ kind: "hotspot", interaction });
        return;
      }

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

    const offStarPointCompleted = gameEventBus.on(
      "starpoint:completed",
      ({ id }) => {
        if (scene === "AdventureScene") {
          const adventure = loadAdventureState();
          const step = getAdventureStep(adventure);

          if (step.kind === "starpoint" && step.point.id === id) {
            advanceAdventureStep(adventure.currentWorld);
            gameEventBus.emit("adventure:state-changed", undefined);
          }
        }

        refreshStory();
      }
    );

    const offChapter2 = gameEventBus.on("chapter2:state-changed", () => {
      refreshStory();
    });

    const offAdventure = gameEventBus.on("adventure:state-changed", () => {
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
      offAdventure();
      offResources();
    };
  }, [scene]);

  useEffect(() => {
    if (!activeProfile || dialog || launching || finale) return;

    if (scene === "AdventureScene") {
      const adventure = loadAdventureState();
      if (adventure.mainStoryFinished) return;

      const step = getAdventureStep(adventure);
      if (step.kind === "story" && !step.hotspotId) {
        setDialog({
          kind: "adventure-story",
          beat: step.beat,
          worldId: adventure.currentWorld
        });
      }
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
  }, [activeProfile, dialog, finale, launching, scene, storyRevision]);

  useEffect(() => {
    if (!activeProfile || dialog?.kind !== "hotspot") return;

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
    setFinale(false);
  };

  const switchProfile = () => {
    browserSpeech.stop();
    clearActiveProfile();
    setActiveProfile(null);
    setDialog(null);
    setLaunching(false);
    setFinale(false);
  };

  const closeDialog = () => {
    browserSpeech.stop();
    setDialog(null);
  };

  const continueAdventure = (nextWorld: AdventureWorldId) => {
    travelAdventureWorld(nextWorld);
    refreshStory();
    gameEventBus.emit("world:goto", { worldId: nextWorld });
  };

  const startMoss = () => {
    visitAdventureWorld("moss");
    refreshStory();
    gameEventBus.emit("world:goto", { worldId: "moss" });
  };

  const freeTravel = () => {
    if (freeTravelTarget === "hangar") {
      gameEventBus.emit("scene:goto", { sceneKey: "HangarScene" });
      return;
    }

    if (freeTravelTarget === "cinder") {
      gameEventBus.emit("scene:goto", { sceneKey: "CinderScene" });
      return;
    }

    visitAdventureWorld(freeTravelTarget);
    refreshStory();
    gameEventBus.emit("world:goto", { worldId: freeTravelTarget });
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
  const adventureState = loadAdventureState();
  const resources = loadCrewResources();
  const onCinder = scene === "CinderScene";
  const onAdventure = scene === "AdventureScene";
  const adventureStep = getAdventureStep(adventureState);

  const objective = adventureState.mainStoryFinished
    ? "Hüter der Wege · Freie Reisen sind freigeschaltet."
    : onAdventure
      ? getAdventureObjective(adventureState)
      : onCinder
        ? getCinderObjective(cinderState)
        : cinderState.complete
          ? "Der Hangar bleibt eure Basis. Der nächste Weg führt nach Moss."
          : getChapter1Objective(loadChapter1State());

  const locationLabel = onAdventure
    ? getAdventureLocationLabel(adventureState)
    : onCinder
      ? "Kapitel 2 · Cinder"
      : adventureState.mainStoryFinished
        ? "Freie Reisen · Hangar 3"
        : cinderState.complete
          ? "Hangar 3 · Heimatbasis"
          : "Kapitel 1 · Hangar 3";

  return (
    <main className="app-shell">

      <section className="game-stage" aria-label="Spielbereich">
        {finale ? (
          <FinaleSequence
            autoRead={speechSettings.autoRead}
            speechRate={speechSettings.rate}
            onFinish={() => {
              finishMainStory();
              setFinale(false);
              refreshStory();
              gameEventBus.emit("scene:goto", { sceneKey: "HangarScene" });
            }}
          />
        ) : launching ? (
          <LaunchSequence
            onReturn={() => {
              setLaunching(false);
              gameEventBus.emit("scene:goto", { sceneKey: "CinderScene" });
            }}
          />
        ) : (
          <>
            <PhaserGame key={activeProfile.id} profile={activeProfile} />
            <GameHud
              activeProfile={activeProfile}
              mission={objective}
              location={locationLabel}
              stardust={resources.stardust}
              onSwitchProfile={switchProfile}
            />
            <TouchControls />
          </>
        )}
      </section>

      <footer className="control-bar">
        {!launching && !finale && (
          <>
            {onCinder &&
              cinderState.complete &&
              !adventureState.mainStoryFinished && (
                <button
                  type="button"
                  className="journey-button"
                  onClick={startMoss}
                >
                  Weiter nach Moss
                </button>
              )}

            {onAdventure &&
              !adventureState.mainStoryFinished &&
              adventureStep.kind === "travel" &&
              adventureStep.nextWorld && (
                <button
                  type="button"
                  className="journey-button"
                  onClick={() => continueAdventure(adventureStep.nextWorld!)}
                >
                  Weiter nach {adventureWorlds[adventureStep.nextWorld].title}
                </button>
              )}

            {onAdventure &&
              !adventureState.mainStoryFinished &&
              adventureStep.kind === "travel" &&
              adventureStep.ending && (
                <button
                  type="button"
                  className="journey-button finale-button"
                  onClick={() => setFinale(true)}
                >
                  Herz der Wege aktivieren
                </button>
              )}

            {!onAdventure &&
              !onCinder &&
              cinderState.complete &&
              !adventureState.mainStoryFinished && (
                <button
                  type="button"
                  className="journey-button"
                  onClick={() =>
                    gameEventBus.emit("world:goto", {
                      worldId: adventureState.currentWorld
                    })
                  }
                >
                  Reise fortsetzen
                </button>
              )}

            {adventureState.freeTravelUnlocked && (
              <div className="free-travel-controls">
                <label>
                  Freie Reisen
                  <select
                    value={freeTravelTarget}
                    onChange={(event) =>
                      setFreeTravelTarget(event.target.value as FreeTravelTarget)
                    }
                  >
                    <option value="hangar">Hangar 3</option>
                    <option value="cinder">Cinder</option>
                    {Object.values(adventureWorlds).map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={freeTravel}>
                  Reisen
                </button>
              </div>
            )}

            <button
              type="button"
              className="secondary-button profile-switch-footer"
              onClick={switchProfile}
            >
              Aktive Figur wechseln
            </button>
          </>
        )}

        {launching && (
          <span>Philipp · Charly · Olli · Louis · Kurs Cinder</span>
        )}
        {finale && (
          <span>Philipp · Charly · Olli · Louis · Das Herz der Wege</span>
        )}
      </footer>

      <SoundDirector
        scene={scene}
        worldId={adventureState.currentWorld}
        dialogOpen={Boolean(dialog)}
        launching={launching}
        finale={finale}
      />

      <PwaStatus suppressed={Boolean(dialog) || launching || finale} />

      {dialog && !launching && !finale && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={
            dialog.kind === "chapter1-story" ||
            dialog.kind === "cinder-story" ||
            dialog.kind === "adventure-story"
              ? undefined
              : closeDialog
          }
        >
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
          ) : dialog.kind === "adventure-story" ? (
            <AdventureStoryDialog
              beat={dialog.beat}
              profile={activeProfile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onComplete={() => {
                advanceAdventureStep(dialog.worldId);
                refreshAdventure();
              }}
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
                  : dialog.interaction.area === "adventure"
                    ? `${dialog.interaction.worldId
                        ? adventureWorlds[dialog.interaction.worldId].title
                        : "Sternenpfad"} · ganze Crew`
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
