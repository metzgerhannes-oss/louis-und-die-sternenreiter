import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { getCrewSpriteTexture } from "../assets/crewTextures";

type IllustratedCrewAvatarOptions = {
  displayScale?: number;
  primary?: boolean;
  showName?: boolean;
};

function baseSize(profile: PlayerProfile): { width: number; height: number } {
  if (profile.id === "charly") return { width: 84, height: 157 };
  if (profile.id === "olli") return { width: 74, height: 143 };
  return { width: 79, height: 151 };
}

function phaseOffset(profile: PlayerProfile): number {
  if (profile.id === "charly") return Math.PI * 0.72;
  if (profile.id === "olli") return Math.PI * 1.36;
  return 0;
}

export class IllustratedCrewAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly silhouette: Phaser.GameObjects.Image;
  private readonly aura: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly namePlate?: Phaser.GameObjects.Text;

  private readonly displayScale: number;
  private readonly primary: boolean;
  private readonly baseSpriteY: number;

  private animationPhase: number;
  private movementLean = 0;
  private facing = 1;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    options: IllustratedCrewAvatarOptions = {}
  ) {
    this.profile = profile;
    this.displayScale = options.displayScale ?? 1;
    this.primary = options.primary ?? false;
    this.animationPhase = phaseOffset(profile);

    const size = baseSize(profile);
    this.baseSpriteY = -size.height * 0.5 + 3;
    const texture = getCrewSpriteTexture(profile.id);

    this.shadow = scene.add
      .ellipse(0, 8, size.width * 0.9, 20, 0x000000, 0.62)
      .setScale(1.14, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        7,
        size.width * 1.06,
        24,
        profile.accent,
        this.primary ? 0.1 : 0.025
      )
      .setStrokeStyle(
        this.primary ? 2.5 : 1,
        profile.accent,
        this.primary ? 0.78 : 0.22
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.aura = scene.add
      .image(0, this.baseSpriteY, texture)
      .setDisplaySize(size.width * 1.12, size.height * 1.08)
      .setTint(profile.accent)
      .setAlpha(this.primary ? 0.28 : 0.13)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.silhouette = scene.add
      .image(0, this.baseSpriteY + 1, texture)
      .setDisplaySize(size.width * 1.06, size.height * 1.035)
      .setTint(0x05080d)
      .setAlpha(0.84);

    this.sprite = scene.add
      .image(0, this.baseSpriteY, texture)
      .setDisplaySize(size.width, size.height);

    const children: Phaser.GameObjects.GameObject[] = [
      this.shadow,
      this.floorFocus,
      this.aura,
      this.silhouette,
      this.sprite
    ];

    if (options.showName !== false) {
      this.namePlate = scene.add
        .text(0, 21, profile.displayName, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          fontStyle: "800",
          color: "#f4efe4",
          backgroundColor: "#071019cc",
          padding: { x: 6, y: 2 }
        })
        .setOrigin(0.5, 0);
      children.push(this.namePlate);
    }

    this.container = scene.add.container(x, y, children);
    this.container.setDepth(y);

    scene.tweens.add({
      targets: [this.aura, this.floorFocus],
      alpha: {
        from: this.primary ? 0.12 : 0.04,
        to: this.primary ? 0.32 : 0.14
      },
      duration: 1200 + profile.id.length * 85,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.setPosition(x, y);
  }

  setPosition(x: number, y: number): void {
    const previousX = this.container.x;

    this.container.setPosition(x, y);
    this.container.setDepth(y);

    const perspectiveScale = Phaser.Math.Linear(
      0.88,
      1.07,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale
    );

    const dx = x - previousX;
    if (Math.abs(dx) > 0.2) {
      this.facing = dx < 0 ? -1 : 1;
      this.sprite.setFlipX(this.facing < 0);
      this.silhouette.setFlipX(this.facing < 0);
      this.aura.setFlipX(this.facing < 0);
    }

    this.movementLean =
      Math.abs(dx) > 0.2 ? Phaser.Math.Clamp(dx * 0.08, -3.1, 3.1) : 0;
  }

  updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.013 : 0.0025);

    const wave = Math.sin(this.animationPhase);
    const step = Math.abs(wave);

    if (moving) {
      const bob = step * 4.4;
      const sway = wave * 1.7;

      this.sprite.y = this.baseSpriteY - bob;
      this.silhouette.y = this.baseSpriteY + 1 - bob * 0.96;
      this.aura.y = this.baseSpriteY - bob * 0.9;

      this.sprite.setAngle(sway);
      this.silhouette.setAngle(sway);
      this.aura.setAngle(sway);

      this.sprite.setScale(1 + step * 0.01, 1 - step * 0.012);
      this.silhouette.setScale(1 + step * 0.01, 1 - step * 0.012);
      this.aura.setScale(1 + step * 0.018, 1 - step * 0.006);

      this.shadow.setScale(1.14 - step * 0.11, 1 - step * 0.08);
      this.floorFocus.setScale(1.02 + step * 0.02, 1 - step * 0.025);
      this.container.setAngle(
        Phaser.Math.Linear(this.container.angle, this.movementLean, 0.3)
      );
      return;
    }

    const breathing = wave * 0.8;
    this.sprite.y = this.baseSpriteY + breathing;
    this.silhouette.y = this.baseSpriteY + 1 + breathing * 0.92;
    this.aura.y = this.baseSpriteY + breathing * 0.82;

    this.sprite.setAngle(wave * 0.24);
    this.silhouette.setAngle(wave * 0.24);
    this.aura.setAngle(wave * 0.18);

    this.sprite.setScale(1, 1 + wave * 0.004);
    this.silhouette.setScale(1, 1 + wave * 0.004);
    this.aura.setScale(1 + wave * 0.008, 1 + wave * 0.006);

    this.shadow.setScale(1.14 + wave * 0.012, 1 - wave * 0.012);
    this.floorFocus.setScale(1 + wave * 0.01, 1 - wave * 0.01);
    this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.16));
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
