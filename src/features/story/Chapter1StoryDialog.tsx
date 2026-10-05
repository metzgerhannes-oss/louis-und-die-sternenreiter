import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import {
  crewSpeakerColor,
  type Chapter1StoryBeat
} from "../../domain/chapter1";
import { applyChapter1Action } from "../../services/chapter1State";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";
import {
  Chapter1ActionChallenge,
  hasChapter1ActionChallenge
} from "./Chapter1ActionChallenge";

type Chapter1StoryDialogProps = {
  beat: Chapter1StoryBeat;
  profile: PlayerProfile;
  autoRead: boolean;
  speechRate: number;
  onStateChange: () => void;
  onClose: () => void;
  onLaunch?: () => void;
};

export function Chapter1StoryDialog({
  beat,
  profile,
  autoRead,
  speechRate,
  onStateChange,
  onClose,
  onLaunch
}: Chapter1StoryDialogProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [challengeActive, setChallengeActive] = useState(false);
  const line = beat.lines[lineIndex];
  const isLast = lineIndex === beat.lines.length - 1;
  const hasChallenge = Boolean(beat.action) && hasChapter1ActionChallenge(beat.id);

  const spokenText = useMemo(() => line.text, [line.text]);

  useEffect(() => {
    if (autoRead && !challengeActive) {
      browserSpeech.speak(spokenText, {
        rate: speechRate,
        speaker: line.speaker
      });
    }
    return () => browserSpeech.stop();
  }, [autoRead, challengeActive, line.speaker, speechRate, spokenText]);

  const completeBeat = () => {
    browserSpeech.stop();

    if (beat.action) {
      applyChapter1Action(beat.action);
      onStateChange();
    }

    if (beat.action === "launched") {
      onLaunch?.();
      return;
    }

    onClose();
  };

  const finishDialogue = () => {
    browserSpeech.stop();

    if (hasChallenge) {
      setChallengeActive(true);
      return;
    }

    completeBeat();
  };

  const advance = () => {
    browserSpeech.stop();
    if (!isLast) {
      setLineIndex((index) => index + 1);
      return;
    }

    finishDialogue();
  };

  return (
    <section
      className={challengeActive ? "dialog-card story-dialog challenge-dialog" : "dialog-card story-dialog"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-story-title"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">{beat.eyebrow}</p>
      <h2 id="chapter-story-title">
        {challengeActive ? "Jetzt seid ihr dran" : beat.title}
      </h2>

      {!challengeActive ? (
        <>
          <div className="story-crew-strip" aria-label="Die ganze Crew ist anwesend">
            {(["Philipp", "Charly", "Olli", "Louis"] as const).map((speaker) => (
              <span
                key={speaker}
                className={speaker === line.speaker ? "story-crew active" : "story-crew"}
                style={{ "--speaker-color": crewSpeakerColor[speaker] } as React.CSSProperties}
              >
                {speaker}
                {speaker.toLowerCase() === profile.id ? " · aktiv" : ""}
              </span>
            ))}
          </div>

          <div className="story-line">
            <span
              className="story-speaker"
              style={{ color: crewSpeakerColor[line.speaker] }}
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
            <button
              type="button"
              className="secondary-button story-skip-button"
              onClick={finishDialogue}
            >
              Dialog überspringen
            </button>
            <ReadAloudButton
              text={spokenText}
              rate={speechRate}
              speaker={line.speaker}
            />
            <button type="button" onClick={advance}>
              {isLast
                ? hasChallenge
                  ? "An die Arbeit"
                  : beat.actionLabel
                : "Weiter"}
            </button>
          </div>
        </>
      ) : (
        <Chapter1ActionChallenge beatId={beat.id} onComplete={completeBeat} />
      )}
    </section>
  );
}
