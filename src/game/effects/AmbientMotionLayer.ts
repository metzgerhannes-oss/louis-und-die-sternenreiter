import Phaser from "phaser";
import type { AdventureWorldId } from "../../domain/adventure";

export type AtmospherePreset = "hangar" | "cinder" | AdventureWorldId;

type MotionTuning = {
  farShiftX: number;
  farShiftY: number;
  nearShiftX: number;
  nearShiftY: number;
};

const tuning: Record<AtmospherePreset, MotionTuning> = {
  hangar: { farShiftX: 5, farShiftY: 2.5, nearShiftX: 11, nearShiftY: 5 },
  cinder: { farShiftX: 6, farShiftY: 3, nearShiftX: 14, nearShiftY: 6 },
  moss: { farShiftX: 5, farShiftY: 4, nearShiftX: 12, nearShiftY: 8 },
  "junction-12": { farShiftX: 4, farShiftY: 2, nearShiftX: 10, nearShiftY: 5 },
  "empty-path": { farShiftX: 7, farShiftY: 4, nearShiftX: 15, nearShiftY: 7 },
  distortion: { farShiftX: 8, farShiftY: 5, nearShiftX: 18, nearShiftY: 9 },
  "glass-coast": { farShiftX: 5, farShiftY: 3, nearShiftX: 13, nearShiftY: 6 },
  "cloud-ocean": { farShiftX: 8, farShiftY: 4, nearShiftX: 17, nearShiftY: 8 },
  "scrap-ring": { farShiftX: 6, farShiftY: 3, nearShiftX: 14, nearShiftY: 7 },
  "heart-of-ways": { farShiftX: 5, farShiftY: 5, nearShiftX: 12, nearShiftY: 10 }
};

export class AmbientMotionLayer {
  private readonly scene: Phaser.Scene;
  private readonly far: Phaser.GameObjects.Container;
  private readonly near: Phaser.GameObjects.Container;
  private readonly settings: MotionTuning;
  private elapsed = 0;

  constructor(scene: Phaser.Scene, preset: AtmospherePreset) {
    this.scene = scene;
    this.settings = tuning[preset];
    this.far = scene.add.container(0, 0).setDepth(2);
    this.near = scene.add.container(0, 0).setDepth(34);

    this.build(preset);
  }

  update(playerX: number, playerY: number, delta: number): void {
    const { width, height } = this.scene.scale;
    if (width <= 0 || height <= 0) return;

    this.elapsed += delta;

    const nx = Phaser.Math.Clamp((playerX / width - 0.5) * 2, -1, 1);
    const ny = Phaser.Math.Clamp((playerY / height - 0.62) * 2, -1, 1);

    const farTargetX = -nx * this.settings.farShiftX;
    const farTargetY = -ny * this.settings.farShiftY;
    const nearTargetX = -nx * this.settings.nearShiftX;
    const nearTargetY = -ny * this.settings.nearShiftY;

    const easing = 1 - Math.pow(0.001, delta / 1000);

    this.far.x = Phaser.Math.Linear(this.far.x, farTargetX, easing);
    this.far.y = Phaser.Math.Linear(this.far.y, farTargetY, easing);
    this.near.x = Phaser.Math.Linear(this.near.x, nearTargetX, easing);
    this.near.y = Phaser.Math.Linear(this.near.y, nearTargetY, easing);

    this.near.rotation = Math.sin(this.elapsed * 0.00035) * 0.0025;
  }

  private build(preset: AtmospherePreset): void {
    switch (preset) {
      case "hangar":
        this.buildHangar();
        break;
      case "cinder":
        this.buildCinder();
        break;
      case "moss":
        this.buildMoss();
        break;
      case "junction-12":
        this.buildJunction();
        break;
      case "empty-path":
        this.buildEmptyPath();
        break;
      case "distortion":
        this.buildDistortion();
        break;
      case "glass-coast":
        this.buildGlassCoast();
        break;
      case "cloud-ocean":
        this.buildCloudOcean();
        break;
      case "scrap-ring":
        this.buildScrapRing();
        break;
      case "heart-of-ways":
        this.buildHeart();
        break;
    }
  }

  private buildHangar(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 14; i += 1) {
      const mote = this.scene.add
        .circle(
          width * (((i * 37 + 11) % 97) / 100),
          height * (0.18 + (((i * 23) % 63) / 100)),
          1.3 + (i % 3) * 0.7,
          i % 4 === 0 ? 0xe1a45a : 0xb9d3d5,
          0.1 + (i % 4) * 0.035
        );

      this.far.add(mote);
      this.scene.tweens.add({
        targets: mote,
        y: mote.y - 12 - (i % 5) * 5,
        alpha: { from: mote.alpha, to: 0.02 },
        duration: 2500 + i * 140,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    for (let i = 0; i < 4; i += 1) {
      const cable = this.scene.add
        .rectangle(
          width * (0.06 + i * 0.3),
          height * 0.72,
          5 + (i % 2) * 2,
          height * (0.19 + (i % 3) * 0.04),
          0x111a21,
          0.3
        )
        .setAngle(i % 2 === 0 ? -6 : 7);

      this.near.add(cable);
      this.scene.tweens.add({
        targets: cable,
        angle: cable.angle + (i % 2 === 0 ? 2.3 : -2.3),
        duration: 2200 + i * 350,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private buildCinder(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 17; i += 1) {
      const streak = this.scene.add
        .ellipse(
          width * (((i * 31 + 7) % 101) / 100),
          height * (0.2 + (((i * 19) % 66) / 100)),
          28 + (i % 5) * 18,
          3 + (i % 2) * 2,
          0xf1ad73,
          0.035 + (i % 4) * 0.018
        )
        .setAngle(-5 + (i % 3) * 4);

      (i % 3 === 0 ? this.near : this.far).add(streak);

      this.scene.tweens.add({
        targets: streak,
        x: streak.x + width * (0.05 + (i % 3) * 0.025),
        alpha: { from: streak.alpha, to: 0.01 },
        duration: 2200 + i * 115,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private buildMoss(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 18; i += 1) {
      const glow = this.scene.add
        .circle(
          width * (((i * 29 + 9) % 97) / 100),
          height * (0.2 + (((i * 17) % 68) / 100)),
          2 + (i % 3),
          i % 2 ? 0x86e1b0 : 0xb3f5dc,
          0.16 + (i % 4) * 0.05
        )
        .setBlendMode(Phaser.BlendModes.ADD);

      (i % 4 === 0 ? this.near : this.far).add(glow);

      this.scene.tweens.add({
        targets: glow,
        x: glow.x + (i % 2 ? 9 : -9),
        y: glow.y - 12 - (i % 4) * 5,
        alpha: { from: glow.alpha * 0.55, to: glow.alpha },
        duration: 1600 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private buildJunction(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 14; i += 1) {
      const light = this.scene.add
        .rectangle(
          width * (((i * 41 + 3) % 97) / 100),
          height * (0.18 + (((i * 13) % 63) / 100)),
          4 + (i % 3) * 2,
          2 + (i % 2),
          i % 2 ? 0x6bd4e1 : 0xf0a550,
          0.3 + (i % 3) * 0.12
        )
        .setBlendMode(Phaser.BlendModes.ADD);

      this.far.add(light);
      this.scene.tweens.add({
        targets: light,
        alpha: { from: 0.12, to: 0.72 },
        duration: 620 + i * 95,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private buildEmptyPath(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 20; i += 1) {
      const star = this.scene.add
        .circle(
          width * (((i * 47 + 5) % 101) / 100),
          height * (0.12 + (((i * 31) % 76) / 100)),
          1 + (i % 4) * 0.6,
          i % 3 === 0 ? 0x9fe5ee : 0xf3ebd8,
          0.18 + (i % 4) * 0.08
        );

      this.far.add(star);
      this.scene.tweens.add({
        targets: star,
        alpha: { from: 0.08, to: star.alpha },
        scale: { from: 0.8, to: 1.25 },
        duration: 1700 + i * 110,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private buildDistortion(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 12; i += 1) {
      const bar = this.scene.add
        .rectangle(
          width * (((i * 43 + 7) % 101) / 100),
          height * (0.18 + (((i * 23) % 68) / 100)),
          28 + (i % 5) * 14,
          2 + (i % 2) * 2,
          i % 2 ? 0xe36bc6 : 0x6fd5dd,
          0.1 + (i % 4) * 0.05
        )
        .setAngle(i % 2 ? -9 : 7);

      (i % 3 === 0 ? this.near : this.far).add(bar);

      this.scene.tweens.add({
        targets: bar,
        x: bar.x + (i % 2 ? 16 : -16),
        alpha: { from: 0.03, to: 0.34 },
        duration: 520 + i * 70,
        yoyo: true,
        repeat: -1,
        ease: "Stepped"
      });
    }
  }

  private buildGlassCoast(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 16; i += 1) {
      const shard = this.scene.add
        .star(
          width * (((i * 37 + 13) % 97) / 100),
          height * (0.18 + (((i * 21) % 68) / 100)),
          4,
          1.5 + (i % 2),
          4 + (i % 3) * 1.5,
          i % 2 ? 0x9fe8ef : 0xf0d9ff,
          0.08 + (i % 4) * 0.05
        )
        .setBlendMode(Phaser.BlendModes.ADD);

      (i % 5 === 0 ? this.near : this.far).add(shard);
      this.scene.tweens.add({
        targets: shard,
        angle: 120,
        alpha: { from: 0.05, to: 0.42 },
        duration: 1900 + i * 120,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private buildCloudOcean(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 9; i += 1) {
      const cloud = this.scene.add
        .ellipse(
          width * (((i * 31 + 5) % 101) / 100),
          height * (0.18 + (((i * 19) % 68) / 100)),
          90 + (i % 4) * 42,
          20 + (i % 3) * 9,
          0xffffff,
          0.035 + (i % 4) * 0.018
        );

      (i % 3 === 0 ? this.near : this.far).add(cloud);
      this.scene.tweens.add({
        targets: cloud,
        x: cloud.x + 22 + (i % 3) * 9,
        duration: 3200 + i * 210,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private buildScrapRing(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 15; i += 1) {
      const scrap = this.scene.add
        .rectangle(
          width * (((i * 37 + 17) % 101) / 100),
          height * (0.17 + (((i * 29) % 70) / 100)),
          12 + (i % 4) * 7,
          3 + (i % 3) * 3,
          i % 2 ? 0x9a7652 : 0x6e7478,
          0.1 + (i % 4) * 0.04
        )
        .setAngle((i * 29) % 180);

      (i % 4 === 0 ? this.near : this.far).add(scrap);
      this.scene.tweens.add({
        targets: scrap,
        angle: scrap.angle + (i % 2 ? 90 : -90),
        x: scrap.x + (i % 2 ? 11 : -11),
        duration: 2800 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private buildHeart(): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 16; i += 1) {
      const mote = this.scene.add
        .circle(
          width * (((i * 41 + 7) % 97) / 100),
          height * (0.17 + (((i * 23) % 69) / 100)),
          2 + (i % 3),
          i % 2 ? 0x79d9df : 0xf0b15e,
          0.12 + (i % 4) * 0.05
        )
        .setBlendMode(Phaser.BlendModes.ADD);

      (i % 4 === 0 ? this.near : this.far).add(mote);
      this.scene.tweens.add({
        targets: mote,
        scale: { from: 0.72, to: 1.4 },
        alpha: { from: 0.06, to: 0.46 },
        duration: 1200 + i * 105,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }
}
