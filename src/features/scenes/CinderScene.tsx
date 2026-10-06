import type { PlayerProfile } from "../../domain/profiles";
import type { CinderState } from "../../services/cinderState";

export type CinderHotspotId =
  | "settlement"
  | "condensers"
  | "stardust"
  | "workshop";

export type CinderCrewId = "charly" | "philipp" | "olli" | "louis";

type CinderSceneProps = {
  profile: PlayerProfile;
  mission: string;
  stardust: number;
  state: CinderState;
  moistureReady: boolean;
  distributionReady: boolean;
  onInteract: (id: CinderHotspotId) => void;
  onCrewInteract: (id: CinderCrewId) => void;
  onSwitchProfile: () => void;
  onTravelToMoss: () => void;
};

const hotspots: Array<{
  id: CinderHotspotId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
}> = [
  {
    id: "settlement",
    title: "Staubhafen",
    subtitle: "Siedlung · Rika",
    x: 73,
    y: 34
  },
  {
    id: "condensers",
    title: "Kondensatorfeld",
    subtitle: "alte Wassertechnik",
    x: 19,
    y: 29
  },
  {
    id: "stardust",
    title: "Leuchten im Staub",
    subtitle: "etwas reagiert auf Louis",
    x: 48,
    y: 58
  },
  {
    id: "workshop",
    title: "Rikas Werkstatt",
    subtitle: "Ersatzteile · Impulsspule",
    x: 81,
    y: 62
  }
];

const base = import.meta.env.BASE_URL;

const crewTouchpoints: Array<{
  id: CinderCrewId;
  label: string;
  x: number;
}> = [
  { id: "philipp", label: "Philipp", x: 34 },
  { id: "charly", label: "Charly", x: 49 },
  { id: "olli", label: "Olli", x: 65 },
  { id: "louis", label: "Louis", x: 80 }
];

export function CinderScene({
  profile,
  mission,
  stardust,
  state,
  moistureReady,
  distributionReady,
  onInteract,
  onCrewInteract,
  onSwitchProfile,
  onTravelToMoss
}: CinderSceneProps) {
  return (
    <section className="world-scene cinder-scene has-native-world-art" aria-label="Cinder">
      <img
        className="world-native-background"
        src={`${base}assets/scenes/worlds/world-cinder-overview-v1.webp`}
        alt=""
        draggable={false}
      />

      <header className="world-scene-hud">
        <div>
          <p className="eyebrow">Kapitel 2 · Cinder</p>
          <strong>Staubhafen</strong>
        </div>
        <div className="world-scene-build">H3 · ART 0.24</div>
        <div className="world-scene-status">
          <span>✦ {stardust}</span>
          <button type="button" onClick={onSwitchProfile}>Profil</button>
        </div>
      </header>

      <div className="world-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{mission}</strong>
      </div>

      <div className="native-crew-hotspots" aria-label="Crew auf Cinder">
        {crewTouchpoints.map((crew) => (
          <button
            type="button"
            key={crew.id}
            className={crew.id === profile.id ? "native-crew-hotspot active" : "native-crew-hotspot"}
            style={{ left: crew.x + "%" }}
            onClick={() => onCrewInteract(crew.id)}
            aria-label={crew.label + " ansprechen"}
          >
            <span>{crew.label}</span>
          </button>
        ))}
      </div>

      {state.landingSeen && (
        <button
          type="button"
          className="world-npc-focus rika-focus"
          aria-label="Mit Rika sprechen"
          onClick={() => onInteract("settlement")}
        >
          <span className="npc-portrait-placeholder">R</span>
          <span className="world-npc-copy">
            <strong>Rika</strong>
            <small>Staubhafen</small>
          </span>
        </button>
      )}

      <div className="world-hotspots" aria-label="Orte auf Cinder">
        {hotspots.map((hotspot) => {
          const visible =
            hotspot.id === "settlement" ||
            (hotspot.id === "condensers" && state.problemKnown) ||
            (hotspot.id === "stardust" && moistureReady) ||
            (hotspot.id === "workshop" && state.waterCelebrated);

          if (!visible) return null;

          const complete =
            (hotspot.id === "settlement" && state.problemKnown && state.waterCelebrated) ||
            (hotspot.id === "condensers" && state.intakeInspected && moistureReady) ||
            (hotspot.id === "stardust" && state.stardustCollected) ||
            (hotspot.id === "workshop" && state.driveUpgraded);

          return (
            <button
              key={hotspot.id}
              type="button"
              className={complete ? "world-hotspot complete" : "world-hotspot"}
              style={{ left: hotspot.x + "%", top: hotspot.y + "%" }}
              onClick={() => onInteract(hotspot.id)}
            >
              <span className="world-hotspot-dot" aria-hidden="true" />
              <strong>{hotspot.title}</strong>
              <small>{hotspot.subtitle}</small>
            </button>
          );
        })}
      </div>

      <div className="cinder-water-status" aria-live="polite">
        <span className={moistureReady ? "lit" : ""}>Kondensatoren</span>
        <span className={distributionReady ? "lit" : ""}>Wasserleitung</span>
      </div>

      {state.driveUpgraded && !state.complete && (
        <button type="button" className="world-primary-action" onClick={onTravelToMoss}>
          Kurs Moss setzen
        </button>
      )}
    </section>
  );
}
