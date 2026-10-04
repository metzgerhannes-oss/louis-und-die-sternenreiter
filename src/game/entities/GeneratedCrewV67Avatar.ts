import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import {
  ensureGeneratedV67Animations,
  generatedV67IdleAnim,
  generatedV67WalkAnim,
  getGeneratedV67Texture,
  type GeneratedCrewId
} from "../assets/crewTextures";

type GeneratedCrewV67AvatarOptions = {
  displayScale?: number;
  primary?: boolean;
};

export class GeneratedCrewV67Avatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly displayScale: number;
  private readonly generatedId: GeneratedCrewId;
  private lastX: number;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    options: GeneratedCrewV67AvatarOptions = {}
  ) {
    if (profile.id === "olli") {
      throw new Error("Olli uses the dedicated V6 sprite sheet.");
    }

    this.profile = profile;
    this.generatedId = profile.id;
    this.displayScale = options.displayScale ?? 1;
    this.lastX = x;

    const ready = ensureGeneratedV67Animations(scene, this.generatedId);
    const texture = ready
      ? getGeneratedV67Texture(this.generatedId)
      : "__MISSING";

    this.shadow = scene.add
      .ellipse(0, 7, 76, 19, 0x000000, 0.62)
      .setScale(1.05, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        6,
        86,
        21,
        profile.accent,
        options.primary ? 0.08 : 0.014
      )
      .setStrokeStyle(
        options.primary ? 2.1 : 1,
        profile.accent,
        options.primary ? 0.66 : 0.14
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.sprite = scene.add
      .sprite(0, -108, texture, ready ? "v67-0" : undefined)
      .setDisplaySize(126, 216);

    const children: Phaser.GameObjects.GameObject[] = [
      this.shadow,
      this.floorFocus,
      this.sprite
    ];

    if (!ready) {
      children.push(
        scene.add
          .text(0, -112, "V6.7-ASSET FEHLT", {
            fontFamily: "system-ui, sans-serif",
            fontSize: "12px",
            fontStyle: "900",
            color: "#fff4e8",
            backgroundColor: "#a32121e8",
            padding: { x: 6, y: 4 }
          })
          .setOrigin(0.5)
      );
    }

    this.container = scene.add.container(x, y, children).setDepth(y);

    if (ready) {
      this.sprite.play(generatedV67IdleAnim(this.generatedId));
    }

    scene.tweens.add({
      targets: this.floorFocus,
      alpha: {
        from: options.primary ? 0.035 : 0.008,
        to: options.primary ? 0.11 : 0.034
      },
      duration: 1180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.setPosition(x, y);
  }

  setPosition(x: number, y: number): void {
    const dx = x - this.lastX;
    this.lastX = x;

    this.container.setPosition(x, y);
    this.container.setDepth(y);

    const perspectiveScale = Phaser.Math.Linear(
      0.92,
      1.05,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale * 0.82
    );

    if (Math.abs(dx) > 0.15) {
      this.sprite.setFlipX(dx < 0);
    }
  }

  updateAnimation(_delta: number, moving: boolean): void {
    const targetAnimation = moving
      ? generatedV67WalkAnim(this.generatedId)
      : generatedV67IdleAnim(this.generatedId);

    if (!this.sprite.scene.anims.exists(targetAnimation)) {
      if (this.sprite.texture.key !== "__MISSING") {
        this.sprite.setFrame("v67-0");
      }
      return;
    }

    if (this.sprite.anims.currentAnim?.key !== targetAnimation) {
      this.sprite.play(targetAnimation);
    }

    const progress = this.sprite.anims.getProgress();
    const step = moving
      ? Math.abs(Math.sin(progress * Math.PI * 4))
      : Math.abs(Math.sin(progress * Math.PI * 2));

    this.shadow.setScale(
      moving ? 1.05 - step * 0.08 : 1.05 + step * 0.01,
      moving ? 1 - step * 0.06 : 1
    );
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
