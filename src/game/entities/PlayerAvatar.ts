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
  private readonly outline: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly focusPlate: Phaser.GameObjects.Ellipse;
  private readonly bootLight: Phaser.GameObjects.Ellipse;
  private readonly badge: Phaser.GameObjects.Arc;
  private readonly baseSpriteY: number;
  private readonly baseBadgeY: number;

  private animationPhase: number;
  private movementLean = 0;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    private readonly displayScale = 1,
    private readonly primary = false
  ) {
    this.profile = profile;
    this.animationPhase = phaseOffset(profile);

    const size = spriteSize(profile);
    this.baseSpriteY = -size.height * 0.5 + 2;
    this.baseBadgeY = -size.height * 0.64;

    this.shadow = scene.add
      .ellipse(0, 5, size.width * 1.02, 17, 0x000000, 0.58)
      .setScale(1.14, 1);

    this.focusPlate = scene.add
      .ellipse(
        0,
        3,
        size.width * 1.22,
        18,
        profile.accent,
        this.primary ? 0.12 : 0.045
      )
      .setStrokeStyle(
        this.primary ? 2.2 : 1.2,
        profile.accent,
        this.primary ? 0.78 : 0.3
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.outline = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width * 1.075, size.height * 1.055)
      .setTint(0x06090d)
      .setAlpha(0.92);

    this.glow = scene.add
      .image(0, this.baseSpriteY, getCrewSpriteTexture(profile.id))
      .setDisplaySize(size.width * 1.13, size.height * 1.1)
      .setTint(profile.accent)
      .setAlpha(this.primary ? 0.34 : 0.24);

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
      this.focusPlate,
      this.bootLight,
      this.glow,
      this.outline,
      this.sprite,
      this.badge
    ]);

    this.container.setDepth(y);

    scene.tweens.add({
      targets: [this.glow, this.focusPlate],
      alpha: {
        from: this.primary ? 0.2 : 0.1,
        to: this.primary ? 0.42 : 0.26
      },
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

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale
    );

    const dx = x - previousX;
    this.movementLean =
      Math.abs(dx) > 0.2 ? Phaser.Math.Clamp(dx * 0.13, -2.4, 2.4) : 0;

    if (Math.abs(dx) > 0.2) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.outline.setFlipX(facingLeft);
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
      this.outline.y = this.baseSpriteY - bob * 0.96;
      this.glow.y = this.baseSpriteY - bob * 0.92;
      this.sprite.setAngle(sway);
      this.outline.setAngle(sway);
      this.glow.setAngle(sway);
      this.badge.y = this.baseBadgeY - bob * 0.55;
      this.shadow.setScale(1.14 - step * 0.08, 1 - step * 0.1);
      this.focusPlate.setScale(1 + step * 0.025, 1 - step * 0.03);
      this.bootLight.setAlpha(0.24 + step * 0.22);
      this.container.setAngle(
        Phaser.Math.Linear(this.container.angle, this.movementLean, 0.34)
      );
      return;
    }

    const breathing = wave * 0.62;
    this.sprite.y = this.baseSpriteY + breathing;
    this.outline.y = this.baseSpriteY + breathing * 0.9;
    this.glow.y = this.baseSpriteY + breathing * 0.82;
    this.sprite.setAngle(wave * 0.22);
    this.outline.setAngle(wave * 0.22);
    this.glow.setAngle(wave * 0.22);
    this.badge.y = this.baseBadgeY + breathing * 0.42;
    this.shadow.setScale(1.14 + wave * 0.012, 1 - wave * 0.012);
    this.focusPlate.setScale(1 + wave * 0.012, 1 - wave * 0.012);
    this.bootLight.setAlpha(0.2 + (wave + 1) * 0.03);
    this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.16));
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
