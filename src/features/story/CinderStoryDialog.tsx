import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import {
  cinderSpeakerColor,
  type CinderAction,
  type CinderStoryBeat
} from "../../domain/chapter2";
import { appEventBus } from "../../services/appEventBus";
import { applyCinderAction, loadCinderState } from "../../services/cinderState";
import { addStardust } from "../../services/crewResources";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";
import { SpeakerFocus } from "./SpeakerFocus";
import {
  CinderActionChallenge,
  hasCinderActionChallenge
} from "./CinderActionChallenge";

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
    appEventBus.emit("resources:changed", undefined);
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
  const [challengeActive, setChallengeActive] = useState(false);
  const line = beat.lines[lineIndex];
  const isLast = lineIndex === beat.lines.length - 1;
  const hasChallenge = Boolean(beat.action) && hasCinderActionChallenge(beat.id);

  const spokenText = useMemo(() => line.text, [line.text]);

  useEffect(() => {
    if (autoRead && !challengeActive) {
      browserSpeech.speak(spokenText, { rate: speechRate, speaker: line.speaker });
    }
    return () => browserSpeech.stop();
  }, [autoRead, challengeActive, line.speaker, speechRate, spokenText]);

  const completeBeat = () => {
    browserSpeech.stop();

    if (beat.action) {
      applyRewards(beat.action);
      applyCinderAction(beat.action);
      appEventBus.emit("chapter2:state-changed", undefined);
      onStateChange();
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
      className="dialog-card story-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cinder-story-title"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">{beat.eyebrow}</p>
      <h2 id="cinder-story-title">
        {challengeActive ? "Jetzt seid ihr dran" : beat.title}
      </h2>

      {!challengeActive ? (
        <>
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

      <div className="story-person-layout">
        <SpeakerFocus
          speaker={line.speaker}
          color={cinderSpeakerColor[line.speaker]}
          subtitle={line.speaker === "Rika" ? "Staubhafen" : "Crew"}
        />
        <div className="story-line">
          <span
            className="story-speaker"
            style={{ color: cinderSpeakerColor[line.speaker] }}
          >
            {line.speaker}
          </span>
          <p>{line.text}</p>
        </div>
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
        <ReadAloudButton text={spokenText} rate={speechRate} speaker={line.speaker} />
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
        <CinderActionChallenge beatId={beat.id} onComplete={completeBeat} />
      )}
    </section>
  );
}
