import Phaser from "phaser";
import { getCrewSpriteTexture } from "../assets/crewTextures";

export class LouisCompanion {
  readonly container: Phaser.GameObjects.Container;

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly harnessHalo: Phaser.GameObjects.Arc;
  private readonly beaconLight: Phaser.GameObjects.Arc;
  private readonly baseSpriteY = -51;

  private animationPhase = Math.PI * 0.4;
  private movementLean = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, onInteract: () => void) {
    this.shadow = scene.add.ellipse(0, 4, 46, 13, 0x000000, 0.32);

    this.glow = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture("louis"))
      .setDisplaySize(48, 112)
      .setTint(0xe4a04a)
      .setAlpha(0.15);

    this.sprite = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture("louis"))
      .setDisplaySize(45, 108);

    this.harnessHalo = scene.add
      .circle(0, -56, 14, 0xffa63c, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.beaconLight = scene.add
      .circle(16, -82, 3.4, 0x74e0e4, 1)
      .setStrokeStyle(1, 0xd8ffff, 0.82);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.harnessHalo,
      this.glow,
      this.sprite,
      this.beaconLight
    ]);

    this.container.setSize(76, 116).setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", onInteract);

    scene.tweens.add({
      targets: this.beaconLight,
      alpha: { from: 0.38, to: 1 },
      scale: { from: 0.82, to: 1.18 },
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    scene.tweens.add({
      targets: [this.glow, this.harnessHalo],
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
    const previousY = this.container.y;

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
    const dy = this.container.y - previousY;
    const moving = Math.abs(dx) > 0.18 || Math.abs(dy) > 0.18;

    this.movementLean = Phaser.Math.Clamp(dx * 0.14, -2.8, 2.8);

    if (Math.abs(dx) > 0.18) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.glow.setFlipX(facingLeft);
    }

    this.updateAnimation(delta, moving);
  }

  private updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.016 : 0.0034);

    const wave = Math.sin(this.animationPhase);
    const step = Math.abs(wave);

    if (moving) {
      const hop = step * 2.8;

      this.sprite.y = this.baseSpriteY - hop;
      this.glow.y = this.baseSpriteY - hop * 0.9;
      this.sprite.setAngle(wave * 1.1);
      this.glow.setAngle(wave * 1.1);
      this.shadow.setScale(1 - step * 0.1, 1 - step * 0.08);
      this.harnessHalo.setScale(1 + step * 0.06);
      this.container.setAngle(
        Phaser.Math.Linear(this.container.angle, this.movementLean, 0.32)
      );
      return;
    }

    const breathing = wave * 0.7;
    this.sprite.y = this.baseSpriteY + breathing;
    this.glow.y = this.baseSpriteY + breathing * 0.85;
    this.sprite.setAngle(wave * 0.26);
    this.glow.setAngle(wave * 0.26);
    this.shadow.setScale(1 + wave * 0.012, 1 - wave * 0.012);
    this.harnessHalo.setScale(1 + wave * 0.025);
    this.beaconLight.x = 16 + wave * 0.5;
    this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.18));
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
