import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "../../domain/profiles";
import { saveIdea, type IdeaInputMethod, type IdeaSaveResult } from "../../services/ideaRepository";
import { browserSpeech } from "../../services/speech/browserSpeech";
import { ReadAloudButton } from "../speech/ReadAloudButton";
import { VoiceInputButton } from "../speech/VoiceInputButton";
import {
  buildStructuredIdea,
  creatorQuestions,
  type CreatorAnswers
} from "./creatorModel";

type CreatorFlowProps = {
  profile: PlayerProfile;
  autoRead: boolean;
  speechRate: number;
  onBack: () => void;
  onClose: () => void;
};

type Stage = "idea" | "questions" | "review" | "saving" | "saved";

export function CreatorFlow({
  profile,
  autoRead,
  speechRate,
  onBack,
  onClose
}: CreatorFlowProps) {
  const [stage, setStage] = useState<Stage>("idea");
  const [originalText, setOriginalText] = useState("");
  const [answers, setAnswers] = useState<CreatorAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [inputMethod, setInputMethod] = useState<IdeaInputMethod>("text");
  const [saveResult, setSaveResult] = useState<IdeaSaveResult | null>(null);
  const [saveError, setSaveError] = useState("");

  const currentQuestion = creatorQuestions[questionIndex];
  const structuredIdea = useMemo(
    () => buildStructuredIdea(originalText, answers),
    [originalText, answers]
  );

  const prompt =
    stage === "idea"
      ? "Erzähl mir deine Idee. Je genauer du sie beschreibst, desto besser können die Sternenbauer sie später verstehen."
      : stage === "questions"
        ? currentQuestion.prompt
        : stage === "review"
          ? "Das habe ich verstanden. Schau bitte noch einmal nach, ob alles stimmt."
          : stage === "saved"
            ? "Alles klar. Ich habe unsere Idee notiert."
            : "Einen Moment, ich notiere alles.";

  useEffect(() => {
    if (autoRead) {
      browserSpeech.speak(prompt, { rate: speechRate, speaker: "Louis" });
    }

    return () => browserSpeech.stop();
  }, [autoRead, prompt, speechRate]);

  const continueFromIdea = () => {
    if (!originalText.trim()) {
      return;
    }
    setStage("questions");
  };

  const continueQuestion = () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.key]: currentAnswer.trim()
    };
    setAnswers(nextAnswers);
    setCurrentAnswer("");

    if (questionIndex >= creatorQuestions.length - 1) {
      setStage("review");
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const persist = async () => {
    setSaveError("");
    setStage("saving");

    try {
      const result = await saveIdea(profile, {
        originalText: originalText.trim(),
        answers,
        structuredIdea,
        inputMethod
      });
      setSaveResult(result);
      setStage("saved");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Die Idee konnte nicht gespeichert werden.");
      setStage("review");
    }
  };

  if (stage === "saved") {
    return (
      <div className="creator-flow">
        <p className="eyebrow">Louis · Idee notiert</p>
        <h2>Das gehört jetzt zu unseren Entwürfen.</h2>
        <p>
          {saveResult?.storage === "supabase"
            ? "Die Idee liegt jetzt in unserem Ideenbuch. Die Sternenbauer können sie später prüfen."
            : "Ich habe die Idee auf diesem Gerät vorgemerkt. Sobald unser Ideenbuch verbunden ist, kann sie weitergegeben werden."}
        </p>
        <p className="creator-status">Noch nicht Teil der Sternenkarte · die Welt wurde dadurch noch nicht verändert.</p>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Zurück in den Hangar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-flow">
      <p className="eyebrow">Louis · Ideenbuch</p>
      <h2>{stage === "review" || stage === "saving" ? "Stimmt das so?" : "Ich höre zu."}</h2>

      <div className="louis-prompt">
        <p>{prompt}</p>
        <ReadAloudButton text={prompt} rate={speechRate} speaker="Louis" />
      </div>

      {stage === "idea" && (
        <>
          <label className="creator-field">
            <span>Deine Idee</span>
            <textarea
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              placeholder="Zum Beispiel: Ich möchte einen Planeten, auf dem Fische durch die Wolken schwimmen …"
              rows={5}
              autoFocus
            />
          </label>
          <div className="creator-input-tools">
            <VoiceInputButton
              onVoiceUsed={() => setInputMethod("voice")}
              onTranscript={(text) => setOriginalText(text)}
            />
            <span className="creator-confirm-note">
              Gesprochenen Text immer erst anschauen und dann mit „Weiter“ bestätigen.
            </span>
          </div>
        </>
      )}

      {stage === "questions" && currentQuestion && (
        <>
          <label className="creator-field">
            <span>Deine Antwort</span>
            <textarea
              value={currentAnswer}
              onChange={(event) => setCurrentAnswer(event.target.value)}
              placeholder="Erzähl Louis, wie du es dir vorstellst …"
              rows={4}
              autoFocus
            />
          </label>
          <div className="creator-input-tools">
            <VoiceInputButton
              onVoiceUsed={() => setInputMethod("voice")}
              onTranscript={(text) => setCurrentAnswer(text)}
            />
            <span className="question-progress">
              Frage {questionIndex + 1} von {creatorQuestions.length}
            </span>
          </div>
        </>
      )}

      {(stage === "review" || stage === "saving") && (
        <div className="idea-review">
          <div>
            <span>Deine ursprüngliche Idee</span>
            <strong>{originalText}</strong>
          </div>
          <div>
            <span>Ort / Zeitpunkt</span>
            <strong>{structuredIdea.place}</strong>
          </div>
          <div>
            <span>So wirkt es dort</span>
            <strong>{structuredIdea.look}</strong>
          </div>
          <div>
            <span>Das kann man tun</span>
            <strong>{structuredIdea.activity}</strong>
          </div>
          <div>
            <span>Das muss bleiben</span>
            <strong>{structuredIdea.special}</strong>
          </div>
          {saveError && <p className="creator-error">{saveError}</p>}
        </div>
      )}

      <div className="dialog-actions">
        {stage === "idea" && (
          <>
            <button type="button" onClick={continueFromIdea} disabled={!originalText.trim()}>
              Weiter
            </button>
            <button type="button" className="secondary-button" onClick={onBack}>
              Zurück
            </button>
          </>
        )}

        {stage === "questions" && (
          <>
            <button type="button" onClick={continueQuestion} disabled={!currentAnswer.trim()}>
              Übernehmen
            </button>
            <button type="button" className="secondary-button" onClick={onBack}>
              Abbrechen
            </button>
          </>
        )}

        {stage === "review" && (
          <>
            <button type="button" onClick={() => void persist()}>
              Ja, so notieren
            </button>
            <button type="button" className="secondary-button" onClick={() => setStage("idea")}>
              Ändern
            </button>
          </>
        )}

        {stage === "saving" && <button type="button" disabled>Louis notiert …</button>}
      </div>

      <p className="speech-privacy">
        Audio wird von unserer App nicht gespeichert. Die Browser-Spracherkennung kann je nach
        Gerät einen Onlinedienst des Browser-/Geräteanbieters verwenden.
      </p>
    </div>
  );
}
