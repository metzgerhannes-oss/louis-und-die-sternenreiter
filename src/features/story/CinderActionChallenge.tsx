import { useCallback, useMemo, useState } from "react";
import type { CinderStoryBeatId } from "../../domain/chapter2";
import { gameAudio, type GameSoundId } from "../../services/audio/gameAudio";
import {
  CinderFailureReaction,
  type CinderFailureReactionData
} from "./CinderFailureReaction";

type CinderActionChallengeProps = {
  beatId: CinderStoryBeatId;
  onComplete: () => void;
};

const challengedBeats = new Set<CinderStoryBeatId>([
  "landing",
  "inspect-intake",
  "route-survey",
  "drive-upgrade"
]);

export function hasCinderActionChallenge(id: CinderStoryBeatId): boolean {
  return challengedBeats.has(id);
}

async function cue(sound: GameSoundId): Promise<void> {
  await gameAudio.unlock();
  gameAudio.play(sound);
}

function useFailureReaction() {
  const [reaction, setReaction] = useState<CinderFailureReactionData | null>(null);
  const clear = useCallback(() => setReaction(null), []);

  const trigger = useCallback(
    (next: CinderFailureReactionData, sound: GameSoundId) => {
      setReaction(next);
      void cue(sound);
    },
    []
  );

  return { reaction, clear, trigger };
}

export type LandingZoneId = "rotors" | "mesa-lee" | "salt-flat";

export function isSafeLandingZone(zone: LandingZoneId): boolean {
  return zone === "mesa-lee";
}

export type CondenserDiagnosisId =
  | "no-moisture"
  | "heat-transfer"
  | "weak-wind";

export function isCorrectCondenserDiagnosis(
  diagnosis: CondenserDiagnosisId
): boolean {
  return diagnosis === "heat-transfer";
}

export type DriveControlId = "couple" | "coil" | "power" | "mount";

export const driveRequiredOrder: readonly DriveControlId[] = [
  "power",
  "mount",
  "coil",
  "couple"
];

export const driveDisplayOrder: readonly DriveControlId[] = [
  "couple",
  "coil",
  "mount",
  "power"
];

export function driveControlCanRun(
  completed: readonly DriveControlId[],
  control: DriveControlId
): boolean {
  return driveRequiredOrder[completed.length] === control;
}

export function CinderActionChallenge({
  beatId,
  onComplete
}: CinderActionChallengeProps) {
  if (beatId === "landing") {
    return <LandingChallenge onComplete={onComplete} />;
  }

  if (beatId === "inspect-intake") {
    return <CondenserChallenge onComplete={onComplete} />;
  }

  if (beatId === "route-survey") {
    return <RouteSurveyChallenge onComplete={onComplete} />;
  }

  if (beatId === "drive-upgrade") {
    return <DriveUpgradeChallenge onComplete={onComplete} />;
  }

  return null;
}

function LandingChallenge({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<LandingZoneId | null>(null);
  const [message, setMessage] = useState(
    "Der Wind treibt roten Staub quer über die Ebene. Sucht selbst einen sicheren Landeplatz."
  );
  const { reaction, clear, trigger } = useFailureReaction();

  const choose = (zone: LandingZoneId) => {
    if (zone === "rotors") {
      setSelected(null);
      setMessage("Der Anflug wird sofort unruhig.");
      trigger(
        {
          kind: "dust-blast",
          title: "Staubwalze!",
          text: "Die Rotoren werfen eine dichte Staubwand direkt gegen die Scheibe. Philipp zieht das Schiff wieder hoch."
        },
        "alarm"
      );
      return;
    }

    if (zone === "salt-flat") {
      setSelected(null);
      setMessage("Der Untergrund hält die Last nicht sauber.");
      trigger(
        {
          kind: "ground-crack",
          title: "Der Boden reißt auf",
          text: "Die heiße Salzkruste bricht unter dem Fahrwerk. Charly gibt sofort Schub und hebt wieder ab."
        },
        "failure-burst"
      );
      return;
    }

    setSelected(zone);
    setMessage("Hinter der Mesa fällt der Wind fast vollständig ab. Der Boden wirkt fest.");
    void cue("system-ready");
  };

  return (
    <div className="chapter-action-challenge cinder-action-challenge">
      {reaction && <CinderFailureReaction reaction={reaction} onDone={clear} />}

      <div className="challenge-status">
        <strong>Landeplatz wählen</strong>
        <span>{message}</span>
      </div>

      <div className="cinder-choice-grid">
        <button type="button" onClick={() => choose("rotors")}>
          <strong>Bei den Rotoren</strong>
          <span>kurzer Weg · starke Luftwirbel</span>
        </button>
        <button
          type="button"
          className={selected === "mesa-lee" ? "done" : ""}
          onClick={() => choose("mesa-lee")}
        >
          <strong>Leeseite der Mesa</strong>
          <span>längerer Weg · wenig Wind · fester Fels</span>
        </button>
        <button type="button" onClick={() => choose("salt-flat")}>
          <strong>Salzfläche</strong>
          <span>eben · sehr heiß · rissige Oberfläche</span>
        </button>
      </div>

      {selected === "mesa-lee" && (
        <button
          type="button"
          className="challenge-complete"
          onClick={onComplete}
        >
          Landung durchführen
        </button>
      )}
    </div>
  );
}

const sensorData = {
  intake: {
    title: "Ansaugluft",
    value: "41 °C",
    note: "Wind kommt an. Die Anlage zieht genug Luft."
  },
  ground: {
    title: "Tiefenrohr",
    value: "17 °C",
    note: "Unter dem Boden ist es deutlich kühler."
  },
  fins: {
    title: "Kondensatorlamellen",
    value: "38 °C",
    note: "Fast so warm wie die Ansaugluft."
  }
} as const;

type SensorId = keyof typeof sensorData;

function CondenserChallenge({ onComplete }: { onComplete: () => void }) {
  const [seen, setSeen] = useState<SensorId[]>([]);
  const [diagnosis, setDiagnosis] = useState<CondenserDiagnosisId | null>(null);
  const [message, setMessage] = useState(
    "Rika schaltet die Messpunkte frei. Ihr entscheidet selbst, was ihr zuerst prüft."
  );
  const { reaction, clear, trigger } = useFailureReaction();

  const inspect = (id: SensorId) => {
    if (!seen.includes(id)) {
      setSeen((current) => [...current, id]);
      void cue("switch");
    }
    setMessage(sensorData[id].note);
  };

  const diagnose = (choice: CondenserDiagnosisId) => {
    if (choice === "no-moisture") {
      setDiagnosis(null);
      trigger(
        {
          kind: "dry-air",
          title: "Test widerspricht euch",
          text: "Am kalten Tiefenrohr bildet sich sofort ein feiner Wasserfilm. Feuchtigkeit ist also vorhanden."
        },
        "alarm"
      );
      return;
    }

    if (choice === "weak-wind") {
      setDiagnosis(null);
      trigger(
        {
          kind: "fan-dust",
          title: "Zu viel Wind statt zu wenig",
          text: "Beim Hochdrehen des Lüfters schießt nur roter Staub durch die Anlage. Der Luftstrom war nicht das Problem."
        },
        "coolant-spray"
      );
      return;
    }

    setDiagnosis(choice);
    setMessage("Das passt zu allen Messwerten: Die Anlage bekommt die Wärme nicht mehr aus den Lamellen.");
    void cue("system-ready");
  };

  const inspectedEnough = seen.length >= 2;

  return (
    <div className="chapter-action-challenge cinder-action-challenge">
      {reaction && <CinderFailureReaction reaction={reaction} onDone={clear} />}

      <div className="challenge-status">
        <strong>Kondensator untersuchen</strong>
        <span>{message}</span>
      </div>

      <div className="cinder-sensor-grid">
        {(Object.keys(sensorData) as SensorId[]).map((id) => {
          const item = sensorData[id];
          const active = seen.includes(id);
          return (
            <button
              type="button"
              key={id}
              className={active ? "scanned" : ""}
              onClick={() => inspect(id)}
            >
              <span>{active ? item.value : "MESSEN"}</span>
              <strong>{item.title}</strong>
              <small>{active ? item.note : "Sensor antippen"}</small>
            </button>
          );
        })}
      </div>

      <div className="cinder-diagnosis">
        <p>Was ist wahrscheinlich das eigentliche Problem?</p>
        <div>
          <button
            type="button"
            disabled={!inspectedEnough}
            onClick={() => diagnose("no-moisture")}
          >
            Zu wenig Feuchtigkeit
          </button>
          <button
            type="button"
            disabled={!inspectedEnough}
            className={diagnosis === "heat-transfer" ? "done" : ""}
            onClick={() => diagnose("heat-transfer")}
          >
            Die Wärme wird nicht abgeführt
          </button>
          <button
            type="button"
            disabled={!inspectedEnough}
            onClick={() => diagnose("weak-wind")}
          >
            Zu wenig Luftstrom
          </button>
        </div>
      </div>

      {diagnosis === "heat-transfer" && (
        <button
          type="button"
          className="challenge-complete"
          onClick={onComplete}
        >
          Rika die Diagnose zeigen
        </button>
      )}
    </div>
  );
}

export type WaterRouteId = "surface" | "service-trench" | "canyon-floor";

export function isSafeWaterRoute(route: WaterRouteId): boolean {
  return route === "service-trench";
}

function RouteSurveyChallenge({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<WaterRouteId | null>(null);
  const [message, setMessage] = useState(
    "Drei Korridore führen Richtung Staubhafen. Keiner ist als sicher markiert."
  );
  const { reaction, clear, trigger } = useFailureReaction();

  const choose = (route: WaterRouteId) => {
    if (route === "surface") {
      setSelected(null);
      setMessage("Die Oberflächenroute ist zu heiß.");
      trigger(
        {
          kind: "ground-crack",
          title: "Rohrweg verzieht sich",
          text: "In der Mittagshitze arbeitet der Boden sichtbar. Eine starre Leitung würde hier schnell aufreißen."
        },
        "alarm"
      );
      return;
    }

    if (route === "canyon-floor") {
      setSelected(null);
      setMessage("Am Canyonboden liegen frische Geröllspuren.");
      trigger(
        {
          kind: "dust-blast",
          title: "Sturzflut-Spuren!",
          text: "Zwischen den Felsen steckt Treibgut hoch über dem Boden. Bei seltenem Regen wird dieser Weg zum Fluss."
        },
        "coolant-spray"
      );
      return;
    }

    setSelected(route);
    setMessage("Der alte Wartungsgraben liegt im Schatten, ist erhöht und führt fast bis Staubhafen.");
    void cue("system-ready");
  };

  return (
    <div className="chapter-action-challenge cinder-action-challenge">
      {reaction && <CinderFailureReaction reaction={reaction} onDone={clear} />}

      <div className="challenge-status">
        <strong>Wasserweg erkunden</strong>
        <span>{message}</span>
      </div>

      <div className="cinder-choice-grid">
        <button type="button" onClick={() => choose("surface")}>
          <strong>Gerade über die Ebene</strong>
          <span>kürzester Weg · volle Sonne · arbeitender Boden</span>
        </button>
        <button
          type="button"
          className={selected === "service-trench" ? "done" : ""}
          onClick={() => choose("service-trench")}
        >
          <strong>Alter Wartungsgraben</strong>
          <span>länger · schattig · erhöht · alte Befestigungen</span>
        </button>
        <button type="button" onClick={() => choose("canyon-floor")}>
          <strong>Durch den Canyonboden</strong>
          <span>kühl · eben · Geröll und Treibgut</span>
        </button>
      </div>

      {selected === "service-trench" && (
        <button type="button" className="challenge-complete" onClick={onComplete}>
          Route für Louis markieren
        </button>
      )}
    </div>
  );
}

const driveLabels: Record<DriveControlId, string> = {
  power: "Hauptstrom trennen",
  mount: "Haltering öffnen",
  coil: "Impulsspule einsetzen",
  couple: "Leistungskabel koppeln"
};

const driveSuccess: Record<DriveControlId, string> = {
  power: "Die Seitentriebwerke sind jetzt spannungsfrei.",
  mount: "Der Haltering ist frei.",
  coil: "Die Spule sitzt sauber in der Aufnahme.",
  couple: "Leistung liegt an. Die Impulsspule antwortet."
};

function DriveUpgradeChallenge({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<DriveControlId[]>([]);
  const [message, setMessage] = useState(
    "Rika stellt die Impulsspule neben das offene Triebwerksmodul. Keine Schrittfolge ist markiert."
  );
  const { reaction, clear, trigger } = useFailureReaction();

  const run = (control: DriveControlId) => {
    if (completed.includes(control)) return;

    if (!driveControlCanRun(completed, control)) {
      const reaction: CinderFailureReactionData =
        control === "coil"
          ? {
              kind: "coil-kickback",
              title: "Die Spule schlägt zurück!",
              text: "Das Magnetfeld packt die lose Spule und drückt sie aus der Aufnahme."
            }
          : control === "couple"
            ? {
                kind: "coil-spark",
                title: "Lichtbogen!",
                text: "Am Leistungskabel springt ein heller Funke über. Olli zieht die Hand sofort weg."
              }
            : {
                kind: "system-lock",
                title: "Mechanik blockiert",
                text: "Der Antrieb verriegelt den Schritt, weil ein vorheriger Zustand noch nicht sicher ist."
              };

      trigger(
        reaction,
        control === "couple" ? "failure-burst" : "alarm"
      );
      setMessage("Der Versuch wurde abgebrochen.");
      return;
    }

    const next = [...completed, control];
    setCompleted(next);
    setMessage(driveSuccess[control]);
    void cue(next.length === driveRequiredOrder.length ? "system-ready" : "repair-step");
  };

  const done = completed.length === driveRequiredOrder.length;

  return (
    <div className="chapter-action-challenge cinder-action-challenge">
      {reaction && <CinderFailureReaction reaction={reaction} onDone={clear} />}

      <div className="challenge-status">
        <strong>Impulsspule einbauen</strong>
        <span>{message}</span>
      </div>

      <div className="challenge-sequence challenge-sequence-unordered">
        {driveDisplayOrder.map((control) => {
          const isDone = completed.includes(control);
          return (
            <button
              type="button"
              key={control}
              className={isDone ? "done" : ""}
              disabled={isDone}
              onClick={() => run(control)}
            >
              <span aria-hidden="true">{isDone ? "✓" : "•"}</span>
              {driveLabels[control]}
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
          Triebwerk schließen
        </button>
      )}
    </div>
  );
}
