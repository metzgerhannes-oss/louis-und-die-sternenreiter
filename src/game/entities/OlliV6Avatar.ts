import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import {
  OLLI_V6_IDLE_ANIM,
  OLLI_V6_TEXTURE,
  OLLI_V6_WALK_ANIM
} from "../assets/crewTextures";

type OlliV6AvatarOptions = {
  displayScale?: number;
  primary?: boolean;
};

export class OlliV6Avatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly displayScale: number;
  private lastX: number;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    options: OlliV6AvatarOptions = {}
  ) {
    this.profile = profile;
    this.displayScale = options.displayScale ?? 1;
    this.lastX = x;

    this.shadow = scene.add
      .ellipse(0, 7, 78, 20, 0x000000, 0.62)
      .setScale(1.05, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        6,
        88,
        22,
        profile.accent,
        options.primary ? 0.08 : 0.015
      )
      .setStrokeStyle(
        options.primary ? 2.2 : 1,
        profile.accent,
        options.primary ? 0.68 : 0.14
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.sprite = scene.add
      .sprite(0, -112, OLLI_V6_TEXTURE, "v6-0")
      .setDisplaySize(130, 222);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.floorFocus,
      this.sprite
    ]);
    this.container.setDepth(y);

    if (scene.anims.exists(OLLI_V6_IDLE_ANIM)) {
      this.sprite.play(OLLI_V6_IDLE_ANIM);
    } else {
      this.sprite.setFrame("v6-0");
    }

    scene.tweens.add({
      targets: this.floorFocus,
      alpha: {
        from: options.primary ? 0.035 : 0.008,
        to: options.primary ? 0.11 : 0.035
      },
      duration: 1200,
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
      perspectiveScale * this.profile.scaleFactor * this.displayScale * 0.78
    );

    if (Math.abs(dx) > 0.15) {
      this.sprite.setFlipX(dx < 0);
    }
  }

  updateAnimation(_delta: number, moving: boolean): void {
    const targetAnimation = moving ? OLLI_V6_WALK_ANIM : OLLI_V6_IDLE_ANIM;

    if (!this.sprite.scene.anims.exists(targetAnimation)) {
      this.sprite.setFrame("v6-0");
      return;
    }

    if (this.sprite.anims.currentAnim?.key !== targetAnimation) {
      this.sprite.play(targetAnimation);
    }

    const frameProgress = this.sprite.anims.getProgress();
    const step = moving
      ? Math.abs(Math.sin(frameProgress * Math.PI * 4))
      : Math.abs(Math.sin(frameProgress * Math.PI * 2));

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
