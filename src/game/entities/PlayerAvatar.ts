import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { getCrewSpriteTexture } from "../assets/crewTextures";

function spriteSize(profile: PlayerProfile): { width: number; height: number } {
  if (profile.id === "charly") {
    return { width: 58, height: 108 };
  }

  if (profile.id === "olli") {
    return { width: 47, height: 91 };
  }

  return { width: 51, height: 99 };
}

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;
  private lastMoving = false;

  constructor(scene: Phaser.Scene, profile: PlayerProfile, x: number, y: number) {
    this.profile = profile;

    const size = spriteSize(profile);

    const shadow = scene.add
      .ellipse(0, 3, size.width * 0.78, 13, 0x000000, 0.34)
      .setScale(1.08, 1);

    this.glow = scene.add
      .image(0, -size.height * 0.5 + 2, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width * 1.09, size.height * 1.07)
      .setTint(profile.accent)
      .setAlpha(0.18);

    this.sprite = scene.add
      .image(0, -size.height * 0.5 + 2, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width, size.height);

    const bootLight = scene.add
      .ellipse(0, 0, size.width * 0.72, 6, profile.accent, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD);

    const badge = scene.add
      .circle(size.width * 0.38, -size.height * 0.64, 4, profile.accent, 0.95)
      .setStrokeStyle(1, 0xf5ead8, 0.75);

    this.container = scene.add.container(x, y, [
      shadow,
      bootLight,
      this.glow,
      this.sprite,
      badge
    ]);

    this.container.setDepth(y);

    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.1, to: 0.22 },
      duration: 1250 + profile.id.length * 80,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  setPosition(x: number, y: number): void {
    const previousX = this.container.x;
    const previousY = this.container.y;

    this.container.setPosition(x, y);
    this.container.setDepth(y);

    const perspectiveScale = Phaser.Math.Linear(
      0.82,
      1.08,
      Phaser.Math.Clamp((y - 300) / 380, 0, 1)
    );

    this.container.setScale(perspectiveScale * this.profile.scaleFactor);

    const dx = x - previousX;
    const dy = y - previousY;
    const moving = Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2;

    if (Math.abs(dx) > 0.2) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.glow.setFlipX(facingLeft);
    }

    if (moving) {
      this.container.setAngle(Phaser.Math.Clamp(dx * 0.12, -2.2, 2.2));
      if (!this.lastMoving) {
        this.sprite.y -= 1.5;
      }
    } else {
      this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.2));
      if (this.lastMoving) {
        this.sprite.y += 1.5;
      }
    }

    this.lastMoving = moving;
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
