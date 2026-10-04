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
  | "cooling"
  | "navigation"
  | "system-test"
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
    image: `${base}assets/scenes/hangar/hangar-main-active-v4.webp`,
    eyebrow: "Hangar 3 · Gesamtansicht",
    title: "Ein stiller Hangar voller Spuren",
    description: "Wählt einen Bereich aus, den ihr genauer untersuchen wollt.",
    hotspots: [
      { id: "workbench", label: "Werkbank", x: 2, y: 31, width: 20, height: 37 },
      {
        id: "energy-distributor",
        label: "Energieverteiler",
        x: 23,
        y: 18,
        width: 14,
        height: 48
      },
      { id: "ship", label: "Sternenschiff", x: 42, y: 27, width: 33, height: 36 },
      { id: "hangar-door", label: "Hangartor", x: 78, y: 10, width: 20, height: 56 },
      { id: "louis", label: "Louis", x: 60, y: 66, width: 12, height: 28 }
    ]
  },
  energy: {
    image: `${base}assets/scenes/hangar/hangar-energy-v4.webp`,
    eyebrow: "Hangar 3 · Energieversorgung",
    title: "Der alte Energieverteiler",
    description: "Die Leitungen der dunklen Werkbank laufen hier zusammen.",
    hotspots: [
      {
        id: "energy-distributor",
        label: "Energieverteiler untersuchen",
        x: 24,
        y: 24,
        width: 23,
        height: 55
      }
    ]
  },
  workbench: {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    eyebrow: "Hangar 3 · Werkbank",
    title: "Werkzeuge, Ersatzteile und eine Energiezelle",
    description: "Hier lässt sich einiges finden, sobald wieder Strom fließt.",
    hotspots: [
      {
        id: "workbench",
        label: "Werkbank durchsuchen",
        x: 30,
        y: 30,
        width: 35,
        height: 40
      }
    ]
  },
  ship: {
    image: `${base}assets/scenes/hangar/hangar-ship-v4.webp`,
    eyebrow: "Hangar 3 · Sternenschiff",
    title: "Das alte Sternenschiff",
    description: "Ohne Energie reagiert hier fast nichts.",
    hotspots: [
      {
        id: "ship",
        label: "Schiff untersuchen",
        x: 35,
        y: 25,
        width: 42,
        height: 43
      }
    ]
  },
  cooling: {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    eyebrow: "Hangar 3 · Wartungsbereich",
    title: "Die gerissene Kühlleitung",
    description: "Jetzt zeigt sich, warum der Antrieb noch nicht sicher laufen kann.",
    hotspots: [
      {
        id: "ship",
        label: "Kühlleitung reparieren",
        x: 43,
        y: 25,
        width: 30,
        height: 50
      }
    ]
  },
  navigation: {
    image: `${base}assets/scenes/hangar/hangar-navigation-v4.webp`,
    eyebrow: "Hangar 3 · Cockpit",
    title: "Nur ein schwacher Weg",
    description: "Das Navigationsmodul zeigt kaum noch etwas. Eine Route könnte reichen.",
    hotspots: [
      {
        id: "ship",
        label: "Navigation reaktivieren",
        x: 34,
        y: 50,
        width: 32,
        height: 36
      }
    ]
  },
  "system-test": {
    image: `${base}assets/scenes/hangar/hangar-systemtest-v4.webp`,
    eyebrow: "Hangar 3 · Systemtest",
    title: "Das Schiff wacht auf",
    description: "Energie, Kühlung und Navigation müssen gemeinsam reagieren.",
    hotspots: [
      {
        id: "ship",
        label: "Systemtest starten",
        x: 45,
        y: 30,
        width: 30,
        height: 34
      }
    ]
  },
  gate: {
    image: `${base}assets/scenes/hangar/hangar-gate-closed-v4.webp`,
    eyebrow: "Hangar 3 · Hangartor",
    title: "Der Weg nach draußen",
    description: "Das Tor bleibt geschlossen, bis der letzte Engpass gelöst ist.",
    hotspots: [
      {
        id: "hangar-door",
        label: "Hangartor untersuchen",
        x: 25,
        y: 8,
        width: 50,
        height: 75
      }
    ]
  },
  crew: {
    image: `${base}assets/scenes/hangar/hangar-crew-v4.webp`,
    eyebrow: "Hangar 3 · Crew",
    title: "Alle bleiben zusammen",
    description: "Louis beobachtet die Anzeigen und hilft, wenn ihr feststeckt.",
    hotspots: [
      {
        id: "louis",
        label: "Mit Louis sprechen",
        x: 64,
        y: 48,
        width: 18,
        height: 42
      }
    ]
  }
};

export function getSceneImageName(
  sceneId: HangarSceneId,
  state: Chapter1State,
  energyReady: boolean,
  gateReady: boolean
): string {
  if (sceneId === "overview") {
    if (gateReady) return "hangar-main-open-v7.webp";
    if (!energyReady) return "hangar-main-blackout-v4.webp";
    if (!state.energyCellInstalled) return "hangar-main-powered-v4.webp";
    return "hangar-main-active-v4.webp";
  }

  if (sceneId === "energy") return "hangar-energy-v4.webp";
  if (sceneId === "workbench") {
    return energyReady ? "hangar-workbench-v4.webp" : "hangar-workbench-dark-v4.webp";
  }
  if (sceneId === "ship") {
    return state.energyCellInstalled ? "hangar-ship-v4.webp" : "hangar-ship-dark-v4.webp";
  }
  if (sceneId === "cooling") return "hangar-cooling-v4.webp";
  if (sceneId === "navigation") return "hangar-navigation-v4.webp";
  if (sceneId === "system-test") return "hangar-systemtest-v4.webp";
  if (sceneId === "gate") {
    return gateReady ? "hangar-gate-open-v7.webp" : "hangar-gate-closed-v4.webp";
  }
  return "hangar-crew-v4.webp";
}

export function getRelevantShipScene(state: Chapter1State): HangarSceneId {
  if (!state.energyCellInstalled) return "ship";
  if (!state.coolingRepaired) return "cooling";
  if (!state.navigationRestored) return "navigation";
  if (!state.shipTested) return "system-test";
  return "ship";
}

export function getOverviewTarget(
  id: HangarHotspotId,
  state: Chapter1State
): HangarSceneId {
  if (id === "energy-distributor") return "energy";
  if (id === "workbench") return "workbench";
  if (id === "ship") return getRelevantShipScene(state);
  if (id === "hangar-door") return "gate";
  return "crew";
}

function resolveScene(
  sceneId: HangarSceneId,
  state: Chapter1State,
  energyReady: boolean,
  gateReady: boolean
): SceneSpec {
  const nativeScene: SceneSpec = {
    ...sceneSpecs[sceneId],
    image: `${base}assets/scenes/hangar/${getSceneImageName(
      sceneId,
      state,
      energyReady,
      gateReady
    )}`
  };

  if (sceneId === "overview") {
    return {
      ...nativeScene,
      title: energyReady
        ? state.shipTested
          ? "Das Schiff ist bereit. Das Tor hält euch noch auf."
          : "Hangar 3 bekommt langsam wieder Leben"
        : "Fast dunkel. Nur Louis' Harness reagiert.",
      description: energyReady
        ? state.energyCellInstalled
          ? "Werkbank und erste Schiffssysteme sind aktiv. Das Hangartor bleibt geschlossen."
          : "Die Werkbank hat wieder Strom. Das Schiff bleibt noch still."
        : "Werkbank, Schiff und Tor sind stromlos. Nur der defekte Verteiler fällt auf."
    };
  }

  if (sceneId === "energy") {
    return {
      ...nativeScene,
      title: energyReady ? "Die Verbindung hält" : "Der Energieverteiler ist ausgefallen",
      description: energyReady
        ? "Von hier fließt wieder Strom zur Werkbank."
        : "Keine Anzeige reagiert. Zwischen Verteiler und Werkbank fehlt eine funktionierende Verbindung."
    };
  }

  if (sceneId === "workbench") {
    return {
      ...nativeScene,
      title: energyReady
        ? state.energyCellInstalled
          ? "Die Energiezelle ist bereits im Schiff"
          : "Werkzeuge, Ersatzteile und eine Energiezelle"
        : "Die Werkbank ist vollständig dunkel",
      description: energyReady
        ? state.energyCellInstalled
          ? "Die Werkbank läuft. Der nächste Schritt wartet am Schiff."
          : "Jetzt ist genug Strom da, um das Ersatzteilregal zu durchsuchen."
        : "Ohne Strom lässt sich hier nichts prüfen. Erst muss der Verteiler wieder funktionieren."
    };
  }

  if (sceneId === "ship") {
    return {
      ...nativeScene,
      title: state.energyCellInstalled
        ? "Die Energiezelle weckt das Schiff"
        : "Das Schiff ist noch vollständig dunkel",
      description: state.energyCellInstalled
        ? "Einige Anzeigen reagieren zum ersten Mal. Jetzt muss die Crew die Technik Schritt für Schritt prüfen."
        : "Ohne Energiezelle reagieren weder Cockpit noch Wartungssysteme."
    };
  }

  if (sceneId === "gate") {
    return {
      ...nativeScene,
      title: gateReady
        ? "Das Hangartor ist offen"
        : state.shipTested
          ? "Das Schiff ist bereit – aber das Tor bleibt zu"
          : "Das schwere Hangartor ist verriegelt",
      description: gateReady
        ? "Der Weg zum Sternenfeld ist frei."
        : state.shipTested
          ? "Der alte Torantrieb schafft die verklemmten Segmente nicht allein."
          : "Solange das Schiff nicht startklar ist, bleibt das Tor geschlossen."
    };
  }

  return nativeScene;
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
  const scene = resolveScene(sceneId, state, energyReady, gateReady);
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

        <div className="fixed-scene-build">H3 · SCENES 0.13</div>

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

      <div
        className={["story-scene-frame", "scene-" + sceneId].join(" ")}
      >
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

        {scene.hotspots
          .filter((hotspot) => !gateReady || !isOverview || hotspot.id === "hangar-door")
          .map((hotspot) => {
          const active = isActiveHotspot(hotspot.id, state, energyReady, gateReady);
          const complete = isCompletedHotspot(hotspot.id, state, energyReady, gateReady);

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
                if (isOverview) {
                  onNavigate(getOverviewTarget(hotspot.id, state));
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
