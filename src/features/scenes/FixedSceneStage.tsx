import { crewPortraits } from "../../domain/crewPortraits";
import type { PlayerProfile } from "../../domain/profiles";

type FixedSceneStageProps = {
  profile: PlayerProfile;
  mission: string;
  stardust: number;
  onSwitchProfile: () => void;
};

export function FixedSceneStage({
  profile,
  mission,
  stardust,
  onSwitchProfile
}: FixedSceneStageProps) {
  return (
    <section className="fixed-scene-shell" aria-label="Neue Szenenbasis">
      <header className="fixed-scene-hud">
        <div className="fixed-scene-crew" aria-label="Crew">
          {(["charly", "philipp", "olli", "louis"] as const).map((id) => (
            <span
              key={id}
              className={id === profile.id ? "scene-portrait active" : "scene-portrait"}
            >
              <img src={crewPortraits[id]} alt="" />
            </span>
          ))}
        </div>

        <div className="fixed-scene-build">SCENE BASE 1</div>

        <div className="fixed-scene-stardust" aria-label={stardust + " Sternenstaub"}>
          ✦ {stardust}
        </div>
      </header>

      <div className="fixed-scene-mission">
        <span aria-hidden="true">✦</span>
        <strong>{mission}</strong>
      </div>

      <div className="fixed-scene-placeholder">
        <div className="fixed-scene-placeholder-card">
          <p className="eyebrow">Neuer Spielmodus</p>
          <h1>Hangar 3 wird als feste Szene neu aufgebaut</h1>
          <p>
            Freie Bewegung, D-Pad, Kamera-Follow und Character-Rigs sind entfernt.
            Die nächste Version besteht aus komponierten Szenen mit anklickbaren
            Gegenständen, Dialogen und sichtbaren Zustandsänderungen.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="fixed-scene-profile-button"
        onClick={onSwitchProfile}
      >
        Aktive Figur wechseln
      </button>
    </section>
  );
}
