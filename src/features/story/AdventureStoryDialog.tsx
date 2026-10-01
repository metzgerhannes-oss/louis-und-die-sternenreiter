import { useEffect, useMemo, useState } from "react";
import type { AdventureBeat, AdventureSpeaker } from "../../domain/adventure";
import { adventureSpeakerColor } from "../../domain/adventure";
import type { PlayerProfile } from "../../domain/profiles";
import { gameEventBus } from "../../game/EventBus";
import { addStardust } from "../../services/crewResources";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";

type AdventureStoryDialogProps = {
  beat: AdventureBeat;
  profile: PlayerProfile;
  autoRead: boolean;
  speechRate: number;
  onComplete: () => void;
  onClose: () => void;
};

const coreCrew = ["Philipp", "Charly", "Olli", "Louis"] as const;

export function AdventureStoryDialog({
  beat,
  profile,
  autoRead,
  speechRate,
  onComplete,
  onClose
}: AdventureStoryDialogProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const line = beat.lines[lineIndex];
  const isLast = lineIndex === beat.lines.length - 1;

  const spokenText = useMemo(() => line.text, [line.text]);

  useEffect(() => {
    if (autoRead) {
      browserSpeech.speak(spokenText, { rate: speechRate, speaker: line.speaker });
    }
    return () => browserSpeech.stop();
  }, [autoRead, speechRate, spokenText]);

  const advance = () => {
    browserSpeech.stop();
    if (!isLast) {
      setLineIndex((index) => index + 1);
      return;
    }

    if (beat.rewardStardust) {
      addStardust(beat.rewardStardust);
      gameEventBus.emit("resources:changed", undefined);
    }

    onComplete();
    onClose();
  };

  return (
    <section
      className="dialog-card story-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adventure-story-title"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">{beat.eyebrow}</p>
      <h2 id="adventure-story-title">{beat.title}</h2>

      <div className="story-crew-strip" aria-label="Die ganze Crew ist anwesend">
        {coreCrew.map((speaker) => (
          <span
            key={speaker}
            className={speaker === line.speaker ? "story-crew active" : "story-crew"}
            style={{
              "--speaker-color": adventureSpeakerColor[speaker]
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
          style={{ color: adventureSpeakerColor[line.speaker as AdventureSpeaker] }}
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

      {beat.rewardStardust && isLast && (
        <p className="story-reward">Belohnung: ✦ {beat.rewardStardust} Sternenstaub</p>
      )}

      <div className="dialog-actions">
        <ReadAloudButton text={spokenText} rate={speechRate} speaker={line.speaker} />
        <button type="button" onClick={advance}>
          {isLast ? beat.actionLabel : "Weiter"}
        </button>
      </div>
    </section>
  );
}
