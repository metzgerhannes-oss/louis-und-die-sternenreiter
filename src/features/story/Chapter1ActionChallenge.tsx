import { useCallback, useMemo, useState } from "react";
import type { Chapter1StoryBeatId } from "../../domain/chapter1";
import { gameAudio, type GameSoundId } from "../../services/audio/gameAudio";
import {
  Chapter1FailureReaction,
  type FailureReaction
} from "./Chapter1FailureReaction";

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

function useFailureReaction() {
  const [reaction, setReaction] = useState<FailureReaction | null>(null);
  const clearReaction = useCallback(() => setReaction(null), []);

  const trigger = useCallback(
    (next: FailureReaction, sound: GameSoundId) => {
      setReaction(next);
      void cue(sound);
    },
    []
  );

  return { reaction, clearReaction, trigger };
}

function ReactionLayer({
  reaction,
  onDone
}: {
  reaction: FailureReaction | null;
  onDone: () => void;
}) {
  if (!reaction) return null;
  return <Chapter1FailureReaction reaction={reaction} onDone={onDone} />;
}

export type CoolingControlId = "pressure" | "seal" | "valve" | "clamp";

export const coolingRequiredOrder: readonly CoolingControlId[] = [
  "valve",
  "clamp",
  "seal",
  "pressure"
];

export const coolingDisplayOrder: readonly CoolingControlId[] = [
  "pressure",
  "seal",
  "valve",
  "clamp"
];

export function coolingControlCanRun(
  completed: readonly CoolingControlId[],
  control: CoolingControlId
): boolean {
  const next = coolingRequiredOrder[completed.length];
  return control === next;
}

const navTargets = [68, 42, 81] as const;

export function navigationBandStrength(value: number, target: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - Math.abs(value - target) * 4)));
}

export function navigationIsStable(values: readonly number[]): boolean {
  return values.every(
    (value, index) => Math.abs(value - navTargets[index]) <= 4
  );
}

export type SystemControlId = "drive" | "navigation" | "energy" | "cooling";

export const systemDisplayOrder: readonly SystemControlId[] = [
  "drive",
  "navigation",
  "energy",
  "cooling"
];

export const systemRequiredOrder: readonly SystemControlId[] = [
  "energy",
  "cooling",
  "navigation",
  "drive"
];

export function systemControlCanRun(
  completed: readonly SystemControlId[],
  control: SystemControlId
): boolean {
  return systemRequiredOrder[completed.length] === control;
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
    "Am Anschluss steht 48 V. Die Schutzanzeige warnt vor Hitze."
  );
  const { reaction, clearReaction, trigger } = useFailureReaction();

  const choose = (id: "a" | "b" | "c") => {
    setPlus(false);
    setGround(false);

    if (id === "a") {
      setSelected(null);
      setMessage("Die Anzeige bleibt dunkel.");
      trigger(
        {
          kind: "energy-low",
          title: "Nichts passiert",
          text: "Die Anzeigen flackern kurz und fallen wieder aus."
        },
        "alarm"
      );
      return;
    }

    if (id === "c") {
      setSelected(null);
      setMessage("Die Schutzanzeige meldet Überhitzung.");
      trigger(
        {
          kind: "energy-overheat",
          title: "Funkenstoß!",
          text: "Die heiße Zelle schlägt Funken. Louis zieht sie sofort zurück."
        },
        "failure-burst"
      );
      return;
    }

    setSelected(id);
    setMessage("Die Kontakte passen. Versucht, die Zelle anzuschließen.");
    void cue("repair-step");
  };

  const ready = selected === "b" && plus && ground;

  const tryLock = () => {
    if (!ready) {
      trigger(
        {
          kind: "energy-lock",
          title: "Verriegelung blockiert",
          text: "Die Halterung stößt die Zelle wieder zurück."
        },
        "alarm"
      );
      return;
    }

    void cue("system-ready");
    onComplete();
  };

  return (
    <div className="chapter-action-challenge" aria-label="Energiezelle vorbereiten">
      <ReactionLayer reaction={reaction} onDone={clearReaction} />

      <div className="challenge-status">
        <strong>Energiezelle</strong>
        <span>{message}</span>
      </div>

      <div className="challenge-choice-grid">
        <button
          type="button"
          className={selected === "a" ? "selected" : ""}
          onClick={() => choose("a")}
        >
          <strong>Zelle A</strong>
          <span>22 V · kalt · Gehäuse intakt</span>
        </button>
        <button
          type="button"
          className={selected === "b" ? "selected" : ""}
          onClick={() => choose("b")}
        >
          <strong>Zelle B</strong>
          <span>48 V · kalt · Gehäuse intakt</span>
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
            {plus ? "✓ Pluskontakt" : "+ Pluskontakt"}
          </button>
          <button
            type="button"
            className={ground ? "done" : ""}
            onClick={() => {
              setGround(true);
              void cue("switch");
            }}
          >
            {ground ? "✓ Massekontakt" : "− Massekontakt"}
          </button>
        </div>
      )}

      <button
        type="button"
        className={ready ? "challenge-complete" : ""}
        onClick={tryLock}
      >
        Zelle verriegeln
      </button>
    </div>
  );
}

const coolingLabels: Record<CoolingControlId, string> = {
  pressure: "Drucktest starten",
  seal: "Riss abdichten",
  valve: "Kühlmittelventil schließen",
  clamp: "Reparaturklemme setzen"
};

const coolingFailure: Record<CoolingControlId, FailureReaction> = {
  pressure: {
    kind: "coolant-burst",
    title: "Kühlmittel schießt heraus!",
    text: "Der Drucktest drückt das Kühlmittel direkt durch den offenen Riss."
  },
  seal: {
    kind: "seal-slip",
    title: "Dichtung rutscht weg",
    text: "Die Leitung bewegt sich zu stark. Die Dichtung hält nicht."
  },
  valve: {
    kind: "coolant-burst",
    title: "Das Ventil schlägt zurück",
    text: "Im falschen Zustand drückt die Leitung gegen das Ventil."
  },
  clamp: {
    kind: "clamp-kickback",
    title: "Klemme springt ab!",
    text: "Die Leitung steht noch so stark unter Druck, dass die Klemme nicht hält."
  }
};

const coolingSuccess: Record<CoolingControlId, string> = {
  valve: "Das Zischen wird leiser. Der Druck fällt ab.",
  clamp: "Die Leitung sitzt jetzt ruhig.",
  seal: "Kein Kühlmittel tritt mehr aus.",
  pressure: "Der Druck bleibt stabil."
};

function CoolingChallenge({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<CoolingControlId[]>([]);
  const [message, setMessage] = useState(
    "Die Leitung zischt und steht unter Druck. Probiert aus, wie ihr sie sicher dicht bekommt."
  );
  const { reaction, clearReaction, trigger } = useFailureReaction();

  const runControl = (control: CoolingControlId) => {
    if (completed.includes(control)) return;

    if (!coolingControlCanRun(completed, control)) {
      setMessage("Der Versuch hat nicht funktioniert.");
      const sound: GameSoundId =
        control === "pressure"
          ? "coolant-spray"
          : control === "clamp"
            ? "failure-burst"
            : "alarm";
      trigger(coolingFailure[control], sound);
      return;
    }

    const next = [...completed, control];
    setCompleted(next);
    setMessage(coolingSuccess[control]);
    void cue(next.length === coolingRequiredOrder.length ? "system-ready" : "repair-step");
  };

  const done = completed.length === coolingRequiredOrder.length;

  return (
    <div className="chapter-action-challenge" aria-label="Kühlleitung reparieren">
      <ReactionLayer reaction={reaction} onDone={clearReaction} />

      <div className="challenge-status">
        <strong>Kühlleitung</strong>
        <span>{message}</span>
      </div>

      <div className="challenge-sequence challenge-sequence-unordered">
        {coolingDisplayOrder.map((control) => {
          const isDone = completed.includes(control);
          return (
            <button
              type="button"
              key={control}
              className={isDone ? "done" : ""}
              disabled={isDone}
              onClick={() => runControl(control)}
            >
              <span aria-hidden="true">{isDone ? "✓" : "•"}</span>
              {coolingLabels[control]}
            </button>
          );
        })}
      </div>

      {done && (
        <button
          type="button"
          className="challenge-complete"
          onClick={onComplete}
        >
          Reparatur übernehmen
        </button>
      )}
    </div>
  );
}

function NavigationChallenge({ onComplete }: { onComplete: () => void }) {
  const [bands, setBands] = useState<[number, number, number]>([34, 66, 54]);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState(
    "Drei Resonanzbänder sind verstimmt. Sucht den stärksten gemeinsamen Empfang."
  );
  const { reaction, clearReaction, trigger } = useFailureReaction();

  const strengths = useMemo(
    () => bands.map((value, index) => navigationBandStrength(value, navTargets[index])),
    [bands]
  );
  const stable = navigationIsStable(bands);

  const updateBand = (index: number, value: number) => {
    const next = [...bands] as [number, number, number];
    next[index] = value;
    setBands(next);
    setVerified(false);
  };

  const verify = () => {
    if (!stable) {
      const strongBands = strengths.filter((strength) => strength >= 80).length;
      setMessage(
        strongBands === 0
          ? "Das Signal ist noch instabil."
          : strongBands === 1
            ? "Ein Teil der Route hält."
            : "Fast stabil."
      );
      trigger(
        {
          kind: "navigation-glitch",
          title: "Signal verloren",
          text:
            strongBands >= 2
              ? "Die Sternenkarte hält kurz – dann zerreißt ein einzelnes Störband die Route."
              : "Die Sternenkarte springt auseinander und verliert Cinder wieder."
        },
        "glitch"
      );
      return;
    }

    setVerified(true);
    setMessage("Das Muster bleibt stehen. Cinder ist eindeutig.");
    void cue("system-ready");
  };

  return (
    <div className="chapter-action-challenge" aria-label="Navigation kalibrieren">
      <ReactionLayer reaction={reaction} onDone={clearReaction} />

      <div className="challenge-status">
        <strong>Navigation</strong>
        <span>{message}</span>
      </div>

      <div className="navigation-tuner">
        {bands.map((value, index) => (
          <label key={index}>
            <span>Band {String.fromCharCode(65 + index)}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={value}
              aria-valuetext={`Signalstärke ${strengths[index]} Prozent`}
              onChange={(event) => updateBand(index, Number(event.target.value))}
              onPointerUp={() => void cue("switch")}
            />
            <span className="signal-meter" aria-hidden="true">
              <i style={{ width: `${strengths[index]}%` }} />
            </span>
          </label>
        ))}
      </div>

      <div className="challenge-controls">
        <button type="button" onClick={verify}>
          Empfang prüfen
        </button>
        {verified && (
          <button
            type="button"
            className="challenge-complete"
            onClick={onComplete}
          >
            Route übernehmen
          </button>
        )}
      </div>
    </div>
  );
}

const systemLabels: Record<SystemControlId, string> = {
  drive: "Antriebspuls",
  navigation: "Navigationssperre",
  energy: "Energieverteiler",
  cooling: "Kühlpumpe"
};

const systemFailure: Record<SystemControlId, FailureReaction> = {
  drive: {
    kind: "system-abort",
    title: "Antrieb bricht ab",
    text: "Ein harter Ruck geht durchs Schiff. Die Sicherheitslogik nimmt den Antrieb sofort zurück."
  },
  navigation: {
    kind: "system-abort",
    title: "Navigation fällt zurück",
    text: "Die Projektion flackert und verliert ihre Systembasis."
  },
  energy: {
    kind: "system-abort",
    title: "Verteiler verweigert",
    text: "Die Anzeigen blitzen rot auf und schalten den Kreis wieder frei."
  },
  cooling: {
    kind: "system-abort",
    title: "Pumpe stoppt",
    text: "Die Kühlpumpe läuft an, rattert kurz und fällt wieder aus."
  }
};

const systemSuccess: Record<SystemControlId, string> = {
  energy: "Grundversorgung steht.",
  cooling: "Kühlkreislauf hält den Druck.",
  navigation: "Navigation verriegelt auf Cinder.",
  drive: "Antriebspuls stabil."
};

function SystemTestChallenge({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<SystemControlId[]>([]);
  const [message, setMessage] = useState(
    "Die Konsole ist wieder da. Findet heraus, in welcher Reihenfolge die Systeme hochfahren."
  );
  const { reaction, clearReaction, trigger } = useFailureReaction();

  const runControl = (control: SystemControlId) => {
    if (completed.includes(control)) return;

    if (!systemControlCanRun(completed, control)) {
      setMessage("Das Schiff hat den Versuch abgebrochen.");
      trigger(systemFailure[control], control === "drive" ? "failure-burst" : "alarm");
      return;
    }

    const next = [...completed, control];
    setCompleted(next);
    setMessage(systemSuccess[control]);
    void cue(next.length === systemRequiredOrder.length ? "system-ready" : "switch");
  };

  const done = completed.length === systemRequiredOrder.length;

  return (
    <div className="chapter-action-challenge" aria-label="Schiffssysteme testen">
      <ReactionLayer reaction={reaction} onDone={clearReaction} />

      <div className="challenge-status">
        <strong>Systemkonsole</strong>
        <span>{message}</span>
      </div>

      <div className="system-check-grid system-check-grid-unordered">
        {systemDisplayOrder.map((control) => {
          const isDone = completed.includes(control);
          return (
            <button
              key={control}
              type="button"
              className={isDone ? "done" : ""}
              disabled={isDone}
              onClick={() => runControl(control)}
            >
              <span>{isDone ? "AKTIV" : "BEREIT"}</span>
              <strong>{systemLabels[control]}</strong>
            </button>
          );
        })}
      </div>

      {done && (
        <button
          type="button"
          className="challenge-complete"
          onClick={onComplete}
        >
          Testprotokoll speichern
        </button>
      )}
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
  const { reaction, clearReaction, trigger } = useFailureReaction();

  const toggle = (index: number) => {
    const next = [...ready];
    next[index] = !next[index];
    setReady(next);
    void cue("switch");
  };

  const tryLaunch = () => {
    if (!allReady) {
      const missing = ready.filter((value) => !value).length;
      trigger(
        {
          kind: "launch-abort",
          title: "STARTABBRUCH",
          text:
            missing === 1
              ? "Eine Sicherheitsfreigabe fehlt. Die Triebwerke gehen sofort wieder aus."
              : "Mehrere Sicherheitsfreigaben fehlen. Das Schiff verweigert den Start."
        },
        "alarm"
      );
      return;
    }

    void cue("travel");
    onComplete();
  };

  return (
    <div className="chapter-action-challenge" aria-label="Startsequenz vorbereiten">
      <ReactionLayer reaction={reaction} onDone={clearReaction} />

      <div className="challenge-status">
        <strong>Startkonsole</strong>
        <span>Die Freigaben sind noch offen.</span>
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
        className={allReady ? "challenge-complete" : "challenge-risk-action"}
        onClick={tryLaunch}
      >
        Startsequenz auslösen
      </button>
    </div>
  );
}
