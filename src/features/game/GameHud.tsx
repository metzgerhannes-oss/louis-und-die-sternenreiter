import { playerProfiles, type PlayerProfile } from "../../domain/profiles";
import { gameEventBus } from "../../game/EventBus";

type GameHudProps = {
  activeProfile: PlayerProfile;
  mission: string;
  location: string;
  stardust: number;
  level?: number;
};

function CrewPortrait({
  name,
  id,
  active,
  accent
}: {
  name: string;
  id: "philipp" | "charly" | "olli" | "louis";
  active: boolean;
  accent: string;
}) {
  return (
    <div
      className={active ? "hud-crew-card active" : "hud-crew-card"}
      style={{ "--crew-accent": accent } as React.CSSProperties}
      aria-label={active ? `${name}, aktive Figur` : name}
    >
      <div className={`hud-portrait hud-portrait-${id}`} aria-hidden="true">
        {id === "louis" ? (
          <>
            <span className="hud-dog-ear left" />
            <span className="hud-dog-ear right" />
            <span className="hud-dog-face">●</span>
          </>
        ) : (
          <>
            <span className="hud-hair" />
            <span className="hud-face">{name.slice(0, 1)}</span>
          </>
        )}
      </div>
      <span className="hud-crew-name">{name}</span>
      <span className="hud-crew-meter" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}

export function GameHud({
  activeProfile,
  mission,
  location,
  stardust,
  level = 3
}: GameHudProps) {
  const crew = [
    ...playerProfiles.map((profile) => ({
      id: profile.id,
      name: profile.displayName,
      accent: profile.accentCss,
      active: profile.id === activeProfile.id
    })),
    {
      id: "louis" as const,
      name: "Louis",
      accent: "#d2a35f",
      active: false
    }
  ];

  return (
    <div className="game-hud" aria-label="Spiel-HUD">
      <div className="hud-crew">
        {crew.map((member) => (
          <CrewPortrait
            key={member.id}
            id={member.id}
            name={member.name}
            accent={member.accent}
            active={member.active}
          />
        ))}
      </div>

      <section className="hud-mission" aria-label="Aktuelle Mission">
        <div className="hud-mission-star" aria-hidden="true">✦</div>
        <div>
          <span>Mission</span>
          <strong>{mission}</strong>
        </div>
      </section>

      <div className="hud-resources">
        <div className="hud-resource-card">
          <span className="hud-resource-icon">✦</span>
          <div>
            <small>Sternenstaub</small>
            <strong>{stardust.toLocaleString("de-DE")}</strong>
          </div>
        </div>
        <div className="hud-level-card">
          <span className="hud-level-icon">✧</span>
          <div>
            <small>Stufe {level}</small>
            <span className="hud-level-progress"><i /></span>
          </div>
        </div>
      </div>

      <section className="hud-location" aria-label="Aktueller Ort">
        <div className="hud-radar" aria-hidden="true">
          <span className="radar-ring ring-a" />
          <span className="radar-ring ring-b" />
          <span className="radar-sweep" />
          <span className="radar-player">▲</span>
          <span className="radar-target">◆</span>
        </div>
        <div className="hud-location-copy">
          <span>Aktueller Ort</span>
          <strong>{location}</strong>
          <small>● Missionsziel &nbsp; ✦ Sternenpunkt</small>
        </div>
      </section>

      <div className="hud-actions" aria-label="Spielaktionen">
        <button
          type="button"
          className="hud-action"
          onClick={() => gameEventBus.emit("input:interact", undefined)}
        >
          <span aria-hidden="true">☝</span>
          <strong>Interagieren</strong>
          <small>E</small>
        </button>
        <button
          type="button"
          className="hud-action"
          onClick={() => gameEventBus.emit("ui:scanner:pulse", undefined)}
        >
          <span aria-hidden="true">◎</span>
          <strong>Scanner</strong>
          <small>Q</small>
        </button>
        <button
          type="button"
          className="hud-action louis"
          onClick={() => gameEventBus.emit("ui:louis:ping", undefined)}
        >
          <span aria-hidden="true">●</span>
          <strong>Louis</strong>
          <small>L</small>
        </button>
      </div>
    </div>
  );
}
