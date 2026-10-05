import { useEffect, useState } from "react";
import type { AdventureBeat, AdventureWorldId } from "../../domain/adventure";
import { adventureWorlds } from "../../domain/adventure";
import type { CinderStoryBeat } from "../../domain/chapter2";
import type { PlayerProfile } from "../../domain/profiles";
import {
  cinderDistributionStarPoint,
  cinderMoistureStarPoint,
  type StarPointDefinition
} from "../../domain/starPoints";
import {
  advanceAdventureStep,
  finishMainStory,
  getAdventureStep,
  loadAdventureState,
  travelAdventureWorld
} from "../../services/adventureState";
import { appEventBus } from "../../services/appEventBus";
import {
  applyCinderAction,
  getCinderBeat,
  getCinderBeatForHotspot,
  getCinderObjective,
  loadCinderState
} from "../../services/cinderState";
import { loadCrewResources } from "../../services/crewResources";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { loadSpeechSettings } from "../../services/speech/speechSettings";
import { isStarPointCompleted } from "../../services/starPointState";
import { AdventureWorldScene } from "../scenes/AdventureWorldScene";
import {
  CinderScene,
  type CinderCrewId,
  type CinderHotspotId
} from "../scenes/CinderScene";
import { ReadAloudButton } from "../speech/ReadAloudButton";
import { StarPointFlow } from "../starpoints/StarPointFlow";
import { AdventureStoryDialog } from "./AdventureStoryDialog";
import { CinderStoryDialog } from "./CinderStoryDialog";
import { FinaleSequence } from "./FinaleSequence";

type PostHangarJourneyProps = {
  profile: PlayerProfile;
  onSwitchProfile: () => void;
};

type JourneyDialog =
  | { kind: "cinder-story"; beat: CinderStoryBeat }
  | { kind: "adventure-story"; beat: AdventureBeat; worldId: AdventureWorldId }
  | { kind: "starpoint"; point: StarPointDefinition }
  | { kind: "info"; title: string; text: string }
  | null;

export function PostHangarJourney({
  profile,
  onSwitchProfile
}: PostHangarJourneyProps) {
  const [dialog, setDialog] = useState<JourneyDialog>(null);
  const [revision, setRevision] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const refresh = () => setRevision((value) => value + 1);

  const cinder = loadCinderState();
  const adventure = loadAdventureState();
  const resources = loadCrewResources();
  const speechSettings = loadSpeechSettings(profile.id);
  const moistureReady = isStarPointCompleted(cinderMoistureStarPoint.id);
  const distributionReady = isStarPointCompleted(cinderDistributionStarPoint.id);

  useEffect(() => {
    const offStarPoint = appEventBus.on("starpoint:completed", ({ id }) => {
      const state = loadAdventureState();
      const step = getAdventureStep(state);

      if (state.currentWorld && step.kind === "starpoint" && step.point.id === id) {
        advanceAdventureStep(state.currentWorld);
      }

      refresh();
    });

    const offResources = appEventBus.on("resources:changed", refresh);
    const offCinder = appEventBus.on("chapter2:state-changed", refresh);

    return () => {
      offStarPoint();
      offResources();
      offCinder();
    };
  }, []);

  useEffect(() => {
    if (dialog || cinder.complete || cinder.landingSeen) return;
    setDialog({ kind: "cinder-story", beat: getCinderBeat("landing") });
  }, [cinder.complete, cinder.landingSeen, dialog, revision]);

  const closeDialog = () => {
    browserSpeech.stop();
    setDialog(null);
  };

  const showInfo = (title: string, text: string) => {
    setDialog({ kind: "info", title, text });
  };

  const interactCinderCrew = (id: CinderCrewId) => {
    const state = loadCinderState();

    const textByCrew: Record<CinderCrewId, string> = {
      philipp: state.driveUpgraded
        ? "Die Impulsspule sitzt sauber. Ich will wissen, wie sie sich im nächsten Sternenpfad verhält."
        : state.intakeInspected
          ? "Die Messwerte passen nicht zusammen. Genau da steckt wahrscheinlich die Lösung."
          : "Ich will erst verstehen, wie die alte Technik hier funktioniert, bevor wir irgendetwas umbauen.",
      charly: state.waterCelebrated
        ? "Staubhafen sieht sofort anders aus, nur weil wieder Wasser fließt. Das ist schon ziemlich stark."
        : state.problemKnown
          ? "Rika versucht ruhig zu bleiben, aber die leeren Tanks sagen eigentlich alles."
          : "Die Siedlung dort hinten sieht bewohnt aus. Wir sollten zuerst mit den Leuten sprechen.",
      olli: state.stardustCollected
        ? "Ich hab immer noch roten Staub in den Schuhen. Aber der glitzernde war eindeutig cooler."
        : state.problemKnown
          ? "Wenn Louis wieder leuchtet, sag ich diesmal nichts. Also … fast nichts."
          : "Die Windräder sehen aus, als könnten sie jeden Moment auseinanderfallen.",
      louis: state.stardustCollected
        ? "Der Sternenstaub fühlt sich nicht wie Energie an. Eher wie etwas, das Formen festhält."
        : state.intakeInspected
          ? "Hier ist wieder dieses Ziehen im Harness. Nicht stark, aber eindeutig."
          : "Ich rieche heißen Metallstaub, altes Kühlmittel und Wasser. Sehr wenig Wasser."
    };

    showInfo(
      id === "louis" ? "Louis" : id[0].toUpperCase() + id.slice(1),
      textByCrew[id]
    );
  };

  const interactCinder = (id: CinderHotspotId) => {
    const state = loadCinderState();

    if (id === "condensers") {
      const beat = getCinderBeatForHotspot("condensers", state);
      if (beat) {
        setDialog({ kind: "cinder-story", beat });
        return;
      }
      if (state.intakeInspected && !isStarPointCompleted(cinderMoistureStarPoint.id)) {
        setDialog({ kind: "starpoint", point: cinderMoistureStarPoint });
        return;
      }
      showInfo(
        "Kondensatorfeld",
        isStarPointCompleted(cinderMoistureStarPoint.id)
          ? "In den Sammelrinnen steht jetzt Wasser. Der nächste Engpass liegt auf dem Weg nach Staubhafen."
          : "Die Anlage ist alt, aber noch nicht verstanden."
      );
      return;
    }

    if (id === "stardust") {
      const beat = getCinderBeatForHotspot("stardust", state);
      if (beat) {
        setDialog({ kind: "cinder-story", beat });
        return;
      }
      showInfo("Roter Staub", "Zwischen den Leitungen glitzert nur noch gewöhnlicher Cinder-Staub.");
      return;
    }

    if (id === "workshop") {
      const beat = getCinderBeatForHotspot("workshop", state);
      if (beat) {
        setDialog({ kind: "cinder-story", beat });
        return;
      }
      showInfo(
        "Rikas Werkstatt",
        state.driveUpgraded
          ? "Die Impulsspule sitzt bereits im Schiff."
          : "Überall liegen alte Schiffsteile, Werkzeuge und halbfertige Reparaturen."
      );
      return;
    }

    const beat = getCinderBeatForHotspot("settlement", state);
    if (beat) {
      setDialog({ kind: "cinder-story", beat });
      return;
    }

    if (
      state.stardustCollected &&
      !isStarPointCompleted(cinderDistributionStarPoint.id)
    ) {
      setDialog({ kind: "starpoint", point: cinderDistributionStarPoint });
      return;
    }

    showInfo(
      "Staubhafen",
      distributionReady
        ? "Wasser läuft wieder durch die Siedlung."
        : "Zwischen den Häusern warten leere Tanks auf Wasser."
    );
  };

  const travelToMoss = () => {
    applyCinderAction("cinder-complete");
    appEventBus.emit("chapter2:state-changed", undefined);
    refresh();
  };

  const handleAdventureHotspot = (id: string) => {
    const state = loadAdventureState();
    const step = getAdventureStep(state);
    const world = adventureWorlds[state.currentWorld];

    if (step.kind === "story" && step.hotspotId === id) {
      setDialog({
        kind: "adventure-story",
        beat: step.beat,
        worldId: state.currentWorld
      });
      return;
    }

    const hotspot = world.hotspots.find((item) => item.id === id);
    if (hotspot) {
      showInfo(hotspot.title, hotspot.text);
    }
  };

  const handleAdventurePrimary = () => {
    const state = loadAdventureState();
    const step = getAdventureStep(state);

    if (step.kind === "story") {
      if (step.hotspotId) return;
      setDialog({
        kind: "adventure-story",
        beat: step.beat,
        worldId: state.currentWorld
      });
      return;
    }

    if (step.kind === "starpoint") {
      setDialog({ kind: "starpoint", point: step.point });
      return;
    }

    if (step.ending) {
      setShowFinale(true);
      return;
    }

    if (step.nextWorld) {
      travelAdventureWorld(step.nextWorld);
      refresh();
    }
  };

  if (showFinale) {
    return (
      <FinaleSequence
        autoRead={speechSettings.autoRead}
        speechRate={speechSettings.rate}
        onFinish={() => {
          finishMainStory();
          setShowFinale(false);
          refresh();
        }}
      />
    );
  }

  void revision;

  const journeyContent = !cinder.complete ? (
    <CinderScene
      profile={profile}
      mission={getCinderObjective(cinder)}
      stardust={resources.stardust}
      state={cinder}
      moistureReady={moistureReady}
      distributionReady={distributionReady}
      onInteract={interactCinder}
      onCrewInteract={interactCinderCrew}
      onSwitchProfile={onSwitchProfile}
      onTravelToMoss={travelToMoss}
    />
  ) : (
    <AdventureWorldScene
      world={adventureWorlds[adventure.currentWorld]}
      step={getAdventureStep(adventure)}
      profile={profile}
      stardust={resources.stardust}
      onHotspot={handleAdventureHotspot}
      onPrimaryAction={handleAdventurePrimary}
      onSwitchProfile={onSwitchProfile}
    />
  );

  return (
    <main className="app-shell">
      {journeyContent}

      {dialog && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={dialog.kind === "info" ? closeDialog : undefined}
        >
          {dialog.kind === "cinder-story" ? (
            <CinderStoryDialog
              beat={dialog.beat}
              profile={profile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onStateChange={refresh}
              onClose={closeDialog}
            />
          ) : dialog.kind === "adventure-story" ? (
            <AdventureStoryDialog
              beat={dialog.beat}
              profile={profile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onComplete={() => {
                advanceAdventureStep(dialog.worldId);
                refresh();
              }}
              onClose={closeDialog}
            />
          ) : dialog.kind === "starpoint" ? (
            <StarPointFlow
              point={dialog.point}
              profile={profile}
              autoRead={speechSettings.autoRead}
              speechRate={speechSettings.rate}
              onClose={closeDialog}
            />
          ) : (
            <section
              className="dialog-card scene-info-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="journey-info-title"
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
              <p className="eyebrow">Erkundung</p>
              <h2 id="journey-info-title">{dialog.title}</h2>
              <p>{dialog.text}</p>
              <div className="dialog-actions">
                <ReadAloudButton
                  text={dialog.title + ". " + dialog.text}
                  rate={speechSettings.rate}
                />
                <button type="button" onClick={closeDialog}>
                  Zurück
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
