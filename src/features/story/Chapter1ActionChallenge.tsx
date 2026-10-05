import { useMemo, useState } from "react";
import type { Chapter1StoryBeatId } from "../../domain/chapter1";
import { gameAudio, type GameSoundId } from "../../services/audio/gameAudio";

type Chapter1ActionChallengeProps = {
  beatId: Chapter1StoryBeatId;
  onComplete: () => void;
};

const challengedBeats = new Set<Chapter1StoryBeatId>([
  "energy-cell",
  "cooling",
  "navigation",
  "ship-test",
  "launch"
]);

export function hasChapter1ActionChallenge(id: Chapter1StoryBeatId): boolean {
  return challengedBeats.has(id);
}

async function cue(sound: GameSoundId): Promise<void> {
  await gameAudio.unlock();
  gameAudio.play(sound);
}

export function Chapter1ActionChallenge({
  beatId,
  onComplete
}: Chapter1ActionChallengeProps) {
  if (beatId === "energy-cell") {
    return <EnergyCellChallenge onComplete={onComplete} />;
  }
  if (beatId === "cooling") {
    return <CoolingChallenge onComplete={onComplete} />;
  }
  if (beatId === "navigation") {
    return <NavigationChallenge onComplete={onComplete} />;
  }
  if (beatId === "ship-test") {
    return <SystemTestChallenge onComplete={onComplete} />;
  }
  if (beatId === "launch") {
    return <LaunchChallenge onComplete={onComplete} />;
  }
  return null;
}

function EnergyCellChallenge({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<"a" | "b" | "c" | null>(null);
  const [plus, setPlus] = useState(false);
  const [ground, setGround] = useState(false);
  const [message, setMessage] = useState(
    "Gesucht: 48 V, stabile Temperatur und ein unbeschädigtes Gehäuse."
  );

  const choose = (id: "a" | "b" | "c") => {
    setSelected(id);
    if (id === "b") {
      setMessage("Passt. Jetzt beide Kontakte anschließen.");
      void cue("repair-step");
    } else {
      setMessage(
        id === "a"
          ? "Zu wenig Spannung. Das Schiff würde nicht hochfahren."
          : "48 V, aber die Zelle ist überhitzt. Nimm eine andere."
      );
      void cue("error");
    }
  };

  const ready = selected === "b" && plus && ground;

  return (
    <div className="chapter-action-challenge" aria-label="Energiezelle vorbereiten">
      <div className="challenge-status">
        <strong>Energiezelle auswählen</strong>
        <span>{message}</span>
      </div>

      <div className="challenge-choice-grid">
        <button
          type="button"
          className={selected === "a" ? "selected" : ""}
          onClick={() => choose("a")}
        >
          <strong>Zelle A</strong>
          <span>22 V · stabil · Gehäuse gut</span>
        </button>
        <button
          type="button"
          className={selected === "b" ? "selected correct" : ""}
          onClick={() => choose("b")}
        >
          <strong>Zelle B</strong>
          <span>48 V · stabil · Gehäuse gut</span>
        </button>
        <button
          type="button"
          className={selected === "c" ? "selected" : ""}
          onClick={() => choose("c")}
        >
          <strong>Zelle C</strong>
          <span>48 V · heiß · Gehäuse beschädigt</span>
        </button>
      </div>

      {selected === "b" && (
        <div className="challenge-controls">
          <button
            type="button"
            className={plus ? "done" : ""}
            onClick={() => {
              setPlus(true);
              void cue("switch");
            }}
          >
            {plus ? "✓ Pluskontakt sitzt" : "+ Pluskontakt anschließen"}
          </button>
          <button
            type="button"
            className={ground ? "done" : ""}
            onClick={() => {
              setGround(true);
              void cue("switch");
            }}
          >
            {ground ? "✓ Massekontakt sitzt" : "− Massekontakt anschließen"}
          </button>
        </div>
      )}

      <button
        type="button"
        className="challenge-complete"
        disabled={!ready}
        onClick={() => {
          void cue("system-ready");
          onComplete();
        }}
      >
        Energiezelle verriegeln
      </button>
    </div>
  );
}

const coolingSteps = [
  "Kühlmittelventil schließen",
  "Reparaturklemme setzen",
  "Riss abdichten",
  "Drucktest starten"
] as const;

function CoolingChallenge({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState(
    "Die Leitung steht noch unter Druck. Arbeitet in der richtigen Reihenfolge."
  );

  const runStep = (index: number) => {
    if (index !== step) {
      setMessage("Noch nicht. Erst den vorherigen Reparaturschritt erledigen.");
      void cue("error");
      return;
    }

    const next = step + 1;
    setStep(next);
    void cue(next === coolingSteps.length ? "system-ready" : "repair-step");

    if (next === 1) setMessage("Druck fällt ab. Jetzt kann die Klemme gesetzt werden.");
    if (next === 2) setMessage("Klemme hält. Den Riss jetzt sauber abdichten.");
    if (next === 3) setMessage("Dichtung sitzt. Jetzt prüfen, ob die Leitung wirklich hält.");
    if (next === 4) setMessage("Druck stabil. Die Kühlung ist wieder dicht.");
  };

  return (
    <div className="chapter-action-challenge" aria-label="Kühlleitung reparieren">
      <div className="challenge-status">
        <strong>Reparaturfolge</strong>
        <span>{message}</span>
      </div>

      <div className="challenge-sequence">
        {coolingSteps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index < step ? "done" : index === step ? "current" : ""}
            onClick={() => runStep(index)}
          >
            <span>{index < step ? "✓" : index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="challenge-complete"
        disabled={step !== coolingSteps.length}
        onClick={onComplete}
      >
        Reparatur abschließen
      </button>
    </div>
  );
}

const navTargets = [68, 42, 81] as const;

function NavigationChallenge({ onComplete }: { onComplete: () => void }) {
  const [bands, setBands] = useState<[number, number, number]>([34, 66, 54]);
  const [message, setMessage] = useState(
    "Louis hat drei schwache Resonanzen gefunden. Gleiche die Bänder an."
  );
  const stable = useMemo(
    () => bands.every((value, index) => Math.abs(value - navTargets[index]) <= 4),
    [bands]
  );

  const updateBand = (index: number, value: number) => {
    const next = [...bands] as [number, number, number];
    next[index] = value;
    setBands(next);
  };

  const verify = () => {
    if (!stable) {
      setMessage("Signal noch instabil. Bringt alle drei Bänder näher an die Markierungen.");
      void cue("error");
      return;
    }

    setMessage("Signal stabil: Route Cinder bestätigt.");
    void cue("system-ready");
  };

  return (
    <div className="chapter-action-challenge" aria-label="Navigation kalibrieren">
      <div className="challenge-status">
        <strong>Navigationssignal kalibrieren</strong>
        <span>{message}</span>
      </div>

      <div className="navigation-tuner">
        {bands.map((value, index) => (
          <label key={index}>
            <span>
              Band {index + 1} · Ziel {navTargets[index]} · aktuell {value}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(event) => updateBand(index, Number(event.target.value))}
              onPointerUp={() => void cue("switch")}
            />
          </label>
        ))}
      </div>

      <div className="challenge-controls">
        <button type="button" onClick={verify}>
          Signal prüfen
        </button>
        <button
          type="button"
          className="challenge-complete"
          disabled={!stable}
          onClick={onComplete}
        >
          Kurs Cinder speichern
        </button>
      </div>
    </div>
  );
}

const systemChecks = [
  ["energy", "Energiefluss"],
  ["cooling", "Kühlkreislauf"],
  ["navigation", "Navigation"]
] as const;

function SystemTestChallenge({ onComplete }: { onComplete: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [engineTested, setEngineTested] = useState(false);
  const allChecked = systemChecks.every(([id]) => checks[id]);

  const runCheck = (id: string) => {
    setChecks((current) => ({ ...current, [id]: true }));
    void cue("switch");
  };

  return (
    <div className="chapter-action-challenge" aria-label="Schiffssysteme testen">
      <div className="challenge-status">
        <strong>Systemtest</strong>
        <span>Prüft alle Systeme einzeln, bevor ihr den Antrieb hochfahrt.</span>
      </div>

      <div className="system-check-grid">
        {systemChecks.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={checks[id] ? "done" : ""}
            onClick={() => runCheck(id)}
          >
            <span>{checks[id] ? "GRÜN" : "PRÜFEN"}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!allChecked}
        className={engineTested ? "done" : ""}
        onClick={() => {
          setEngineTested(true);
          void cue("system-ready");
        }}
      >
        {engineTested ? "✓ Antrieb stabil bei 10 %" : "Antrieb auf 10 % testen"}
      </button>

      <button
        type="button"
        className="challenge-complete"
        disabled={!engineTested}
        onClick={onComplete}
      >
        Systemtest abschließen
      </button>
    </div>
  );
}

const launchChecks = [
  "Crew gesichert",
  "Kabine verriegelt",
  "Kurs Cinder bestätigt"
] as const;

function LaunchChallenge({ onComplete }: { onComplete: () => void }) {
  const [ready, setReady] = useState<boolean[]>([false, false, false]);
  const allReady = ready.every(Boolean);

  const toggle = (index: number) => {
    const next = [...ready];
    next[index] = !next[index];
    setReady(next);
    void cue("switch");
  };

  return (
    <div className="chapter-action-challenge" aria-label="Startsequenz vorbereiten">
      <div className="challenge-status">
        <strong>Startfreigabe</strong>
        <span>Vor dem Start müssen alle drei Freigaben bestätigt sein.</span>
      </div>

      <div className="launch-checklist">
        {launchChecks.map((label, index) => (
          <button
            type="button"
            key={label}
            className={ready[index] ? "done" : ""}
            onClick={() => toggle(index)}
          >
            <span>{ready[index] ? "✓" : "○"}</span>
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="challenge-complete"
        disabled={!allReady}
        onClick={() => {
          void cue("travel");
          onComplete();
        }}
      >
        Startsequenz auslösen
      </button>
    </div>
  );
}
