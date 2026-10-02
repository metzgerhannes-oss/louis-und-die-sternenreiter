import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import {
  getCrewHeadTexture,
  getCrewPartTexture
} from "../assets/crewTextures";

type IllustratedCrewAvatarOptions = {
  displayScale?: number;
  primary?: boolean;
  showName?: boolean;
};

type Joint = { x: number; y: number };

const SOURCE_SIZE: Record<PlayerProfile["id"], { width: number; height: number }> = {
  charly: { width: 68, height: 160 },
  philipp: { width: 58, height: 160 },
  olli: { width: 53, height: 160 }
};

const JOINTS: Record<"leftArm" | "rightArm" | "leftLeg" | "rightLeg", Joint> = {
  leftArm: { x: 0.24, y: 0.3 },
  rightArm: { x: 0.76, y: 0.3 },
  leftLeg: { x: 0.4, y: 0.61 },
  rightLeg: { x: 0.6, y: 0.61 }
};

function phaseOffset(profile: PlayerProfile): number {
  if (profile.id === "charly") return Math.PI * 0.72;
  if (profile.id === "olli") return Math.PI * 1.36;
  return 0;
}

export class IllustratedCrewAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly visualRoot: Phaser.GameObjects.Container;
  private readonly torso: Phaser.GameObjects.Image;
  private readonly headPivot: Phaser.GameObjects.Container;
  private readonly head: Phaser.GameObjects.Image;
  private readonly leftArm: Phaser.GameObjects.Container;
  private readonly rightArm: Phaser.GameObjects.Container;
  private readonly leftLeg: Phaser.GameObjects.Container;
  private readonly rightLeg: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;

  private readonly displayScale: number;
  private animationPhase: number;
  private movementLean = 0;
  private facing = 1;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    options: IllustratedCrewAvatarOptions = {}
  ) {
    this.profile = profile;
    this.displayScale = options.displayScale ?? 1;
    this.animationPhase = phaseOffset(profile);

    const size = SOURCE_SIZE[profile.id];
    const imageCenterY = -size.height / 2;

    this.shadow = scene.add
      .ellipse(0, 7, size.width * 1.08, 19, 0x000000, 0.62)
      .setScale(1.08, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        6,
        size.width * 1.2,
        22,
        profile.accent,
        options.primary ? 0.085 : 0.018
      )
      .setStrokeStyle(
        options.primary ? 2.2 : 1,
        profile.accent,
        options.primary ? 0.68 : 0.16
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.torso = scene.add
      .image(0, imageCenterY, getCrewPartTexture(profile.id, "torso"))
      .setDisplaySize(size.width, size.height);

    const createJointPart = (
      part: "leftArm" | "rightArm" | "leftLeg" | "rightLeg"
    ): Phaser.GameObjects.Container => {
      const joint = JOINTS[part];
      const jointX = -size.width / 2 + size.width * joint.x;
      const jointY = -size.height + size.height * joint.y;
      const image = scene.add
        .image(-jointX, imageCenterY - jointY, getCrewPartTexture(profile.id, part))
        .setDisplaySize(size.width, size.height);
      return scene.add.container(jointX, jointY, [image]);
    };

    this.leftArm = createJointPart("leftArm");
    this.rightArm = createJointPart("rightArm");
    this.leftLeg = createJointPart("leftLeg");
    this.rightLeg = createJointPart("rightLeg");

    const headJointY = -size.height + size.height * 0.225;
    const headWidth =
      profile.id === "charly" ? 39 : profile.id === "philipp" ? 36 : 34;
    const headHeight =
      profile.id === "charly" ? 46 : profile.id === "philipp" ? 43 : 41;

    this.head = scene.add
      .image(0, -headHeight * 0.28, getCrewHeadTexture(profile.id))
      .setDisplaySize(headWidth, headHeight);

    this.headPivot = scene.add.container(0, headJointY, [this.head]);

    this.visualRoot = scene.add.container(0, 0, [
      this.leftLeg,
      this.rightLeg,
      this.torso,
      this.leftArm,
      this.rightArm,
      this.headPivot
    ]);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.floorFocus,
      this.visualRoot
    ]);
    this.container.setDepth(y);

    scene.tweens.add({
      targets: this.floorFocus,
      alpha: {
        from: options.primary ? 0.045 : 0.012,
        to: options.primary ? 0.12 : 0.045
      },
      duration: 1150 + profile.id.length * 80,
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
      0.92,
      1.06,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale
    );

    const dx = x - previousX;
    if (Math.abs(dx) > 0.18) {
      this.facing = dx < 0 ? -1 : 1;
      this.visualRoot.setScale(this.facing, 1);
    }

    this.movementLean =
      Math.abs(dx) > 0.18 ? Phaser.Math.Clamp(dx * 0.09, -3.2, 3.2) : 0;
  }

  updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.014 : 0.0028);
    const wave = Math.sin(this.animationPhase);
    const counterWave = Math.sin(this.animationPhase + Math.PI);
    const step = Math.abs(wave);

    if (moving) {
      this.visualRoot.y = -step * 3.1;
      this.visualRoot.angle = Phaser.Math.Linear(
        this.visualRoot.angle,
        this.movementLean * this.facing,
        0.3
      );

      this.leftArm.angle = wave * 16;
      this.rightArm.angle = counterWave * 16;
      this.leftLeg.angle = counterWave * 9;
      this.rightLeg.angle = wave * 9;
      this.headPivot.angle = -wave * 1.5;

      this.shadow.setScale(1.08 - step * 0.08, 1 - step * 0.07);
      this.floorFocus.setScale(1 + step * 0.016, 1 - step * 0.018);
      return;
    }

    const breathing = wave * 0.65;
    this.visualRoot.y = breathing;
    this.visualRoot.angle = Phaser.Math.Linear(this.visualRoot.angle, 0, 0.16);
    this.leftArm.angle = Phaser.Math.Linear(this.leftArm.angle, -2 + wave, 0.12);
    this.rightArm.angle = Phaser.Math.Linear(this.rightArm.angle, 2 - wave, 0.12);
    this.leftLeg.angle = Phaser.Math.Linear(this.leftLeg.angle, -0.5, 0.14);
    this.rightLeg.angle = Phaser.Math.Linear(this.rightLeg.angle, 0.5, 0.14);
    this.headPivot.angle = wave * 0.5;
    this.shadow.setScale(1.08 + wave * 0.01, 1 - wave * 0.01);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
