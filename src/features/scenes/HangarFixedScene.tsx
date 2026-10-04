import { crewPortraits } from "../../domain/crewPortraits";
import type { PlayerProfile } from "../../domain/profiles";
import type { Chapter1State } from "../../services/chapter1State";

export type HangarHotspotId =
  | "energy-distributor"
  | "workbench"
  | "ship"
  | "hangar-door"
  | "louis";

export type HangarSceneId =
  | "overview"
  | "energy"
  | "workbench"
  | "ship"
  | "gate"
  | "crew";

type HangarFixedSceneProps = {
  profile: PlayerProfile;
  mission: string;
  stardust: number;
  state: Chapter1State;
  energyReady: boolean;
  gateReady: boolean;
  sceneId: HangarSceneId;
  onNavigate: (sceneId: HangarSceneId) => void;
  onInteract: (id: HangarHotspotId) => void;
  onSwitchProfile: () => void;
};

type HotspotSpec = {
  id: HangarHotspotId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  navigateTo?: HangarSceneId;
};

type SceneSpec = {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  hotspots: readonly HotspotSpec[];
};

const base = import.meta.env.BASE_URL;

const sceneSpecs: Record<HangarSceneId, SceneSpec> = {
  overview: {
    image: `${base}assets/scenes/hangar/hangar-main-v1.webp`,
    eyebrow: "Hangar 3 · Gesamtansicht",
    title: "Ein stiller Hangar voller Spuren",
    description: "Wählt einen Bereich aus, den ihr genauer untersuchen wollt.",
    hotspots: [
      {
        id: "workbench",
        label: "Werkbank",
        x: 4,
        y: 35,
        width: 27,
        height: 28,
        navigateTo: "workbench"
      },
      {
        id: "energy-distributor",
        label: "Energieverteiler",
        x: 20,
        y: 15,
        width: 19,
        height: 42,
        navigateTo: "energy"
      },
      {
        id: "ship",
        label: "Sternenschiff",
        x: 42,
        y: 22,
        width: 40,
        height: 37,
        navigateTo: "ship"
      },
      {
        id: "hangar-door",
        label: "Hangartor",
        x: 72,
        y: 4,
        width: 25,
        height: 45,
        navigateTo: "gate"
      },
      {
        id: "louis",
        label: "Louis & Crew",
        x: 38,
        y: 50,
        width: 35,
        height: 45,
        navigateTo: "crew"
      }
    ]
  },
  energy: {
    image: `${base}assets/scenes/hangar/hangar-energy-v1.webp`,
    eyebrow: "Hangar 3 · Energieversorgung",
    title: "Der alte Energieverteiler",
    description: "Die Leitungen der dunklen Werkbank laufen hier zusammen.",
    hotspots: [
      {
        id: "energy-distributor",
        label: "Energieverteiler untersuchen",
        x: 25,
        y: 21,
        width: 30,
        height: 63
      }
    ]
  },
  workbench: {
    image: `${base}assets/scenes/hangar/hangar-workbench-v1.webp`,
    eyebrow: "Hangar 3 · Werkbank",
    title: "Werkzeuge, Ersatzteile und eine Energiezelle",
    description: "Hier lässt sich einiges finden, sobald wieder Strom fließt.",
    hotspots: [
      {
        id: "workbench",
        label: "Werkbank durchsuchen",
        x: 4,
        y: 37,
        width: 63,
        height: 55
      }
    ]
  },
  ship: {
    image: `${base}assets/scenes/hangar/hangar-ship-v1.webp`,
    eyebrow: "Hangar 3 · Sternenschiff",
    title: "Ein Schiff, das lange geschlafen hat",
    description: "Energie, Kühlung und Navigation müssen nacheinander wieder funktionieren.",
    hotspots: [
      {
        id: "ship",
        label: "Schiff untersuchen",
        x: 23,
        y: 13,
        width: 66,
        height: 72
      }
    ]
  },
  gate: {
    image: `${base}assets/scenes/hangar/hangar-gate-v1.webp`,
    eyebrow: "Hangar 3 · Tor",
    title: "Der Weg nach draußen",
    description: "Hinter dem Tor liegt der erste Kurs nach Cinder.",
    hotspots: [
      {
        id: "hangar-door",
        label: "Hangartor untersuchen",
        x: 55,
        y: 4,
        width: 42,
        height: 68
      }
    ]
  },
  crew: {
    image: `${base}assets/scenes/hangar/hangar-crew-v1.webp`,
    eyebrow: "Hangar 3 · Crew",
    title: "Alle bleiben zusammen",
    description: "Louis beobachtet die Anzeigen und hilft, wenn ihr feststeckt.",
    hotspots: [
      {
        id: "louis",
        label: "Mit Louis sprechen",
        x: 53,
        y: 38,
        width: 34,
        height: 58
      }
    ]
  }
};

function resolveScene(
  sceneId: HangarSceneId,
  state: Chapter1State
): SceneSpec {
  if (sceneId !== "ship") {
    return sceneSpecs[sceneId];
  }

  if (!state.coolingRepaired) {
    return {
      ...sceneSpecs.ship,
      image: `${base}assets/scenes/hangar/hangar-cooling-v1.webp`,
      eyebrow: "Hangar 3 · Wartungsbereich",
      title: "Die gerissene Kühlleitung",
      description: "Bevor das Schiff starten kann, muss die Kühlung wieder dicht sein."
    };
  }

  if (!state.navigationRestored) {
    return {
      ...sceneSpecs.ship,
      image: `${base}assets/scenes/hangar/hangar-navigation-v1.webp`,
      eyebrow: "Hangar 3 · Cockpit",
      title: "Nur ein schwacher Weg",
      description: "Das Navigationsmodul zeigt kaum noch etwas – aber vielleicht reicht ein einziger Kurs."
    };
  }

  if (!state.shipTested) {
    return {
      ...sceneSpecs.ship,
      image: `${base}assets/scenes/hangar/hangar-systemtest-v1.webp`,
      eyebrow: "Hangar 3 · Systemtest",
      title: "Das Schiff wacht auf",
      description: "Energie, Kühlung und Navigation müssen jetzt gemeinsam reagieren."
    };
  }

  return {
    ...sceneSpecs.ship,
    image: `${base}assets/scenes/hangar/hangar-systemtest-v1.webp`,
    eyebrow: "Hangar 3 · Sternenschiff",
    title: "Startklar",
    description: "Alle Schiffssysteme reagieren. Jetzt fehlt nur noch das Hangartor."
  };
}


function isActiveHotspot(
  id: HangarHotspotId,
  state: Chapter1State,
  energyReady: boolean,
  gateReady: boolean
): boolean {
  if (!state.introSeen) return false;
  if (id === "energy-distributor") return !energyReady;
  if (id === "workbench") return energyReady && !state.energyCellInstalled;
  if (id === "ship") return state.energyCellInstalled && !state.shipTested;
  if (id === "hangar-door") return state.shipTested && !gateReady;
  return false;
}

function isCompletedHotspot(
  id: HangarHotspotId,
  state: Chapter1State,
  energyReady: boolean,
  gateReady: boolean
): boolean {
  if (id === "energy-distributor") return energyReady;
  if (id === "workbench") return state.energyCellInstalled;
  if (id === "ship") return state.shipTested;
  if (id === "hangar-door") return gateReady;
  return false;
}

export function HangarFixedScene({
  profile,
  mission,
  stardust,
  state,
  energyReady,
  gateReady,
  sceneId,
  onNavigate,
  onInteract,
  onSwitchProfile
}: HangarFixedSceneProps) {
  const scene = resolveScene(sceneId, state);
  const isOverview = sceneId === "overview";

  return (
    <section className="fixed-scene-shell" aria-label="Hangar 3">
      <header className="fixed-scene-hud">
        <div className="fixed-scene-crew" aria-label="Crew">
          {(["charly", "philipp", "olli", "louis"] as const).map((id) => (
            <span
              key={id}
              className={id === profile.id ? "scene-portrait active" : "scene-portrait"}
            >
              <img src={crewPortraits[id]} alt="" />
            </span>
          ))}
        </div>

        <div className="fixed-scene-build">H3 · SCENES 0.3</div>

        <div className="fixed-scene-status">
          <div className="fixed-scene-stardust" aria-label={stardust + " Sternenstaub"}>
            ✦ {stardust}
          </div>
          <button
            type="button"
            className="fixed-scene-profile-mini"
            onClick={onSwitchProfile}
          >
            Profil
          </button>
        </div>
      </header>

      <div className="fixed-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{mission}</strong>
      </div>

      <div className={"story-scene-frame scene-" + sceneId}>
        <img
          className="story-scene-image"
          src={scene.image}
          alt=""
          draggable={false}
        />

        <div className="story-scene-caption">
          <span>{scene.eyebrow}</span>
          <strong>{scene.title}</strong>
          <small>{scene.description}</small>
        </div>

        {scene.hotspots.map((hotspot) => {
          const active = isActiveHotspot(
            hotspot.id,
            state,
            energyReady,
            gateReady
          );
          const complete = isCompletedHotspot(
            hotspot.id,
            state,
            energyReady,
            gateReady
          );

          return (
            <button
              key={hotspot.id}
              type="button"
              className={[
                "story-scene-hotspot",
                active ? "is-active" : "",
                complete ? "is-complete" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: hotspot.x + "%",
                top: hotspot.y + "%",
                width: hotspot.width + "%",
                height: hotspot.height + "%"
              }}
              aria-label={hotspot.label}
              onClick={() => {
                if (hotspot.navigateTo) {
                  onNavigate(hotspot.navigateTo);
                  return;
                }
                onInteract(hotspot.id);
              }}
            >
              <span className="hotspot-focus-dot" aria-hidden="true" />
              <span className="hotspot-focus-label">{hotspot.label}</span>
            </button>
          );
        })}

        {!isOverview && (
          <button
            type="button"
            className="scene-back-button"
            onClick={() => onNavigate("overview")}
          >
            ← Übersicht
          </button>
        )}

        <div className="scene-help-copy" aria-hidden="true">
          {isOverview
            ? "Tippe auf einen Bereich, um näher heranzugehen."
            : "Tippe auf die markierte Stelle, um weiterzumachen."}
        </div>
      </div>

      <span className="scene-screen-reader-status" aria-live="polite">
        {scene.title}
      </span>
    </section>
  );
}
