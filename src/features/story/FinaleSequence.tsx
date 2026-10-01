import { useState } from "react";

type FinaleSequenceProps = {
  onFinish: () => void;
};

const pages = [
  {
    eyebrow: "Kapitel 6 · Neustart",
    title: "Das Herz der Wege erwacht",
    text:
      "Ein Sternenpfad nach dem anderen leuchtet auf. Cinder, Moss, Junction 12 und die verlorenen Welten verbinden sich wieder – nicht alle gleichzeitig, sondern kontrolliert und mit den neuen Regeln der Crew."
  },
  {
    eyebrow: "Sternenformer 07 · verbunden",
    title: "Louis erinnert sich",
    text:
      "Sein Harness zeigt zum ersten Mal das vollständige alte Sternenformer-Symbol. Louis war nie dafür gedacht, allein Welten zu bestimmen. Sternenformer sollten zuhören, nachfragen, Entwürfe bauen und gemeinsam mit Reisenden entscheiden."
  },
  {
    eyebrow: "Die Sternenkarte",
    title: "Ein paar Punkte bleiben leer",
    text:
      "Zwischen den wiederhergestellten Wegen erscheinen kleine, unbeschriftete Lichtpunkte. Louis schaut lange auf die Karte und sagt: „Die sind noch leer.“ Dann wedelt er. „Gut so.“"
  },
  {
    eyebrow: "Hüter der Wege",
    title: "Die Hauptgeschichte ist abgeschlossen",
    text:
      "Philipp, Charly, Olli und Louis haben das Sternenpfad-Netz neu geordnet. Von jetzt an können sie frei reisen, den Hangar und das Schiff weiter ausbauen und Louis neue Ideen erzählen."
  }
] as const;

export function FinaleSequence({ onFinish }: FinaleSequenceProps) {
  const [page, setPage] = useState(0);
  const current = pages[page];
  const last = page === pages.length - 1;

  return (
    <section className="finale-sequence" aria-live="polite">
      <div className="finale-orbit orbit-a" aria-hidden="true" />
      <div className="finale-orbit orbit-b" aria-hidden="true" />
      <div className="finale-core" aria-hidden="true">✦</div>

      <div className="finale-card">
        <p className="eyebrow">{current.eyebrow}</p>
        <h2>{current.title}</h2>
        <p>{current.text}</p>

        {page === 2 && (
          <blockquote>
            „Die Galaxie braucht keine perfekten Karten. Sie braucht Menschen,
            die neugierig genug sind, neue Wege zu finden.“
          </blockquote>
        )}

        {last && (
          <div className="finale-crew">
            <span>Philipp</span>
            <span>Charly</span>
            <span>Olli</span>
            <span>Louis</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (last) {
              onFinish();
              return;
            }
            setPage((value) => value + 1);
          }}
        >
          {last ? "Freie Reisen starten" : "Weiter"}
        </button>
      </div>

      <p className="finale-credit">
        Louis &amp; die Sternenreiter · Hauptgeschichte Ende
      </p>
    </section>
  );
}
