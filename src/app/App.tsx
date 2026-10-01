import { useEffect, useState } from "react";
import type { PlayerProfile } from "../domain/profiles";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { TouchControls } from "../features/game/TouchControls";
import { PhaserGame } from "../game/PhaserGame";
import { gameEventBus, type HotspotInteraction } from "../game/EventBus";
import {
  clearActiveProfile,
  loadActiveProfile,
  saveActiveProfile
} from "../services/profileStorage";
import { PwaStatus } from "./PwaStatus";

type DialogState =
  | { kind: "louis" }
  | { kind: "hotspot"; interaction: HotspotInteraction }
  | { kind: "creator-teaser" }
  | null;

export function App() {
  const [scene, setScene] = useState("Boot");
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(() => loadActiveProfile());
  const [dialog, setDialog] = useState<DialogState>(null);

  useEffect(() => {
    const offScene = gameEventBus.on("scene:ready", ({ sceneKey }) => {
      setScene(sceneKey);
    });

    const offLouis = gameEventBus.on("interaction:louis", () => {
      setDialog({ kind: "louis" });
    });

    const offHotspot = gameEventBus.on("interaction:hotspot", (interaction) => {
      setDialog({ kind: "hotspot", interaction });
    });

    return () => {
      offScene();
      offLouis();
      offHotspot();
    };
  }, []);

  const selectProfile = (profile: PlayerProfile) => {
    saveActiveProfile(profile);
    setActiveProfile(profile);
    setDialog(null);
  };

  const switchProfile = () => {
    clearActiveProfile();
    setActiveProfile(null);
    setDialog(null);
  };

  if (!activeProfile) {
    return (
      <>
        <ProfileSelect onSelect={selectProfile} />
        <PwaStatus />
      </>
    );
  }

  const dialogTitle =
    dialog?.kind === "hotspot"
      ? dialog.interaction.title
      : dialog?.kind === "creator-teaser"
        ? "Ideenwerkstatt"
        : "Louis";

  const dialogText =
    dialog?.kind === "hotspot"
      ? dialog.interaction.text
      : dialog?.kind === "creator-teaser"
        ? "Hier kannst du Louis im nächsten Ausbau deine eigenen Planeten, Reisen, Figuren und Missionen erzählen."
        : `Hey ${activeProfile.displayName}! Ich komme mit. Wenn du etwas Spannendes entdeckst, erzähl es mir.`;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">M1 · Hangar 3</p>
          <h1>Louis &amp; die Sternenreiter</h1>
        </div>
        <div className="profile-chip">
          <span
            className="profile-chip-dot"
            style={{ background: activeProfile.accentCss }}
            aria-hidden="true"
          />
          <strong>{activeProfile.displayName}</strong>
          <span className="status-pill">{scene}</span>
        </div>
      </header>

      <section className="game-stage" aria-label="Spielbereich">
        <PhaserGame key={activeProfile.id} profile={activeProfile} />
        <TouchControls />
      </section>

      <footer className="control-bar">
        <button type="button" onClick={() => gameEventBus.emit("ui:louis:ping", undefined)}>
          Louis rufen
        </button>
        <span className="desktop-hint">Bewegen: Pfeile / WASD · Aktion: E</span>
        <button type="button" className="secondary-button" onClick={switchProfile}>
          Profil wechseln
        </button>
      </footer>

      <PwaStatus />

      {dialog && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <section
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">
              {dialog.kind === "hotspot" ? "Hangar 3" : "Louis"}
            </p>
            <h2 id="game-dialog-title">{dialogTitle}</h2>
            <p>{dialogText}</p>
            <div className="dialog-actions">
              {dialog.kind === "louis" && (
                <button type="button" onClick={() => setDialog({ kind: "creator-teaser" })}>
                  Ich habe eine Idee
                </button>
              )}
              <button type="button" className="secondary-button" onClick={() => setDialog(null)}>
                Weiter
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
