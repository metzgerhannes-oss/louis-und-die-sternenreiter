import Phaser from "phaser";
import { getCrewPortraitTexture } from "../assets/crewTextures";

export class LouisCompanion {
  readonly container: Phaser.GameObjects.Container;
  private readonly portrait: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, onInteract: () => void) {
    const shadow = scene.add.ellipse(0, 24, 48, 14, 0x000000, 0.3);

    const tail = scene.add
      .arc(-25, 1, 22, 28, 300, false, 0xb7773f, 0)
      .setStrokeStyle(8, 0xb7773f, 1);

    const body = scene.add
      .ellipse(-2, 1, 48, 34, 0xb8783f)
      .setStrokeStyle(2, 0xe6b873);

    const harnessBack = scene.add
      .rectangle(-8, -1, 36, 12, 0x242f39, 0.96)
      .setStrokeStyle(2, 0xe49b36, 0.82)
      .setAngle(-4);

    const leftPack = scene.add
      .rectangle(-18, -6, 12, 22, 0x303c45)
      .setStrokeStyle(2, 0xf1a23f, 0.78)
      .setAngle(-9);
    const rightPack = scene.add
      .rectangle(8, -9, 13, 22, 0x303c45)
      .setStrokeStyle(2, 0xf1a23f, 0.78)
      .setAngle(6);

    const moduleA = scene.add
      .circle(-18, -8, 3.5, 0xffa63c, 1)
      .setStrokeStyle(1, 0xffd08a);
    const moduleB = scene.add
      .circle(9, -10, 3, 0x66d2e2, 1)
      .setStrokeStyle(1, 0xd7f7f9);

    const neckRing = scene.add
      .ellipse(13, -9, 28, 9, 0x23343e, 1)
      .setStrokeStyle(2, 0xe8a241);

    const headBack = scene.add
      .circle(17, -21, 20, 0x14202a)
      .setStrokeStyle(3, 0xe4a04a, 0.95);

    this.portrait = scene.add
      .image(17, -21, getCrewPortraitTexture("louis"))
      .setDisplaySize(36, 36);

    const beacon = scene.add
      .rectangle(-4, -23, 4, 17, 0x384751)
      .setStrokeStyle(1, 0x75dbe2);
    const beaconLight = scene.add
      .circle(-4, -33, 3.2, 0x74e0e4, 1)
      .setStrokeStyle(1, 0xd8ffff, 0.8);

    this.container = scene.add.container(x, y, [
      shadow,
      tail,
      body,
      harnessBack,
      leftPack,
      rightPack,
      moduleA,
      moduleB,
      neckRing,
      headBack,
      this.portrait,
      beacon,
      beaconLight
    ]);

    this.container.setSize(82, 76).setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", onInteract);

    scene.tweens.add({
      targets: beaconLight,
      alpha: { from: 0.4, to: 1 },
      scale: { from: 0.82, to: 1.15 },
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX - 62;
    const targetY = playerY + 22;
    const factor = 1 - Math.pow(0.004, delta / 1000);
    const previousX = this.container.x;

    this.container.x = Phaser.Math.Linear(this.container.x, targetX, factor);
    this.container.y = Phaser.Math.Linear(this.container.y, targetY, factor);
    this.container.setDepth(this.container.y - 1);

    const perspectiveScale = Phaser.Math.Linear(
      0.78,
      1,
      Phaser.Math.Clamp((this.container.y - 280) / 420, 0, 1)
    );
    this.container.setScale(perspectiveScale);

    const dx = this.container.x - previousX;
    if (Math.abs(dx) > 0.2) {
      this.portrait.setScale(dx < 0 ? -1 : 1, 1);
      this.container.setAngle(Phaser.Math.Clamp(dx * 0.2, -3, 3));
    } else {
      this.container.setAngle(Phaser.Math.Linear(this.container.angle, 0, 0.18));
    }
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
