import { useEffect, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import {
  loadAudioSettings,
  saveAudioSettings,
  type AudioSettings
} from "../../services/audio/audioSettings";
import { gameAudio } from "../../services/audio/gameAudio";
import { browserSpeech } from "../../services/speech/browserSpeech";
import {
  loadSpeechSettings,
  saveSpeechSettings,
  type SpeechSettings
} from "../../services/speech/speechSettings";
import { CreatorFlow } from "../creator/CreatorFlow";
import { ReadAloudButton } from "../speech/ReadAloudButton";

type LouisDialogProps = {
  profile: PlayerProfile;
  onClose: () => void;
};

export function LouisDialog({ profile, onClose }: LouisDialogProps) {
  const [mode, setMode] = useState<"home" | "creator">("home");
  const [settings, setSettings] = useState<SpeechSettings>(() =>
    loadSpeechSettings(profile.id)
  );
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() =>
    loadAudioSettings()
  );

  const greeting = `Hey ${profile.displayName}! Wenn dir auf unserer Reise etwas fehlt oder du eine Idee hast, erzähl sie mir. Mein Harness reagiert manchmal darauf.`;

  useEffect(() => {
    if (mode === "home" && settings.autoRead) {
      browserSpeech.speak(greeting, { rate: settings.rate, speaker: "Louis" });
    }

    return () => browserSpeech.stop();
  }, [greeting, mode, settings.autoRead, settings.rate]);

  const updateSettings = (next: SpeechSettings) => {
    setSettings(next);
    saveSpeechSettings(profile.id, next);
  };

  const updateAudioSettings = (next: AudioSettings) => {
    setAudioSettings(next);
    saveAudioSettings(next);
    gameAudio.configure(next);
    if (next.enabled) {
      void gameAudio.unlock();
    }
  };

  return (
    <section
      className="dialog-card louis-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="louis-dialog-title"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="dialog-close-button"
        aria-label="Louis-Einstellungen schließen"
        onClick={onClose}
      >
        ×
      </button>

      {mode === "creator" ? (
        <CreatorFlow
          profile={profile}
          autoRead={settings.autoRead}
          speechRate={settings.rate}
          onBack={() => setMode("home")}
          onClose={onClose}
        />
      ) : (
        <>
          <p className="eyebrow">Louis · dein Begleiter</p>
          <h2 id="louis-dialog-title">Was gibt’s?</h2>
          <div className="louis-prompt">
            <p>{greeting}</p>
            <ReadAloudButton text={greeting} rate={settings.rate} speaker="Louis" />
          </div>

          <div className="speech-settings" aria-label="Vorlese-Einstellungen">
            <label>
              <input
                type="checkbox"
                checked={settings.autoRead}
                onChange={(event) =>
                  updateSettings({ ...settings, autoRead: event.target.checked })
                }
              />
              Dialoge automatisch vorlesen
            </label>

            <label>
              Lesetempo
              <select
                value={settings.rate}
                onChange={(event) =>
                  updateSettings({ ...settings, rate: Number(event.target.value) })
                }
              >
                <option value={0.8}>Ruhig</option>
                <option value={0.95}>Normal</option>
                <option value={1.1}>Schnell</option>
              </select>
            </label>
          </div>

          <div className="audio-settings" aria-label="Sound-Einstellungen">
            <label className="audio-toggle">
              <input
                type="checkbox"
                checked={audioSettings.enabled}
                onChange={(event) =>
                  updateAudioSettings({
                    ...audioSettings,
                    enabled: event.target.checked
                  })
                }
              />
              Soundkulisse &amp; Effekte
            </label>

            <label className="audio-volume">
              Gesamtlautstärke
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audioSettings.masterVolume}
                disabled={!audioSettings.enabled}
                onChange={(event) =>
                  updateAudioSettings({
                    ...audioSettings,
                    masterVolume: Number(event.target.value)
                  })
                }
              />
            </label>

            <button
              type="button"
              className="voice-preview-button"
              onClick={() =>
                browserSpeech.speak(
                  "Bereit. Wir finden einen Weg. Und wenn es noch keinen gibt, bauen wir einen.",
                  { rate: settings.rate, speaker: "Louis" }
                )
              }
            >
              Louis-Stimme testen
            </button>
          </div>

          <div className="voice-preview-grid" aria-label="Crew-Stimmen testen">
            <button
              type="button"
              onClick={() =>
                browserSpeech.speak(
                  "Bereit. Wir finden einen Weg. Und wenn es noch keinen gibt, bauen wir einen.",
                  { rate: settings.rate, speaker: "Louis" }
                )
              }
            >
              Louis
            </button>
            <button
              type="button"
              onClick={() =>
                browserSpeech.speak(
                  "Ich prüfe zuerst, wo der sichere Weg entlangführt.",
                  { rate: settings.rate, speaker: "Philipp" }
                )
              }
            >
              Philipp
            </button>
            <button
              type="button"
              onClick={() =>
                browserSpeech.speak(
                  "Wir schauen uns alles genau an und entscheiden dann gemeinsam.",
                  { rate: settings.rate, speaker: "Charly" }
                )
              }
            >
              Charly
            </button>
            <button
              type="button"
              onClick={() =>
                browserSpeech.speak(
                  "Ich hab da schon eine Idee. Komm, wir probieren es aus!",
                  { rate: settings.rate, speaker: "Olli" }
                )
              }
            >
              Olli
            </button>
          </div>

          <p className="voice-note">
            Die vier Crew-Stimmen werden auf diesem Gerät möglichst auf
            unterschiedliche deutsche Systemstimmen verteilt. Falls das Gerät
            nur eine deutsche Stimme bereitstellt, unterscheiden sie sich
            zusätzlich deutlich in Tempo und Tonlage.
          </p>

          <div className="dialog-actions">
            <button type="button" onClick={() => setMode("creator")}>
              Ich habe eine große Idee
            </button>
            <button type="button" className="secondary-button" onClick={onClose}>
              Weiterreisen
            </button>
          </div>
        </>
      )}
    </section>
  );
}
