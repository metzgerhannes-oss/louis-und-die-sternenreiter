import { useEffect, useState } from "react";

type LaunchSequenceProps = {
  onReturn: () => void;
};

export function LaunchSequence({ onReturn }: LaunchSequenceProps) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setComplete(true), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="launch-sequence" aria-live="polite">
      <div className="launch-stars launch-stars-a" />
      <div className="launch-stars launch-stars-b" />
      <div className="launch-hangar-frame" aria-hidden="true" />

      <div className="launch-ship" aria-hidden="true">
        <span className="launch-engine left" />
        <span className="launch-engine right" />
        <span className="launch-body" />
        <span className="launch-cockpit" />
      </div>

      <div className="launch-crew-badges" aria-label="Die gesamte Crew startet gemeinsam">
        <span>Philipp</span>
        <span>Charly</span>
        <span>Olli</span>
        <span>Louis</span>
      </div>

      <div className={complete ? "launch-copy complete" : "launch-copy"}>
        <p className="eyebrow">
          {complete ? "Kapitel 1 abgeschlossen" : "Erster Start"}
        </p>
        <h2>{complete ? "Der erste Weg" : "Kurs: Cinder"}</h2>
        <p>
          {complete
            ? "Philipp, Charly, Olli und Louis haben Hangar 3 gemeinsam verlassen. Vor ihnen liegt der erste stabile Sternenpfad."
            : "Die Haupttriebwerke zünden. Hangar 3 wird kleiner und vor der Crew öffnet sich das Sternenfeld."}
        </p>

        {complete && (
          <button type="button" onClick={onReturn}>
            Sternenkarte ansehen
          </button>
        )}
      </div>
    </section>
  );
}
