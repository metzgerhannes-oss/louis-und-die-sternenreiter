import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import {
  cinderSpeakerColor,
  type CinderAction,
  type CinderStoryBeat
} from "../../domain/chapter2";
import { gameEventBus } from "../../game/EventBus";
import { applyCinderAction, loadCinderState } from "../../services/cinderState";
import { addStardust } from "../../services/crewResources";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";

type CinderStoryDialogProps = {
  beat: CinderStoryBeat;
  profile: PlayerProfile;
  autoRead: boolean;
  speechRate: number;
  onStateChange: () => void;
  onClose: () => void;
};

function applyRewards(action: CinderAction | undefined): void {
  if (action === "stardust-collected" && !loadCinderState().stardustCollected) {
    addStardust(2);
    gameEventBus.emit("resources:changed", undefined);
  }
}

export function CinderStoryDialog({
  beat,
  profile,
  autoRead,
  speechRate,
  onStateChange,
  onClose
}: CinderStoryDialogProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const line = beat.lines[lineIndex];
  const isLast = lineIndex === beat.lines.length - 1;

  const spokenText = useMemo(
    () => `${line.speaker}: ${line.text}`,
    [line.speaker, line.text]
  );

  useEffect(() => {
    if (autoRead) {
      browserSpeech.speak(spokenText, { rate: speechRate });
    }
    return () => browserSpeech.stop();
  }, [autoRead, speechRate, spokenText]);

  const advance = () => {
    if (!isLast) {
      setLineIndex((index) => index + 1);
      return;
    }

    if (beat.action) {
      applyRewards(beat.action);
      applyCinderAction(beat.action);
      gameEventBus.emit("chapter2:state-changed", undefined);
      onStateChange();
    }

    onClose();
  };

  return (
    <section
      className="dialog-card story-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cinder-story-title"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">{beat.eyebrow}</p>
      <h2 id="cinder-story-title">{beat.title}</h2>

      <div className="story-crew-strip" aria-label="Die ganze Crew ist anwesend">
        {(["Philipp", "Charly", "Olli", "Louis"] as const).map((speaker) => (
          <span
            key={speaker}
            className={
              speaker === line.speaker ? "story-crew active" : "story-crew"
            }
            style={{
              "--speaker-color": cinderSpeakerColor[speaker]
            } as React.CSSProperties}
          >
            {speaker}
            {speaker.toLowerCase() === profile.id ? " · aktiv" : ""}
          </span>
        ))}
      </div>

      <div className="story-line">
        <span
          className="story-speaker"
          style={{ color: cinderSpeakerColor[line.speaker] }}
        >
          {line.speaker}
        </span>
        <p>{line.text}</p>
      </div>

      <div
        className="story-progress"
        aria-label={`Dialog ${lineIndex + 1} von ${beat.lines.length}`}
      >
        {beat.lines.map((_, index) => (
          <span key={index} className={index <= lineIndex ? "filled" : ""} />
        ))}
      </div>

      <div className="dialog-actions">
        <ReadAloudButton text={spokenText} rate={speechRate} />
        <button type="button" onClick={advance}>
          {isLast ? beat.actionLabel : "Weiter"}
        </button>
      </div>
    </section>
  );
}
