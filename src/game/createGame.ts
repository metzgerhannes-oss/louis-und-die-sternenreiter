import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { HangarScene } from "./scenes/HangarScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#131720",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, HangarScene]
  });
}
