import Phaser from "phaser";
import type { PlayerProfile } from "../domain/profiles";
import { BootScene } from "./scenes/BootScene";
import { HangarScene } from "./scenes/HangarScene";

export function createGame(parent: HTMLElement, profile: PlayerProfile): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#131720",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, HangarScene]
  });

  game.registry.set("activeProfile", profile);
  return game;
}
