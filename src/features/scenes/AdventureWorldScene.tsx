import { crewPortraits } from "../../domain/crewPortraits";
import type {
  AdventureStep,
  AdventureWorld,
  AdventureWorldId
} from "../../domain/adventure";
import type { PlayerProfile } from "../../domain/profiles";

type AdventureWorldSceneProps = {
  world: AdventureWorld;
  step: AdventureStep;
  profile: PlayerProfile;
  stardust: number;
  onHotspot: (id: string) => void;
  onPrimaryAction: () => void;
  onSwitchProfile: () => void;
};

function hex(value: number): string {
  return "#" + value.toString(16).padStart(6, "0");
}

export function AdventureWorldScene({
  world,
  step,
  profile,
  stardust,
  onHotspot,
  onPrimaryAction,
  onSwitchProfile
}: AdventureWorldSceneProps) {
  return (
    <section
      className={"world-scene adventure-world world-" + world.id}
      aria-label={world.title}
      style={{
        "--world-sky": hex(world.theme.sky),
        "--world-horizon": hex(world.theme.horizon),
        "--world-ground": hex(world.theme.ground),
        "--world-accent": hex(world.theme.accent),
        "--world-glow": hex(world.theme.glow),
        "--world-label": world.theme.labelColor
      } as React.CSSProperties}
    >
      <header className="world-scene-hud">
        <div>
          <p className="eyebrow">{world.chapter}</p>
          <strong>{world.title}</strong>
        </div>
        <div className="world-scene-build">H3 · WORLDS 0.19</div>
        <div className="world-scene-status">
          <span>✦ {stardust}</span>
          <button type="button" onClick={onSwitchProfile}>Profil</button>
        </div>
      </header>

      <div className="world-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{step.objective}</strong>
      </div>

      <div className="adventure-sky" aria-hidden="true">
        <span className="adventure-orb orb-a" />
        <span className="adventure-orb orb-b" />
        <span className="adventure-horizon-line" />
        <span className="adventure-landform landform-a" />
        <span className="adventure-landform landform-b" />
      </div>

      <div className="world-title-card">
        <span>{world.subtitle}</span>
        <strong>{world.title}</strong>
      </div>

      <div className="world-crew-focus" aria-label="Crew">
        {(["charly", "philipp", "olli", "louis"] as const).map((id) => (
          <figure
            key={id}
            className={id === profile.id ? "world-person active" : "world-person"}
          >
            <img src={crewPortraits[id]} alt="" draggable={false} />
            <figcaption>{id === "louis" ? "Louis" : id[0].toUpperCase() + id.slice(1)}</figcaption>
          </figure>
        ))}
      </div>

      <div className="world-hotspots" aria-label={"Orte auf " + world.title}>
        {world.hotspots.map((hotspot) => (
          <button
            key={hotspot.id}
            type="button"
            className="world-hotspot"
            style={{
              left: hotspot.x * 100 + "%",
              top: hotspot.y * 100 + "%"
            }}
            onClick={() => onHotspot(hotspot.id)}
          >
            <span className="world-hotspot-dot" aria-hidden="true" />
            <strong>{hotspot.title}</strong>
            <small>{hotspot.text}</small>
          </button>
        ))}

        {step.kind === "starpoint" && (
          <button
            type="button"
            className="world-starpoint"
            style={{ left: step.x * 100 + "%", top: step.y * 100 + "%" }}
            onClick={onPrimaryAction}
          >
            <span aria-hidden="true">✦</span>
            <strong>Sternenpunkt</strong>
          </button>
        )}
      </div>

      {step.kind !== "starpoint" && !(step.kind === "story" && step.hotspotId) && (
        <button
          type="button"
          className="world-primary-action"
          onClick={onPrimaryAction}
        >
          {step.kind === "travel"
            ? step.ending
              ? "Netz aktivieren"
              : "Weiterreisen"
            : step.beat.actionLabel}
        </button>
      )}
    </section>
  );
}
