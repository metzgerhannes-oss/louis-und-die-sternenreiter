import type { VoiceRole } from "../../services/speech/characterVoices";
import { browserSpeech } from "../../services/speech/browserSpeech";

type ReadAloudButtonProps = {
  text: string;
  rate?: number;
  speaker?: VoiceRole | string;
};

export function ReadAloudButton({
  text,
  rate = 0.95,
  speaker = "Narrator"
}: ReadAloudButtonProps) {
  if (!browserSpeech.isSupported()) return null;

  return (
    <button
      type="button"
      className="speech-button"
      onClick={() => browserSpeech.speak(text, { rate, speaker })}
      aria-label="Text vorlesen"
    >
      🔊 Vorlesen
    </button>
  );
}
