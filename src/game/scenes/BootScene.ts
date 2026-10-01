import Phaser from "phaser";
import { loadChapter1State } from "../../services/chapter1State";
import { loadCinderState } from "../../services/cinderState";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    const chapter1 = loadChapter1State();
    const cinder = loadCinderState();

    if (chapter1.launched && !cinder.complete) {
      this.scene.start("CinderScene");
      return;
    }

    this.scene.start("HangarScene");
  }
}
