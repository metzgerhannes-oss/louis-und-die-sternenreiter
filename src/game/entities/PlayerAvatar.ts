import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { getCrewPortraitTexture } from "../assets/crewTextures";

export class PlayerAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;
  private readonly portrait: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, profile: PlayerProfile, x: number, y: number) {
    this.profile = profile;

    const shadow = scene.add
      .ellipse(0, 29, 43, 13, 0x000000, 0.32)
      .setScale(1.08, 1);

    const backPack = scene.add
      .rectangle(-12, -2, 17, 35, 0x222b33)
      .setStrokeStyle(2, profile.accent, 0.65)
      .setAngle(-4);

    const leftLeg = scene.add
      .rectangle(-8, 20, 11, 28, 0x313944)
      .setStrokeStyle(1, 0x6c7074);
    const rightLeg = scene.add
      .rectangle(8, 20, 11, 28, 0x313944)
      .setStrokeStyle(1, 0x6c7074);

    const leftBoot = scene.add
      .rectangle(-9, 35, 16, 9, 0x181d23)
      .setStrokeStyle(1, profile.accent, 0.7)
      .setAngle(-4);
    const rightBoot = scene.add
      .rectangle(9, 35, 16, 9, 0x181d23)
      .setStrokeStyle(1, profile.accent, 0.7)
      .setAngle(4);

    const bodyWidth = profile.id === "charly" ? 32 : 31;
    const bodyHeight = profile.id === "charly" ? 48 : 45;
    const body = scene.add
      .rectangle(0, 0, bodyWidth, bodyHeight, profile.suit)
      .setStrokeStyle(2, 0xb9b2a6);

    const leftPanel = scene.add
      .rectangle(-10, 2, 7, 30, profile.accent, 0.7)
      .setAngle(-4);
    const rightPanel = scene.add
      .rectangle(10, 4, 5, 26, 0x202730, 0.9)
      .setAngle(4);

    const belt = scene.add
      .rectangle(0, 15, 35, 5, 0x1b2026)
      .setStrokeStyle(1, 0x9d7c4a);
    const buckle = scene.add
      .rectangle(0, 15, 7, 7, 0xc49043)
      .setStrokeStyle(1, 0xf0c16b);

    const scarf = scene.add
      .rectangle(0, -15, 36, 8, profile.accent)
      .setAngle(-5);

    const harnessLeft = scene.add
      .line(0, 0, -12, -14, 4, 13, 0x222830, 1)
      .setLineWidth(3);
    const harnessRight = scene.add
      .line(0, 0, 12, -14, -4, 13, 0x222830, 1)
      .setLineWidth(3);

    const shoulderLight = scene.add
      .circle(11, -7, 3.3, profile.accent, 1)
      .setStrokeStyle(1, 0xece3d0, 0.65);

    const headBack = scene.add
      .circle(0, -33, 20, 0x111820)
      .setStrokeStyle(3, profile.accent, 0.9);

    const textureKey = getCrewPortraitTexture(profile.id);
    this.portrait = scene.add
      .image(0, -33, textureKey)
      .setDisplaySize(36, 36);

    const comms = scene.add
      .rectangle(18, -30, 4, 12, 0x303943)
      .setStrokeStyle(1, profile.accent, 0.8);

    const chestBadge = scene.add
      .circle(8, 5, 4, profile.accent)
      .setStrokeStyle(1, 0xf4e8d0, 0.7);

    this.container = scene.add.container(x, y, [
      shadow,
      backPack,
      leftLeg,
      rightLeg,
      leftBoot,
      rightBoot,
      body,
      leftPanel,
      rightPanel,
      harnessLeft,
      harnessRight,
      belt,
      buckle,
      scarf,
      shoulderLight,
      headBack,
      this.portrait,
      comms,
      chestBadge
    ]);

    this.container.setDepth(y);
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
    if (Math.abs(dx) > 0.2) {
      const facing = dx < 0 ? -1 : 1;
      this.portrait.setScale(facing, 1);
      this.container.setAngle(Phaser.Math.Clamp(dx * 0.16, -2.5, 2.5));
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
