import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import type { PlayerProfile } from "../domain/profiles";
import { gameEventBus } from "./EventBus";
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

    const game = createGame(containerRef.current, profile);
    gameRef.current = game;

    const offGoto = gameEventBus.on("scene:goto", ({ sceneKey }) => {
      if (game.scene.getScene(sceneKey)) {
        game.scene.start(sceneKey);
      }
    });

    return () => {
      offGoto();
      game.destroy(true);
      gameRef.current = null;
    };
  }, [profile]);

  return <div ref={containerRef} className="phaser-root" />;
}
