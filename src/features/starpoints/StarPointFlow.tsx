import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import type {
  StarPointDefinition,
  StarPointOption
} from "../../domain/starPoints";
import { gameEventBus } from "../../game/EventBus";
import { completeStarPoint } from "../../services/starPointState";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";
import { VoiceInputButton } from "../speech/VoiceInputButton";

type StarPointFlowProps = {
  point: StarPointDefinition;
  profile: PlayerProfile;
  autoRead: boolean;
  speechRate: number;
  onClose: () => void;
};

type Stage = "choose" | "custom" | "review" | "done";

export function StarPointFlow({
  point,
  profile,
  autoRead,
  speechRate,
  onClose
}: StarPointFlowProps) {
  const [stage, setStage] = useState<Stage>("choose");
  const [selectedOption, setSelectedOption] = useState<StarPointOption | null>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [customInputMethod, setCustomInputMethod] = useState<"text" | "voice">("text");

  const ideaText = useMemo(() => {
    if (selectedOption) {
      return `${selectedOption.title}: ${selectedOption.description}`;
    }
    return customIdea.trim();
  }, [customIdea, selectedOption]);

  const spokenText =
    stage === "choose"
      ? point.louisPrompt
      : stage === "custom"
        ? point.customPrompt ?? "Erzähl mir deine Lösung so genau wie möglich."
        : stage === "review"
          ? `Ich habe verstanden: ${ideaText}. Soll ich das so bauen?`
          : point.resultSummary;

  useEffect(() => {
    if (autoRead) {
      browserSpeech.speak(spokenText, { rate: speechRate });
    }
    return () => browserSpeech.stop();
  }, [autoRead, spokenText, speechRate]);

  const choosePrepared = (option: StarPointOption) => {
    setSelectedOption(option);
    setCustomIdea("");
    setStage("review");
  };

  const build = () => {
    if (!ideaText) return;

    completeStarPoint(point, profile, {
      ideaText,
      optionId: selectedOption?.id ?? null,
      inputMethod: selectedOption ? "prepared" : customInputMethod
    });

    gameEventBus.emit("starpoint:completed", {
      id: point.id,
      ideaText
    });

    setStage("done");
  };

  return (
    <section
      className="dialog-card louis-dialog starpoint-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="starpoint-title"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">Louis · Sternenpunkt · Stufe {point.tier}</p>
      <h2 id="starpoint-title">
        {stage === "done" ? "Es funktioniert!" : point.title}
      </h2>

      <div className="starpoint-context">
        <span className="starpoint-symbol" aria-hidden="true">✦</span>
        <div>
          <strong>Sternenpunkt erkannt</strong>
          <p>{point.context}</p>
        </div>
      </div>

      <div className="louis-prompt">
        <p>{spokenText}</p>
        <ReadAloudButton text={spokenText} rate={speechRate} />
      </div>

      {stage === "choose" && (
        <>
          <div className="starpoint-options">
            {point.preparedOptions.map((option) => (
              <button
                type="button"
                className="starpoint-option"
                key={option.id}
                onClick={() => choosePrepared(option)}
              >
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>

          {point.customIdeaAllowed && (
            <button
              type="button"
              className="starpoint-own-idea"
              onClick={() => {
                setSelectedOption(null);
                setStage("custom");
              }}
            >
              ✦ Eigene Idee erzählen
            </button>
          )}
        </>
      )}

      {stage === "custom" && (
        <>
          <label className="creator-field">
            <span>Deine Lösung</span>
            <textarea
              value={customIdea}
              onChange={(event) => {
                setCustomIdea(event.target.value);
                setCustomInputMethod("text");
              }}
              placeholder="Erzähl Louis deine Lösung …"
              rows={4}
              autoFocus
            />
          </label>
          <div className="creator-input-tools">
            <VoiceInputButton
              onVoiceUsed={() => setCustomInputMethod("voice")}
              onTranscript={(text) => {
                setCustomIdea(text);
                setCustomInputMethod("voice");
              }}
            />
            <span className="creator-confirm-note">
              Louis baut erst, wenn du die erkannte Idee bestätigst.
            </span>
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              disabled={!customIdea.trim()}
              onClick={() => setStage("review")}
            >
              Louis zeigen
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setStage("choose")}
            >
              Zurück
            </button>
          </div>
        </>
      )}

      {stage === "review" && (
        <>
          <div className="starpoint-review">
            <span>Louis baut daraus</span>
            <strong>{ideaText}</strong>
            <p>
              Die Formung gilt nur für diesen Sternenpunkt. Bestehende Story und andere Orte bleiben unverändert.
            </p>
          </div>
          <div className="dialog-actions">
            <button type="button" onClick={build}>
              ✦ Ja, bauen
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setStage(selectedOption ? "choose" : "custom")}
            >
              Ändern
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <div className="starpoint-complete">
            <span aria-hidden="true">✦</span>
            <div>
              <strong>{point.resultTitle}</strong>
              <p>{point.resultSummary}</p>
            </div>
          </div>
          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Zurück zur Crew
            </button>
          </div>
        </>
      )}
    </section>
  );
}
