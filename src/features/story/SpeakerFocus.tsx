import { crewPortraits } from "../../domain/crewPortraits";

type SpeakerFocusProps = {
  speaker: string;
  color: string;
  subtitle?: string;
};

function portraitForSpeaker(speaker: string): string | null {
  if (speaker === "Philipp") return crewPortraits.philipp;
  if (speaker === "Charly") return crewPortraits.charly;
  if (speaker === "Olli") return crewPortraits.olli;
  if (speaker === "Louis") return crewPortraits.louis;
  return null;
}

function initials(speaker: string): string {
  return speaker
    .replace(/[^A-Za-zÄÖÜäöüß0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export function SpeakerFocus({
  speaker,
  color,
  subtitle
}: SpeakerFocusProps) {
  const portrait = portraitForSpeaker(speaker);

  return (
    <div
      className={portrait ? "speaker-focus has-portrait" : "speaker-focus npc"}
      style={{ "--speaker-focus-color": color } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="speaker-focus-portrait">
        {portrait ? (
          <img src={portrait} alt="" draggable={false} />
        ) : (
          <span>{initials(speaker)}</span>
        )}
      </div>
      <div className="speaker-focus-name">
        <strong>{speaker}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
}
