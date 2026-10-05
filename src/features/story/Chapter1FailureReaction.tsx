import { useEffect } from "react";

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
  durationMs: number;
};

const base = import.meta.env.BASE_URL;

export const failureReactionSpecs: Record<FailureReactionKind, FailureReactionSpec> = {
  "energy-low": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-low",
    durationMs: 1050
  },
  "energy-overheat": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-overheat",
    durationMs: 1250
  },
  "energy-lock": {
    image: `${base}assets/scenes/hangar/hangar-workbench-v4.webp`,
    className: "reaction-energy-lock",
    durationMs: 950
  },
  "coolant-burst": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-coolant-burst",
    durationMs: 1250
  },
  "seal-slip": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-seal-slip",
    durationMs: 1050
  },
  "clamp-kickback": {
    image: `${base}assets/scenes/hangar/hangar-cooling-v4.webp`,
    className: "reaction-clamp-kickback",
    durationMs: 1150
  },
  "navigation-glitch": {
    image: `${base}assets/scenes/hangar/hangar-navigation-v4.webp`,
    className: "reaction-navigation-glitch",
    durationMs: 1100
  },
  "system-abort": {
    image: `${base}assets/scenes/hangar/hangar-systemtest-v4.webp`,
    className: "reaction-system-abort",
    durationMs: 1050
  },
  "launch-abort": {
    image: `${base}assets/scenes/hangar/hangar-gate-open-v7.webp`,
    className: "reaction-launch-abort",
    durationMs: 1100
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

  useEffect(() => {
    const timer = window.setTimeout(onDone, spec.durationMs);
    return () => window.clearTimeout(timer);
  }, [onDone, spec.durationMs]);

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
      </div>
    </div>
  );
}
