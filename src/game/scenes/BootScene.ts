import Phaser from "phaser";
import {
  createCircularCrewTextures,
  preloadCrewTextures
} from "../assets/crewTextures";
import { loadAdventureState } from "../../services/adventureState";
import { loadChapter1State } from "../../services/chapter1State";
import { loadCinderState } from "../../services/cinderState";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    preloadCrewTextures(this);
  }

  create(): void {
    createCircularCrewTextures(this);
    const chapter1 = loadChapter1State();
    const cinder = loadCinderState();
    const adventure = loadAdventureState();

    if (chapter1.launched && !cinder.complete) {
      this.scene.start("CinderScene");
      return;
    }

    if (cinder.complete && !adventure.mainStoryFinished) {
      this.game.registry.set("activeWorld", adventure.currentWorld);
      this.scene.start("AdventureScene");
      return;
    }

    this.scene.start("HangarScene");
  }
}
