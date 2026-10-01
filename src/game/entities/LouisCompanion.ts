import Phaser from "phaser";

export class LouisCompanion {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, onInteract: () => void) {
    const shadow = scene.add.ellipse(0, 22, 44, 14, 0x000000, 0.25);
    const tail = scene.add
      .arc(-24, 0, 22, 30, 290, false, 0xb68d61, 0)
      .setStrokeStyle(7, 0xb68d61, 1);
    const body = scene.add.ellipse(0, 0, 46, 34, 0xc8a873).setStrokeStyle(2, 0xf0d7aa);
    const head = scene.add.circle(16, -16, 17, 0xd9bd86).setStrokeStyle(2, 0xf0d7aa);
    const earLeft = scene.add.triangle(5, -32, 0, 18, 10, 0, 18, 18, 0xa87f58);
    const earRight = scene.add.triangle(26, -33, 0, 18, 10, 0, 18, 18, 0xa87f58);
    const collar = scene.add.rectangle(15, 0, 25, 5, 0x4e9ca2).setAngle(-8);
    const eye = scene.add.circle(21, -18, 2.5, 0x201b19);

    this.container = scene.add.container(x, y, [
      shadow,
      tail,
      body,
      earLeft,
      earRight,
      head,
      collar,
      eye
    ]);
    this.container.setSize(76, 72).setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", onInteract);
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX - 62;
    const targetY = playerY + 22;
    const factor = 1 - Math.pow(0.004, delta / 1000);

    this.container.x = Phaser.Math.Linear(this.container.x, targetX, factor);
    this.container.y = Phaser.Math.Linear(this.container.y, targetY, factor);
    this.container.setDepth(this.container.y - 1);

    const perspectiveScale = Phaser.Math.Linear(
      0.78,
      1,
      Phaser.Math.Clamp((this.container.y - 280) / 420, 0, 1)
    );
    this.container.setScale(perspectiveScale);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
