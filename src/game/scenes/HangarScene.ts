import Phaser from "phaser";
import { gameEventBus } from "../EventBus";

export class HangarScene extends Phaser.Scene {
  constructor() {
    super("HangarScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x151a24)
      .setOrigin(0.5);

    this.add
      .rectangle(width * 0.5, height * 0.72, width * 0.86, height * 0.28, 0x272b31)
      .setStrokeStyle(2, 0x76583d);

    this.add
      .text(width * 0.08, height * 0.12, "HANGAR 3", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "clamp(28px, 5vw, 64px)",
        color: "#f2dfb2"
      })
      .setOrigin(0, 0.5);

    this.add
      .text(width * 0.08, height * 0.2, "Technischer Vertical-Slice · Platzhaltergrafik", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#9cc7c8"
      })
      .setOrigin(0, 0.5);

    const ship = this.add
      .rectangle(width * 0.68, height * 0.47, Math.min(360, width * 0.3), Math.min(160, height * 0.2), 0x785b46)
      .setStrokeStyle(3, 0xb88c65);

    this.add
      .text(ship.x, ship.y, "STARTSCHIFF", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#fff3df"
      })
      .setOrigin(0.5);

    const louis = this.add
      .circle(width * 0.27, height * 0.64, Math.max(34, Math.min(58, width * 0.045)), 0x4e8d91)
      .setStrokeStyle(3, 0xc7ece9)
      .setInteractive({ useHandCursor: true });

    const louisLabel = this.add
      .text(louis.x, louis.y - 74, "Louis", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#12151ccc",
        padding: { x: 10, y: 6 }
      })
      .setOrigin(0.5);

    louis.on("pointerdown", () => {
      gameEventBus.emit("interaction:louis", undefined);
    });

    const offPing = gameEventBus.on("ui:louis:ping", () => {
      louisLabel.setText("Louis · ich bin da!");
      this.time.delayedCall(1400, () => louisLabel.setText("Louis"));
    });

    this.events.once("shutdown", offPing);
    gameEventBus.emit("scene:ready", { sceneKey: this.scene.key });
  }
}
