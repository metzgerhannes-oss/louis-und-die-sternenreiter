import Phaser from "phaser";

export class InteractionFocus {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly ring: Phaser.GameObjects.Arc;
  private readonly diamond: Phaser.GameObjects.Rectangle;
  private readonly defaultColor: number;

  constructor(scene: Phaser.Scene, color = 0xf0b45e) {
    this.scene = scene;
    this.defaultColor = color;

    this.ring = scene.add
      .circle(0, 0, 29, color, 0.035)
      .setStrokeStyle(2.5, color, 0.84);

    this.diamond = scene.add
      .rectangle(0, 0, 8, 8, color, 0.94)
      .setAngle(45)
      .setBlendMode(Phaser.BlendModes.ADD);

    const topTick = scene.add.rectangle(0, -39, 3, 10, color, 0.8);
    const bottomTick = scene.add.rectangle(0, 39, 3, 10, color, 0.8);
    const leftTick = scene.add.rectangle(-39, 0, 10, 3, color, 0.8);
    const rightTick = scene.add.rectangle(39, 0, 10, 3, color, 0.8);

    this.container = scene.add
      .container(0, 0, [
        this.ring,
        this.diamond,
        topTick,
        bottomTick,
        leftTick,
        rightTick
      ])
      .setDepth(4850)
      .setVisible(false);

    scene.tweens.add({
      targets: this.ring,
      scale: { from: 0.92, to: 1.14 },
      alpha: { from: 0.48, to: 1 },
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    scene.tweens.add({
      targets: this.diamond,
      angle: 225,
      duration: 1600,
      repeat: -1,
      ease: "Linear"
    });
  }

  show(x: number, y: number, color = this.defaultColor): void {
    this.ring.setStrokeStyle(2.5, color, 0.88).setFillStyle(color, 0.035);
    this.diamond.setFillStyle(color, 0.94);
    this.container.setPosition(x, y).setAlpha(1).setScale(1).setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  confirm(color = this.defaultColor): void {
    if (!this.container.visible) return;

    const pulse = this.scene.add
      .circle(this.container.x, this.container.y, 22, color, 0.08)
      .setStrokeStyle(3, color, 0.95)
      .setDepth(4851);

    this.scene.tweens.add({
      targets: pulse,
      scale: 2,
      alpha: 0,
      duration: 420,
      ease: "Sine.easeOut",
      onComplete: () => pulse.destroy()
    });
  }
}
