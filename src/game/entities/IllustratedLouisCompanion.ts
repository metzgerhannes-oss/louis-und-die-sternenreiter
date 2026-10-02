import Phaser from "phaser";
import { getCrewSpriteTexture } from "../assets/crewTextures";

export class IllustratedLouisCompanion {
  readonly container: Phaser.GameObjects.Container;

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly silhouette: Phaser.GameObjects.Image;
  private readonly aura: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly beacon: Phaser.GameObjects.Arc;
  private readonly namePlate: Phaser.GameObjects.Text;

  private readonly baseSpriteY = -63;
  private animationPhase = Math.PI * 0.4;
  private movementLean = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onInteract: () => void,
    private readonly displayScale = 1,
    private readonly followOffsetX = -34,
    private readonly followOffsetY = 146
  ) {
    const texture = getCrewSpriteTexture("louis");

    this.shadow = scene.add.ellipse(0, 7, 84, 20, 0x000000, 0.62);

    this.aura = scene.add
      .image(0, this.baseSpriteY, texture)
      .setDisplaySize(80, 142)
      .setTint(0xe4a04a)
      .setAlpha(0.16)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.silhouette = scene.add
      .image(0, this.baseSpriteY + 1, texture)
      .setDisplaySize(76, 137)
      .setTint(0x05080d)
      .setAlpha(0.84);

    this.sprite = scene.add
      .image(0, this.baseSpriteY, texture)
      .setDisplaySize(72, 134);

    this.beacon = scene.add
      .circle(29, -91, 5, 0x74e0e4, 1)
      .setStrokeStyle(2, 0xd8ffff, 0.86);

    this.namePlate = scene.add
      .text(0, 20, "Louis", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "800",
        color: "#fff0d1",
        backgroundColor: "#071019cc",
        padding: { x: 6, y: 2 }
      })
      .setOrigin(0.5, 0);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.aura,
      this.silhouette,
      this.sprite,
      this.beacon,
      this.namePlate
    ]);

    this.container
      .setSize(96, 150)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onInteract);

    scene.tweens.add({
      targets: [this.aura, this.beacon],
      alpha: { from: 0.1, to: 0.3 },
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.setPosition(x, y);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.container.setDepth(y - 1);

    const perspectiveScale = Phaser.Math.Linear(
      0.86,
      1.02,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(perspectiveScale * this.displayScale);
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX + this.followOffsetX;
    const targetY = playerY + this.followOffsetY;
    const previousX = this.container.x;
    const previousY = this.container.y;

    const factor = 1 - Math.pow(0.006, delta / 1000);
    const nextX = Phaser.Math.Linear(this.container.x, targetX, factor);
    const nextY = Phaser.Math.Linear(this.container.y, targetY, factor);

    this.setPosition(nextX, nextY);

    const dx = this.container.x - previousX;
    const dy = this.container.y - previousY;
    const moving = Math.abs(dx) > 0.18 || Math.abs(dy) > 0.18;

    if (Math.abs(dx) > 0.18) {
      const facingLeft = dx < 0;
      this.sprite.setFlipX(facingLeft);
      this.silhouette.setFlipX(facingLeft);
      this.aura.setFlipX(facingLeft);
    }

    this.movementLean = Phaser.Math.Clamp(dx * 0.12, -3, 3);
    this.updateAnimation(delta, moving);
  }

  private updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.016 : 0.0034);

    const wave = Math.sin(this.animationPhase);
    const step = Math.abs(wave);

    if (moving) {
      const hop = step * 4;
      this.sprite.y = this.baseSpriteY - hop;
      this.silhouette.y = this.baseSpriteY + 1 - hop * 0.96;
      this.aura.y = this.baseSpriteY - hop * 0.9;

      this.sprite.setAngle(wave * 1.2);
      this.silhouette.setAngle(wave * 1.2);
      this.aura.setAngle(wave * 1.0);

      this.shadow.setScale(1 - step * 0.11, 1 - step * 0.08);
      this.container.setAngle(
        Phaser.Math.Linear(this.container.angle, this.movementLean, 0.3)
      );
      return;
    }

    const breathing = wave * 0.75;
    this.sprite.y = this.baseSpriteY + breathing;
    this.silhouette.y = this.baseSpriteY + 1 + breathing * 0.92;
    this.aura.y = this.baseSpriteY + breathing * 0.82;

    this.sprite.setAngle(wave * 0.25);
    this.silhouette.setAngle(wave * 0.25);
    this.aura.setAngle(wave * 0.18);
    this.shadow.setScale(1 + wave * 0.012, 1 - wave * 0.012);
    this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.18));
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
