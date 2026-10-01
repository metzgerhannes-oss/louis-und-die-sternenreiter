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

function phaseOffset(profile: PlayerProfile): number {
  if (profile.id === "charly") return Math.PI * 0.72;
  if (profile.id === "olli") return Math.PI * 1.36;
  return 0;
}

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly bootLight: Phaser.GameObjects.Ellipse;
  private readonly badge: Phaser.GameObjects.Arc;
  private readonly baseSpriteY: number;
  private readonly baseBadgeY: number;

  private animationPhase: number;
  private movementLean = 0;

  constructor(scene: Phaser.Scene, profile: PlayerProfile, x: number, y: number) {
    this.profile = profile;
    this.animationPhase = phaseOffset(profile);

    const size = spriteSize(profile);
    this.baseSpriteY = -size.height * 0.5 + 2;
    this.baseBadgeY = -size.height * 0.64;

    this.shadow = scene.add
      .ellipse(0, 3, size.width * 0.78, 13, 0x000000, 0.34)
      .setScale(1.08, 1);

    this.glow = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width * 1.09, size.height * 1.07)
      .setTint(profile.accent)
      .setAlpha(0.18);

    this.sprite = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width, size.height);

    this.bootLight = scene.add
      .ellipse(0, 0, size.width * 0.72, 6, profile.accent, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.badge = scene.add
      .circle(size.width * 0.38, this.baseBadgeY, 4, profile.accent, 0.95)
      .setStrokeStyle(1, 0xf5ead8, 0.75);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.bootLight,
      this.glow,
      this.sprite,
      this.badge
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

    this.container.setPosition(x, y);
    this.container.setDepth(y);

    const perspectiveScale = Phaser.Math.Linear(
      0.82,
      1.08,
      Phaser.Math.Clamp((y - 300) / 380, 0, 1)
    );

    this.container.setScale(perspectiveScale * this.profile.scaleFactor);

    const dx = x - previousX;
    this.movementLean = Phaser.Math.Clamp(dx * 0.13, -2.4, 2.4);

    if (Math.abs(dx) > 0.2) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.glow.setFlipX(facingLeft);
    }
  }

  updateAnimation(delta: number, moving: boolean): void {
    const speed = moving ? 0.0135 : 0.0026;
    this.animationPhase += delta * speed;

    const wave = Math.sin(this.animationPhase);
    const step = Math.abs(wave);

    if (moving) {
      const bob = step * 3.2;
      const sway = wave * 1.45;

      this.sprite.y = this.baseSpriteY - bob;
      this.glow.y = this.baseSpriteY - bob * 0.92;
      this.sprite.setAngle(sway);
      this.glow.setAngle(sway);
      this.badge.y = this.baseBadgeY - bob * 0.55;
      this.shadow.setScale(1.08 - step * 0.08, 1 - step * 0.1);
      this.bootLight.setAlpha(0.2 + step * 0.2);
      this.container.setAngle(
        Phaser.Math.Linear(this.container.angle, this.movementLean, 0.34)
      );
      return;
    }

    const breathing = wave * 0.62;
    this.sprite.y = this.baseSpriteY + breathing;
    this.glow.y = this.baseSpriteY + breathing * 0.82;
    this.sprite.setAngle(wave * 0.22);
    this.glow.setAngle(wave * 0.22);
    this.badge.y = this.baseBadgeY + breathing * 0.42;
    this.shadow.setScale(1.08 + wave * 0.012, 1 - wave * 0.012);
    this.bootLight.setAlpha(0.16 + (wave + 1) * 0.025);
    this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.16));
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
