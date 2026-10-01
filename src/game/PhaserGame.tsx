import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import type { PlayerProfile } from "../domain/profiles";
import { createGame } from "./createGame";

type PhaserGameProps = {
  profile: PlayerProfile;
};

export function PhaserGame({ profile }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = createGame(containerRef.current, profile);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [profile]);

  return <div ref={containerRef} className="phaser-root" />;
}
