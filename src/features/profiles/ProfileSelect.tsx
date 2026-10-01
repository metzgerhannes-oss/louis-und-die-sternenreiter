import { crewPortraits } from "../../domain/crewPortraits";
import { playerProfiles, type PlayerProfile } from "../../domain/profiles";

type ProfileSelectProps = {
  onSelect: (profile: PlayerProfile) => void;
};

export function ProfileSelect({ onSelect }: ProfileSelectProps) {
  return (
    <section className="profile-screen" aria-labelledby="profile-title">
      <div className="profile-intro">
        <p className="eyebrow">Louis &amp; die Sternenreiter</p>
        <h1 id="profile-title">Wen steuerst du heute?</h1>
        <p>
          Philipp, Charly, Olli und Louis reisen immer gemeinsam. Du wählst nur,
          wen du direkt spielst. Fortschritt und Reiseerinnerungen bleiben pro
          Sternenreiter getrennt.
        </p>
      </div>

      <div className="profile-grid">
        {playerProfiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className="profile-card"
            style={{ "--profile-accent": profile.accentCss } as React.CSSProperties}
            onClick={() => onSelect(profile)}
          >
            <span className="profile-avatar" aria-hidden="true">
              <img src={crewPortraits[profile.id]} alt="" />
            </span>
            <strong>{profile.displayName}</strong>
            <span>aktive Spielfigur · Crew bleibt zusammen</span>
          </button>
        ))}
      </div>

      <p className="profile-note">
        Die drei Sternenreiter und Louis bleiben in jeder Hauptmission als Crew zusammen.
      </p>
    </section>
  );
}
