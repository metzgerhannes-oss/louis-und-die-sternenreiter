import { playerProfiles, type PlayerProfile } from "../../domain/profiles";

type ProfileSelectProps = {
  onSelect: (profile: PlayerProfile) => void;
};

export function ProfileSelect({ onSelect }: ProfileSelectProps) {
  return (
    <section className="profile-screen" aria-labelledby="profile-title">
      <div className="profile-intro">
        <p className="eyebrow">Hangar 3 wartet</p>
        <h1 id="profile-title">Wer startet heute mit Louis?</h1>
        <p>
          Jeder Sternenreiter hat seinen eigenen Avatar, Fortschritt und seine eigenen
          Reiseerinnerungen.
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
              <span className="profile-avatar-head">{profile.initials}</span>
              <span className="profile-avatar-scarf" />
            </span>
            <strong>{profile.displayName}</strong>
            <span>Sternenreiter · Level 1</span>
          </button>
        ))}
      </div>

      <p className="profile-note">
        Die Avatare sind aktuell technische Platzhalter und bekommen später ihre eigene
        freigegebene Grafik.
      </p>
    </section>
  );
}
