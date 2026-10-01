import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, profile: PlayerProfile, x: number, y: number) {
    const shadow = scene.add.ellipse(0, 24, 40, 14, 0x000000, 0.28);
    const body = scene.add.rectangle(0, 0, 31, 46, profile.suit).setStrokeStyle(2, 0xd6ccb9);
    const scarf = scene.add.rectangle(0, -14, 35, 7, profile.accent).setAngle(-5);
    const head = scene.add.circle(0, -31, 17, 0xd8ad85).setStrokeStyle(2, 0xf2d7b7);
    const hair = scene.add.arc(0, -36, 16, 190, 350, false, 0x392c2a);
    const badge = scene.add.circle(7, 2, 4, profile.accent);
    const initial = scene.add
      .text(0, -32, profile.initials, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "700",
        color: "#251f20"
      })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y, [shadow, body, scarf, head, hair, badge, initial]);
    this.container.setDepth(y);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.container.setDepth(y);
    const perspectiveScale = Phaser.Math.Linear(0.82, 1.08, Phaser.Math.Clamp((y - 300) / 380, 0, 1));
    this.container.setScale(perspectiveScale);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
