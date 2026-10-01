import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  constructor(scene: Phaser.Scene, profile: PlayerProfile, x: number, y: number) {
    this.profile = profile;

    const shadow = scene.add.ellipse(0, 24, 40, 14, 0x000000, 0.28);
    const bodyWidth = profile.id === "charly" ? 30 : 31;
    const bodyHeight = profile.id === "charly" ? 49 : 46;
    const body = scene.add
      .rectangle(0, 0, bodyWidth, bodyHeight, profile.suit)
      .setStrokeStyle(2, 0xd6ccb9);
    const scarf = scene.add.rectangle(0, -14, 35, 7, profile.accent).setAngle(-5);
    const head = scene.add.circle(0, -31, 17, 0xd8ad85).setStrokeStyle(2, 0xf2d7b7);

    const hair =
      profile.id === "charly"
        ? scene.add.ellipse(0, -34, 31, 39, 0x5a3f35).setAlpha(0.92)
        : scene.add.arc(0, -36, 16, 190, 350, false, 0x392c2a);

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

    const perspectiveScale = Phaser.Math.Linear(
      0.82,
      1.08,
      Phaser.Math.Clamp((y - 300) / 380, 0, 1)
    );

    this.container.setScale(perspectiveScale * this.profile.scaleFactor);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
