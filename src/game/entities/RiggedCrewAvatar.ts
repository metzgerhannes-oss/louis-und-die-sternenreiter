import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { getCrewHeadTexture } from "../assets/crewTextures";

type RiggedCrewAvatarOptions = {
  displayScale?: number;
  primary?: boolean;
};

function makeRoundedPart(
  scene: Phaser.Scene,
  width: number,
  height: number,
  fill: number,
  outline = 0x090d12,
  radius = 7
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.fillStyle(outline, 0.96);
  graphics.fillRoundedRect(
    -width / 2 - 2,
    -2,
    width + 4,
    height + 4,
    radius + 2
  );
  graphics.fillStyle(fill, 1);
  graphics.fillRoundedRect(-width / 2, 0, width, height, radius);
  return graphics;
}

function makeBoot(
  scene: Phaser.Scene,
  direction: -1 | 1
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x070b10, 0.96);
  graphics.fillRoundedRect(-9, -2, 20, 13, 5);
  graphics.fillStyle(0x25313b, 1);
  graphics.fillRoundedRect(-7, 0, 16, 9, 4);
  graphics.fillStyle(0xa7c3cc, 0.52);
  graphics.fillRoundedRect(direction < 0 ? -9 : 2, 6, 12, 3, 2);
  return graphics;
}

export class RiggedCrewAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly rigRoot: Phaser.GameObjects.Container;
  private readonly torso: Phaser.GameObjects.Graphics;
  private readonly head: Phaser.GameObjects.Image;
  private readonly headHalo: Phaser.GameObjects.Ellipse;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly focusPlate: Phaser.GameObjects.Ellipse;

  private readonly leftUpperArm: Phaser.GameObjects.Container;
  private readonly rightUpperArm: Phaser.GameObjects.Container;
  private readonly leftForearm: Phaser.GameObjects.Container;
  private readonly rightForearm: Phaser.GameObjects.Container;
  private readonly leftThigh: Phaser.GameObjects.Container;
  private readonly rightThigh: Phaser.GameObjects.Container;
  private readonly leftShin: Phaser.GameObjects.Container;
  private readonly rightShin: Phaser.GameObjects.Container;

  private readonly displayScale: number;
  private readonly primary: boolean;

  private animationPhase: number;
  private movementLean = 0;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    options: RiggedCrewAvatarOptions = {}
  ) {
    this.profile = profile;
    this.displayScale = options.displayScale ?? 1;
    this.primary = options.primary ?? false;
    this.animationPhase =
      profile.id === "charly"
        ? Math.PI * 0.72
        : profile.id === "olli"
          ? Math.PI * 1.36
          : 0;

    const suit = profile.suit;
    const accent = profile.accent;
    const limbColor = Phaser.Display.Color.IntegerToColor(suit).brighten(12).color;
    const panelColor = Phaser.Display.Color.IntegerToColor(suit).brighten(24).color;

    this.shadow = scene.add
      .ellipse(0, 6, 92, 24, 0x000000, 0.62)
      .setScale(1.04, 1);

    this.focusPlate = scene.add
      .ellipse(
        0,
        5,
        105,
        28,
        accent,
        this.primary ? 0.11 : 0.035
      )
      .setStrokeStyle(
        this.primary ? 3 : 1.5,
        accent,
        this.primary ? 0.9 : 0.34
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    // Legs: large, simple shapes survive downscaling much better than tiny painted details.
    this.leftThigh = scene.add.container(-15, -65);
    this.rightThigh = scene.add.container(15, -65);

    this.leftShin = scene.add.container(0, 31);
    this.rightShin = scene.add.container(0, 31);

    const leftUpperLeg = makeRoundedPart(scene, 20, 36, limbColor, 0x080c11, 8);
    const rightUpperLeg = makeRoundedPart(scene, 20, 36, limbColor, 0x080c11, 8);
    const leftLowerLeg = makeRoundedPart(scene, 18, 34, panelColor, 0x080c11, 7);
    const rightLowerLeg = makeRoundedPart(scene, 18, 34, panelColor, 0x080c11, 7);

    const leftBoot = makeBoot(scene, -1);
    leftBoot.setPosition(-2, 29);
    const rightBoot = makeBoot(scene, 1);
    rightBoot.setPosition(2, 29);

    this.leftShin.add([leftLowerLeg, leftBoot]);
    this.rightShin.add([rightLowerLeg, rightBoot]);
    this.leftThigh.add([leftUpperLeg, this.leftShin]);
    this.rightThigh.add([rightUpperLeg, this.rightShin]);

    // Torso is intentionally broad and icon-like. The accent band preserves identity at a glance.
    this.torso = scene.add.graphics();
    this.torso.fillStyle(0x080c11, 0.98);
    this.torso.fillRoundedRect(-34, -126, 68, 68, 18);
    this.torso.fillStyle(suit, 1);
    this.torso.fillRoundedRect(-31, -123, 62, 62, 16);
    this.torso.fillStyle(panelColor, 1);
    this.torso.fillRoundedRect(-23, -116, 46, 47, 12);
    this.torso.fillStyle(accent, 0.98);
    this.torso.fillRoundedRect(-28, -94, 56, 12, 5);
    this.torso.fillStyle(0xdbe9e8, 0.72);
    this.torso.fillRoundedRect(-6, -114, 12, 6, 3);

    const harness = scene.add.graphics();
    harness.lineStyle(5, 0x131b22, 0.9);
    harness.lineBetween(-24, -118, 19, -65);
    harness.lineBetween(24, -118, -19, -65);
    harness.lineStyle(2, accent, 0.72);
    harness.lineBetween(-24, -118, 19, -65);
    harness.lineBetween(24, -118, -19, -65);

    const belt = scene.add
      .rectangle(0, -62, 55, 12, 0x151b21, 1)
      .setStrokeStyle(2, 0x65727a, 0.75);
    const beltCore = scene.add
      .rectangle(0, -62, 13, 10, accent, 0.95)
      .setStrokeStyle(1, 0xf0eadb, 0.55);

    // Arms use a two-bone chain so walking / talking can animate naturally.
    this.leftUpperArm = scene.add.container(-31, -112);
    this.rightUpperArm = scene.add.container(31, -112);
    this.leftForearm = scene.add.container(0, 29);
    this.rightForearm = scene.add.container(0, 29);

    const leftUpper = makeRoundedPart(scene, 17, 34, suit, 0x080c11, 7);
    const rightUpper = makeRoundedPart(scene, 17, 34, suit, 0x080c11, 7);
    const leftLower = makeRoundedPart(scene, 15, 31, limbColor, 0x080c11, 6);
    const rightLower = makeRoundedPart(scene, 15, 31, limbColor, 0x080c11, 6);

    const leftGlove = scene.add
      .circle(0, 31, 9, 0x1b2630, 1)
      .setStrokeStyle(2, accent, 0.76);
    const rightGlove = scene.add
      .circle(0, 31, 9, 0x1b2630, 1)
      .setStrokeStyle(2, accent, 0.76);

    this.leftForearm.add([leftLower, leftGlove]);
    this.rightForearm.add([rightLower, rightGlove]);
    this.leftUpperArm.add([leftUpper, this.leftForearm]);
    this.rightUpperArm.add([rightUpper, this.rightForearm]);

    // High-resolution portrait art becomes the head. This is the key readability upgrade:
    // the face stays large while the body remains a clean animated silhouette.
    this.headHalo = scene.add
      .ellipse(0, -151, 70, 78, accent, this.primary ? 0.2 : 0.1)
      .setStrokeStyle(this.primary ? 3 : 2, accent, this.primary ? 0.92 : 0.6)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.head = scene.add
      .image(0, -153, getCrewHeadTexture(profile.id))
      .setDisplaySize(64, 74);

    const collar = scene.add
      .ellipse(0, -120, 42, 14, 0x111920, 1)
      .setStrokeStyle(3, accent, 0.72);

    const chestBadge = scene.add
      .circle(19, -103, 8, accent, 1)
      .setStrokeStyle(2, 0xf7efdf, 0.8);

    const initials = scene.add
      .text(19, -103, profile.initials, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "8px",
        fontStyle: "900",
        color: "#081016"
      })
      .setOrigin(0.5);

    this.rigRoot = scene.add.container(0, 0, [
      this.leftThigh,
      this.rightThigh,
      this.torso,
      harness,
      belt,
      beltCore,
      this.leftUpperArm,
      this.rightUpperArm,
      collar,
      this.headHalo,
      this.head,
      chestBadge,
      initials
    ]);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.focusPlate,
      this.rigRoot
    ]);
    this.container.setDepth(y);

    scene.tweens.add({
      targets: [this.headHalo, this.focusPlate],
      alpha: {
        from: this.primary ? 0.12 : 0.045,
        to: this.primary ? 0.28 : 0.12
      },
      duration: 1250 + profile.id.length * 90,
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
      0.9,
      1.08,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale
    );

    const dx = x - previousX;
    this.movementLean =
      Math.abs(dx) > 0.2 ? Phaser.Math.Clamp(dx * 0.09, -3.5, 3.5) : 0;
  }

  updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.0125 : 0.0025);

    const wave = Math.sin(this.animationPhase);
    const counterWave = Math.sin(this.animationPhase + Math.PI);
    const step = Math.abs(wave);

    if (moving) {
      this.rigRoot.y = -step * 4;
      this.rigRoot.angle = Phaser.Math.Linear(
        this.rigRoot.angle,
        this.movementLean,
        0.32
      );

      this.leftUpperArm.angle = wave * 18;
      this.rightUpperArm.angle = counterWave * 18;
      this.leftForearm.angle = -10 - Math.max(0, wave) * 14;
      this.rightForearm.angle = 10 + Math.max(0, counterWave) * 14;

      this.leftThigh.angle = counterWave * 13;
      this.rightThigh.angle = wave * 13;
      this.leftShin.angle = Math.max(0, wave) * 16;
      this.rightShin.angle = Math.max(0, counterWave) * 16;

      this.head.angle = wave * 1.2;
      this.headHalo.angle = wave * 0.7;
      this.shadow.setScale(1.04 - step * 0.08, 1 - step * 0.1);
      return;
    }

    const breathing = wave * 1.2;
    this.rigRoot.y = breathing;
    this.rigRoot.angle = Phaser.Math.Linear(this.rigRoot.angle, 0, 0.16);

    this.leftUpperArm.angle = Phaser.Math.Linear(
      this.leftUpperArm.angle,
      -3 + wave * 1.4,
      0.14
    );
    this.rightUpperArm.angle = Phaser.Math.Linear(
      this.rightUpperArm.angle,
      3 - wave * 1.4,
      0.14
    );
    this.leftForearm.angle = Phaser.Math.Linear(this.leftForearm.angle, -6, 0.14);
    this.rightForearm.angle = Phaser.Math.Linear(this.rightForearm.angle, 6, 0.14);

    this.leftThigh.angle = Phaser.Math.Linear(this.leftThigh.angle, -1, 0.18);
    this.rightThigh.angle = Phaser.Math.Linear(this.rightThigh.angle, 1, 0.18);
    this.leftShin.angle = Phaser.Math.Linear(this.leftShin.angle, 1, 0.18);
    this.rightShin.angle = Phaser.Math.Linear(this.rightShin.angle, -1, 0.18);

    this.head.angle = wave * 0.5;
    this.headHalo.angle = -wave * 0.35;
    this.shadow.setScale(1.04 + wave * 0.012, 1 - wave * 0.012);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
