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

const base = import.meta.env.BASE_URL;

const worldArt: Record<AdventureWorldId, string> = {
  moss: "world-moss-overview-v1.webp",
  "junction-12": "world-junction12-overview-v1.webp",
  "empty-path": "world-empty-path-overview-v1.webp",
  distortion: "world-distortion-overview-v1.webp",
  "glass-coast": "world-glass-coast-overview-v1.webp",
  "cloud-ocean": "world-cloud-ocean-overview-v1.webp",
  "scrap-ring": "world-scrap-ring-overview-v1.webp",
  "heart-of-ways": "world-heart-of-ways-overview-v1.webp"
};

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
      className={"world-scene adventure-world has-native-world-art world-" + world.id}
      aria-label={world.title}
      data-active-profile={profile.id}
      style={{
        "--world-sky": hex(world.theme.sky),
        "--world-horizon": hex(world.theme.horizon),
        "--world-ground": hex(world.theme.ground),
        "--world-accent": hex(world.theme.accent),
        "--world-glow": hex(world.theme.glow),
        "--world-label": world.theme.labelColor
      } as React.CSSProperties}
    >
      <img
        className="world-native-background"
        src={`${base}assets/scenes/worlds/${worldArt[world.id]}`}
        alt=""
        draggable={false}
      />

      <header className="world-scene-hud">
        <div>
          <p className="eyebrow">{world.chapter}</p>
          <strong>{world.title}</strong>
        </div>
        <div className="world-scene-build">H3 · ART 0.23</div>
        <div className="world-scene-status">
          <span>✦ {stardust}</span>
          <button type="button" onClick={onSwitchProfile}>Profil</button>
        </div>
      </header>

      <div className="world-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{step.objective}</strong>
      </div>

      <div className="world-title-card">
        <span>{world.subtitle}</span>
        <strong>{world.title}</strong>
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
