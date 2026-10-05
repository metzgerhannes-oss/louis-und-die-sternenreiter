import { useEffect, useState } from "react";

export type CinderFailureReactionKind =
  | "dust-blast"
  | "ground-crack"
  | "dry-air"
  | "fan-dust"
  | "coil-kickback"
  | "coil-spark"
  | "system-lock";

export type CinderFailureReactionData = {
  kind: CinderFailureReactionKind;
  title: string;
  text: string;
};

const minDisplayMs: Record<CinderFailureReactionKind, number> = {
  "dust-blast": 2100,
  "ground-crack": 2100,
  "dry-air": 1900,
  "fan-dust": 2000,
  "coil-kickback": 2100,
  "coil-spark": 2100,
  "system-lock": 1900
};

export function CinderFailureReaction({
  reaction,
  onDone
}: {
  reaction: CinderFailureReactionData;
  onDone: () => void;
}) {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(false);
    const timer = window.setTimeout(
      () => setCanContinue(true),
      minDisplayMs[reaction.kind]
    );
    return () => window.clearTimeout(timer);
  }, [reaction.kind]);

  return (
    <div
      className={"cinder-reaction-frame cinder-reaction-" + reaction.kind}
      role="status"
      aria-live="assertive"
      aria-label={reaction.title + ". " + reaction.text}
    >
      <div className="cinder-reaction-world" aria-hidden="true">
        <span className="reaction-cinder-sun" />
        <span className="reaction-cinder-mesa reaction-cinder-mesa-a" />
        <span className="reaction-cinder-mesa reaction-cinder-mesa-b" />
        <span className="reaction-cinder-dust reaction-cinder-dust-a" />
        <span className="reaction-cinder-dust reaction-cinder-dust-b" />
        <span className="reaction-cinder-crack" />
        <span className="reaction-cinder-spark spark-a" />
        <span className="reaction-cinder-spark spark-b" />
        <span className="reaction-cinder-spark spark-c" />
        <span className="reaction-cinder-coil" />
      </div>

      <div className="reaction-copy">
        <strong>{reaction.title}</strong>
        <span>{reaction.text}</span>
        {canContinue ? (
          <button type="button" className="reaction-continue" onClick={onDone}>
            Weiter versuchen
          </button>
        ) : (
          <small className="reaction-reading-cue">Kurz anschauen …</small>
        )}
      </div>
    </div>
  );
}

export function getCinderReactionMinDisplayMs(
  kind: CinderFailureReactionKind
): number {
  return minDisplayMs[kind];
}
