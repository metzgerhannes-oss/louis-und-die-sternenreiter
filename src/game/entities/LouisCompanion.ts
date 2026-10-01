import Phaser from "phaser";
import { getCrewSpriteTexture } from "../assets/crewTextures";

export class LouisCompanion {
  readonly container: Phaser.GameObjects.Container;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, onInteract: () => void) {
    const shadow = scene.add.ellipse(0, 4, 46, 13, 0x000000, 0.32);

    this.glow = scene.add
      .image(0, -51, getCrewSpriteTexture("louis"))
      .setDisplaySize(48, 112)
      .setTint(0xe4a04a)
      .setAlpha(0.15);

    this.sprite = scene.add
      .image(0, -51, getCrewSpriteTexture("louis"))
      .setDisplaySize(45, 108);

    const harnessHalo = scene.add
      .circle(0, -56, 14, 0xffa63c, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD);

    const beaconLight = scene.add
      .circle(16, -82, 3.4, 0x74e0e4, 1)
      .setStrokeStyle(1, 0xd8ffff, 0.82);

    this.container = scene.add.container(x, y, [
      shadow,
      harnessHalo,
      this.glow,
      this.sprite,
      beaconLight
    ]);

    this.container.setSize(76, 116).setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", onInteract);

    scene.tweens.add({
      targets: beaconLight,
      alpha: { from: 0.38, to: 1 },
      scale: { from: 0.82, to: 1.18 },
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    scene.tweens.add({
      targets: [this.glow, harnessHalo],
      alpha: { from: 0.08, to: 0.2 },
      duration: 1280,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX - 62;
    const targetY = playerY + 22;
    const factor = 1 - Math.pow(0.004, delta / 1000);
    const previousX = this.container.x;

    this.container.x = Phaser.Math.Linear(this.container.x, targetX, factor);
    this.container.y = Phaser.Math.Linear(this.container.y, targetY, factor);
    this.container.setDepth(this.container.y - 1);

    const perspectiveScale = Phaser.Math.Linear(
      0.74,
      0.94,
      Phaser.Math.Clamp((this.container.y - 280) / 420, 0, 1)
    );
    this.container.setScale(perspectiveScale);

    const dx = this.container.x - previousX;
    if (Math.abs(dx) > 0.2) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.glow.setFlipX(facingLeft);
      this.container.setAngle(Phaser.Math.Clamp(dx * 0.13, -2.4, 2.4));
    } else {
      this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.2));
    }
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
