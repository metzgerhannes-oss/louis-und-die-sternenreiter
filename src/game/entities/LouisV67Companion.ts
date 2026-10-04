import Phaser from "phaser";
import {
  ensureGeneratedV67Animations,
  generatedV67IdleAnim,
  generatedV67WalkAnim,
  getGeneratedV67Texture
} from "../assets/crewTextures";

export class LouisV67Companion {
  readonly container: Phaser.GameObjects.Container;

  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly beacon: Phaser.GameObjects.Arc;
  private lastX: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onInteract: () => void,
    private readonly displayScale = 1,
    private readonly followOffsetX = -34,
    private readonly followOffsetY = 146
  ) {
    this.lastX = x;
    const ready = ensureGeneratedV67Animations(scene, "louis");
    const texture = ready ? getGeneratedV67Texture("louis") : "__MISSING";

    this.shadow = scene.add
      .ellipse(0, 7, 78, 20, 0x000000, 0.62)
      .setScale(1.05, 1);

    this.floorFocus = scene.add
      .ellipse(0, 6, 88, 22, 0xe4a04a, 0.024)
      .setStrokeStyle(1.2, 0xe4a04a, 0.19)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.sprite = scene.add
      .sprite(0, -105, texture, ready ? "v67-0" : undefined)
      .setDisplaySize(124, 210);

    this.beacon = scene.add
      .circle(22, -97, 4.5, 0x74e0e4, 1)
      .setStrokeStyle(1.5, 0xd8ffff, 0.88)
      .setBlendMode(Phaser.BlendModes.ADD);

    const children: Phaser.GameObjects.GameObject[] = [
      this.shadow,
      this.floorFocus,
      this.sprite,
      this.beacon
    ];

    if (!ready) {
      children.push(
        scene.add
          .text(0, -108, "LOUIS V6.7 FEHLT", {
            fontFamily: "system-ui, sans-serif",
            fontSize: "11px",
            fontStyle: "900",
            color: "#fff4e8",
            backgroundColor: "#a32121e8",
            padding: { x: 6, y: 4 }
          })
          .setOrigin(0.5)
      );
    }

    this.container = scene.add.container(x, y, children);
    this.container
      .setSize(102, 166)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onInteract);

    if (ready) {
      this.sprite.play(generatedV67IdleAnim("louis"));
    }

    scene.tweens.add({
      targets: [this.floorFocus, this.beacon],
      alpha: { from: 0.06, to: 0.28 },
      duration: 900,
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
    this.container.setDepth(y - 1);

    const perspectiveScale = Phaser.Math.Linear(
      0.9,
      1.03,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(perspectiveScale * this.displayScale * 0.9);

    if (Math.abs(dx) > 0.15) {
      this.sprite.setFlipX(dx < 0);
    }
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX + this.followOffsetX;
    const targetY = playerY + this.followOffsetY;
    const previousX = this.container.x;
    const previousY = this.container.y;

    const factor = 1 - Math.pow(0.006, delta / 1000);
    this.setPosition(
      Phaser.Math.Linear(this.container.x, targetX, factor),
      Phaser.Math.Linear(this.container.y, targetY, factor)
    );

    const dx = this.container.x - previousX;
    const dy = this.container.y - previousY;
    const moving = Math.abs(dx) > 0.18 || Math.abs(dy) > 0.18;
    const targetAnimation = moving
      ? generatedV67WalkAnim("louis")
      : generatedV67IdleAnim("louis");

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
