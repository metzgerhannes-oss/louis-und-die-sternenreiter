import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { PlayerProfile } from "../domain/profiles";
import { visitAdventureWorld } from "../services/adventureState";
import { gameEventBus } from "./EventBus";
import { createGame } from "./createGame";

type PhaserGameProps = {
  profile: PlayerProfile;
};

function transitionScene(game: Phaser.Game, startNext: () => void): void {
  const activeScene = game.scene
    .getScenes(true)
    .find((scene) => scene.sys.settings.key !== "BootScene");

  const camera = activeScene?.cameras?.main;
  if (!activeScene || !camera) {
    startNext();
    return;
  }

  let started = false;
  const complete = () => {
    if (started) return;
    started = true;
    startNext();
  };

  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, complete);
  camera.fadeOut(220, 5, 9, 16);

  activeScene.time.delayedCall(300, complete);
}

export function PhaserGame({ profile }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = createGame(containerRef.current, profile);
    gameRef.current = game;

    const offGoto = gameEventBus.on("scene:goto", ({ sceneKey }) => {
      if (!game.scene.getScene(sceneKey)) return;

      transitionScene(game, () => {
        game.scene.start(sceneKey);
      });
    });

    const offWorldGoto = gameEventBus.on("world:goto", ({ worldId }) => {
      visitAdventureWorld(worldId);
      game.registry.set("activeWorld", worldId);

      transitionScene(game, () => {
        game.scene.start("AdventureScene");
        gameEventBus.emit("adventure:state-changed", undefined);
      });
    });

    return () => {
      offGoto();
      offWorldGoto();
      game.destroy(true);
      gameRef.current = null;
    };
  }, [profile]);

  return <div ref={containerRef} className="phaser-root" />;
}
