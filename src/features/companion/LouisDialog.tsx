import { useEffect, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
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

  return (
    <section
      className="dialog-card louis-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="louis-dialog-title"
      onClick={(event) => event.stopPropagation()}
    >
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
