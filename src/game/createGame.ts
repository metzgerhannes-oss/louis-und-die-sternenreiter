import Phaser from "phaser";
import type { PlayerProfile } from "../domain/profiles";
import { loadAdventureState } from "../services/adventureState";
import { AdventureScene } from "./scenes/AdventureScene";
import { BootScene } from "./scenes/BootScene";
import { CinderScene } from "./scenes/CinderScene";
import { HangarScene } from "./scenes/HangarScene";

export function createGame(parent: HTMLElement, profile: PlayerProfile): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#131720",
    render: {
      antialias: true,
      roundPixels: false
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, HangarScene, CinderScene, AdventureScene]
  });

  game.registry.set("activeProfile", profile);
  game.registry.set("activeWorld", loadAdventureState().currentWorld);
  return game;
}
