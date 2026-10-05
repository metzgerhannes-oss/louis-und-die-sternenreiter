import {
  adventureWorldOrder,
  adventureWorlds,
  type AdventureWorldId
} from "../../domain/adventure";
import type { TestChapterTarget } from "../../services/testChapterJump";

const base = import.meta.env.BASE_URL;

const worldLauncherArt: Record<AdventureWorldId, string> = {
  moss: "world-moss-overview-v1.webp",
  "junction-12": "world-junction12-overview-v1.webp",
  "empty-path": "world-empty-path-overview-v1.webp",
  distortion: "world-distortion-overview-v1.webp",
  "glass-coast": "world-glass-coast-overview-v1.webp",
  "cloud-ocean": "world-cloud-ocean-overview-v1.webp",
  "scrap-ring": "world-scrap-ring-overview-v1.webp",
  "heart-of-ways": "world-heart-of-ways-overview-v1.webp"
};

function artStyle(file: string): React.CSSProperties {
  return {
    backgroundImage:
      `linear-gradient(180deg, rgba(6,10,15,.18), rgba(6,10,15,.82)), url("${base}assets/scenes/worlds/${file}")`
  };
}

type TestChapterLauncherProps = {
  onSelect: (target: TestChapterTarget) => void;
  onContinue: () => void;
};

export function TestChapterLauncher({
  onSelect,
  onContinue
}: TestChapterLauncherProps) {
  return (
    <section
      className="test-chapter-launcher"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-chapter-title"
    >
      <div className="test-chapter-card">
        <div className="test-chapter-heading">
          <div>
            <p className="eyebrow">Teststart · dauerhaft am Start</p>
            <h1 id="test-chapter-title">Kapitel auswählen</h1>
            <p>
              Springt direkt an den Anfang eines Kapitels. Die nötigen
              Vorbedingungen werden automatisch vorbereitet.
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onContinue}
          >
            Aktuellen Stand fortsetzen
          </button>
        </div>

        <div className="test-chapter-grid">
          <button
            type="button"
            className="test-chapter-art"
            style={artStyle("world-hangar3-overview-v1.webp")}
            onClick={() => onSelect("chapter1")}
          >
            <span>Kapitel 1</span>
            <strong>Hangar 3</strong>
            <small>Spielbeginn · Schiff reparieren</small>
          </button>

          <button
            type="button"
            className="test-chapter-art"
            style={artStyle("world-cinder-overview-v1.webp")}
            onClick={() => onSelect("cinder")}
          >
            <span>Kapitel 2A</span>
            <strong>Cinder</strong>
            <small>Staubhafen · Wasserproblem</small>
          </button>

          {adventureWorldOrder.map((worldId) => {
            const world = adventureWorlds[worldId];
            return (
              <button
                key={worldId}
                type="button"
                className="test-chapter-art"
                style={artStyle(worldLauncherArt[worldId])}
                onClick={() => onSelect(worldId)}
              >
                <span>{world.chapter}</span>
                <strong>{world.title}</strong>
                <small>{world.subtitle}</small>
              </button>
            );
          })}
        </div>

        <p className="test-chapter-note">
          Nur zum Testen: Ein Direktsprung überschreibt den aktuellen
          Spielfortschritt, Profil sowie Audio- und Vorleseeinstellungen bleiben
          erhalten.
        </p>
      </div>
    </section>
  );
}
