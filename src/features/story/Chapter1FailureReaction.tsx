import { useEffect, useState } from "react";

export type FailureReactionKind =
  | "energy-low"
  | "energy-overheat"
  | "energy-lock"
  | "coolant-burst"
  | "seal-slip"
  | "clamp-kickback"
  | "navigation-glitch"
  | "system-abort"
  | "launch-abort";

export type FailureReaction = {
  kind: FailureReactionKind;
  title: string;
  text: string;
};

type FailureReactionSpec = {
  image: string;
  className: string;
  minDisplayMs: number;
};

const base = import.meta.env.BASE_URL;

export const failureReactionSpecs: Record<FailureReactionKind, FailureReactionSpec> = {
  "energy-low": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-low",
    minDisplayMs: 1800
  },
  "energy-overheat": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-overheat",
    minDisplayMs: 2000
  },
  "energy-lock": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-lock",
    minDisplayMs: 1800
  },
  "coolant-burst": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-coolant-burst",
    minDisplayMs: 2000
  },
  "seal-slip": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-seal-slip",
    minDisplayMs: 1800
  },
  "clamp-kickback": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-clamp-kickback",
    minDisplayMs: 1900
  },
  "navigation-glitch": {
    image: `${base}assets/scenes/hangar/hangar-navigation-v4.webp`,
    className: "reaction-navigation-glitch",
    minDisplayMs: 1900
  },
  "system-abort": {
    image: `${base}assets/scenes/hangar/hangar-systemtest-v4.webp`,
    className: "reaction-system-abort",
    minDisplayMs: 1800
  },
  "launch-abort": {
    image: `${base}assets/scenes/hangar/hangar-gate-open-v7.webp`,
    className: "reaction-launch-abort",
    minDisplayMs: 1900
  }
};

export function Chapter1FailureReaction({
  reaction,
  onDone
}: {
  reaction: FailureReaction;
  onDone: () => void;
}) {
  const spec = failureReactionSpecs[reaction.kind];

  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(false);
    const timer = window.setTimeout(() => setCanContinue(true), spec.minDisplayMs);
    return () => window.clearTimeout(timer);
  }, [reaction.kind, spec.minDisplayMs]);

  return (
    <div
      className={`challenge-reaction-frame ${spec.className}`}
      role="status"
      aria-live="assertive"
      aria-label={`${reaction.title}. ${reaction.text}`}
    >
      <img src={spec.image} alt="" draggable={false} />
      <div className="reaction-vfx" aria-hidden="true">
        <span className="reaction-flash" />
        <span className="reaction-burst" />
        <span className="reaction-smoke reaction-smoke-a" />
        <span className="reaction-smoke reaction-smoke-b" />
        <span className="reaction-spray reaction-spray-a" />
        <span className="reaction-spray reaction-spray-b" />
        <span className="reaction-arc reaction-arc-a" />
        <span className="reaction-arc reaction-arc-b" />
        <span className="reaction-glitch reaction-glitch-a" />
        <span className="reaction-glitch reaction-glitch-b" />
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
