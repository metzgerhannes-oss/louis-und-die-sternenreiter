import { useEffect, useState } from "react";
import { PhaserGame } from "../game/PhaserGame";
import { gameEventBus } from "../game/EventBus";

export function App() {
  const [scene, setScene] = useState("Boot");
  const [louisOpen, setLouisOpen] = useState(false);

  useEffect(() => {
    const offScene = gameEventBus.on("scene:ready", ({ sceneKey }) => {
      setScene(sceneKey);
    });

    const offLouis = gameEventBus.on("interaction:louis", () => {
      setLouisOpen(true);
    });

    return () => {
      offScene();
      offLouis();
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">M0 · Foundation</p>
          <h1>Louis &amp; die Sternenreiter</h1>
        </div>
        <span className="status-pill">Szene: {scene}</span>
      </header>

      <section className="game-stage" aria-label="Spielbereich">
        <PhaserGame />
      </section>

      <footer className="control-bar">
        <button type="button" onClick={() => gameEventBus.emit("ui:louis:ping", undefined)}>
          Louis rufen
        </button>
        <span>Erster technischer Hangar-Prototyp</span>
      </footer>

      {louisOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setLouisOpen(false)}>
          <section
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="louis-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Louis</p>
            <h2 id="louis-dialog-title">Ich bin da.</h2>
            <p>
              Das ist noch der technische Prototyp. Später kann Louis hier vorlesen,
              zuhören und neue Ideen für die Sternenwelt aufnehmen.
            </p>
            <div className="dialog-actions">
              <button type="button" disabled>
                Ich habe eine Idee
              </button>
              <button type="button" onClick={() => setLouisOpen(false)}>
                Schließen
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
