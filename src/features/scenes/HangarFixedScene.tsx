import { crewPortraits } from "../../domain/crewPortraits";
import type { PlayerProfile } from "../../domain/profiles";
import type { Chapter1State } from "../../services/chapter1State";

export type HangarHotspotId =
  | "energy-distributor"
  | "workbench"
  | "ship"
  | "hangar-door"
  | "louis";

type HangarFixedSceneProps = {
  profile: PlayerProfile;
  mission: string;
  stardust: number;
  state: Chapter1State;
  energyReady: boolean;
  gateReady: boolean;
  onInteract: (id: HangarHotspotId) => void;
  onSwitchProfile: () => void;
};

type HotspotProps = {
  id: HangarHotspotId;
  label: string;
  className: string;
  active?: boolean;
  completed?: boolean;
  onInteract: (id: HangarHotspotId) => void;
};

function SceneHotspot({
  id,
  label,
  className,
  active = false,
  completed = false,
  onInteract
}: HotspotProps) {
  return (
    <button
      type="button"
      className={[
        "scene-hotspot",
        className,
        active ? "is-active" : "",
        completed ? "is-complete" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      onClick={() => onInteract(id)}
    >
      <span className="scene-hotspot-ring" aria-hidden="true" />
      <span className="scene-hotspot-label">{label}</span>
    </button>
  );
}

export function HangarFixedScene({
  profile,
  mission,
  stardust,
  state,
  energyReady,
  gateReady,
  onInteract,
  onSwitchProfile
}: HangarFixedSceneProps) {
  const shipAwake = state.energyCellInstalled;
  const shipReady =
    state.energyCellInstalled &&
    state.coolingRepaired &&
    state.navigationRestored &&
    state.shipTested;

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

        <div className="fixed-scene-build">H3 · FIXED 0.1</div>

        <div className="fixed-scene-stardust" aria-label={stardust + " Sternenstaub"}>
          ✦ {stardust}
        </div>
      </header>

      <div className="fixed-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{mission}</strong>
      </div>

      <div
        className={[
          "hangar-scene",
          energyReady ? "hangar-powered" : "",
          shipAwake ? "ship-awake" : "",
          shipReady ? "ship-ready" : "",
          gateReady ? "gate-ready" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="hangar-ceiling" aria-hidden="true" />
        <div className="hangar-door-visual" aria-hidden="true">
          <div className="hangar-door-stars" />
          <div className="hangar-door-panel left" />
          <div className="hangar-door-panel right" />
        </div>

        <div className="hangar-workbench" aria-hidden="true">
          <div className="workbench-top" />
          <div className="workbench-screen">
            <span>{energyReady ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <div className="workbench-shelf">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="hangar-distributor" aria-hidden="true">
          <span className="distributor-core" />
          <span className="distributor-cable" />
        </div>

        <div className="hangar-ship" aria-hidden="true">
          <div className="ship-wing left" />
          <div className="ship-wing right" />
          <div className="ship-hull">
            <div className="ship-cockpit" />
            <div className="ship-status">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="ship-engine left" />
          <div className="ship-engine right" />
        </div>

        <div className="hangar-crew-visual" aria-hidden="true">
          {(["charly", "philipp", "olli"] as const).map((id) => (
            <div className={"crew-figure " + id} key={id}>
              <img src={crewPortraits[id]} alt="" />
              <span />
            </div>
          ))}
          <div className="crew-figure louis">
            <img src={crewPortraits.louis} alt="" />
            <span />
          </div>
        </div>

        <SceneHotspot
          id="energy-distributor"
          label={energyReady ? "Energieverteiler" : "Leuchtender Sternenpunkt"}
          className="hotspot-distributor"
          active={state.introSeen && !energyReady}
          completed={energyReady}
          onInteract={onInteract}
        />
        <SceneHotspot
          id="workbench"
          label="Werkbank"
          className="hotspot-workbench"
          active={energyReady && !state.energyCellInstalled}
          completed={state.energyCellInstalled}
          onInteract={onInteract}
        />
        <SceneHotspot
          id="ship"
          label="Altes Sternenschiff"
          className="hotspot-ship"
          active={state.energyCellInstalled && !state.shipTested}
          completed={state.shipTested}
          onInteract={onInteract}
        />
        <SceneHotspot
          id="hangar-door"
          label="Hangartor"
          className="hotspot-door"
          active={state.shipTested && !state.launched}
          completed={gateReady}
          onInteract={onInteract}
        />
        <SceneHotspot
          id="louis"
          label="Mit Louis sprechen"
          className="hotspot-louis"
          onInteract={onInteract}
        />

        <div className="scene-hint" aria-hidden="true">
          Tippe auf leuchtende Stellen und Gegenstände.
        </div>
      </div>

      <button
        type="button"
        className="fixed-scene-profile-button"
        onClick={onSwitchProfile}
      >
        Profil wechseln
      </button>
    </section>
  );
}
