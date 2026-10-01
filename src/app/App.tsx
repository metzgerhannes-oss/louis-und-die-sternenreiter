import { useEffect, useState } from "react";
import type { PlayerProfile } from "../domain/profiles";
import { LouisDialog } from "../features/companion/LouisDialog";
import { TouchControls } from "../features/game/TouchControls";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { ReadAloudButton } from "../features/speech/ReadAloudButton";
import { PhaserGame } from "../game/PhaserGame";
import { gameEventBus, type HotspotInteraction } from "../game/EventBus";
import {
  clearActiveProfile,
  loadActiveProfile,
  saveActiveProfile
} from "../services/profileStorage";
import { browserSpeech } from "../services/speech/browserSpeech";
import { loadSpeechSettings } from "../services/speech/speechSettings";
import { PwaStatus } from "./PwaStatus";

type DialogState =
  | { kind: "louis" }
  | { kind: "hotspot"; interaction: HotspotInteraction }
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

  useEffect(() => {
    if (!activeProfile || dialog?.kind !== "hotspot") {
      return;
    }

    const settings = loadSpeechSettings(activeProfile.id);
    if (settings.autoRead) {
      browserSpeech.speak(
        `${dialog.interaction.title}. ${dialog.interaction.text}`,
        { rate: settings.rate }
      );
    }

    return () => browserSpeech.stop();
  }, [activeProfile, dialog]);

  const selectProfile = (profile: PlayerProfile) => {
    saveActiveProfile(profile);
    setActiveProfile(profile);
    setDialog(null);
  };

  const switchProfile = () => {
    browserSpeech.stop();
    clearActiveProfile();
    setActiveProfile(null);
    setDialog(null);
  };

  const closeDialog = () => {
    browserSpeech.stop();
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
        <div className="dialog-backdrop" role="presentation" onClick={closeDialog}>
          {dialog.kind === "louis" ? (
            <LouisDialog profile={activeProfile} onClose={closeDialog} />
          ) : (
            <section
              className="dialog-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="eyebrow">Hangar 3</p>
              <h2 id="game-dialog-title">{dialog.interaction.title}</h2>
              <p>{dialog.interaction.text}</p>
              <div className="dialog-actions">
                <ReadAloudButton
                  text={`${dialog.interaction.title}. ${dialog.interaction.text}`}
                  rate={loadSpeechSettings(activeProfile.id).rate}
                />
                <button type="button" className="secondary-button" onClick={closeDialog}>
                  Weiter
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
