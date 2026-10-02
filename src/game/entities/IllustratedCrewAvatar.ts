import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import {
  getConceptCrewPartTexture,
  getCrewHeadTexture
} from "../assets/crewTextures";

type IllustratedCrewAvatarOptions = {
  displayScale?: number;
  primary?: boolean;
  showName?: boolean;
};

type JointName = "leftArm" | "rightArm" | "leftLeg" | "rightLeg";

const DESIGN_WIDTH = 120;
const DESIGN_HEIGHT = 220;

const JOINTS: Record<JointName, { x: number; y: number }> = {
  leftArm: { x: 30, y: 74 },
  rightArm: { x: 90, y: 74 },
  leftLeg: { x: 48, y: 126 },
  rightLeg: { x: 72, y: 126 }
};

function localFromSvg(x: number, y: number): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    x - DESIGN_WIDTH / 2,
    y - DESIGN_HEIGHT
  );
}

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
  private readonly headGlow: Phaser.GameObjects.Ellipse;
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

    this.shadow = scene.add
      .ellipse(0, 7, 82, 21, 0x000000, 0.64)
      .setScale(1.08, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        6,
        92,
        24,
        profile.accent,
        options.primary ? 0.09 : 0.018
      )
      .setStrokeStyle(
        options.primary ? 2.4 : 1,
        profile.accent,
        options.primary ? 0.72 : 0.16
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    const torsoTexture = getConceptCrewPartTexture(profile.id, "torso");
    this.torso = scene.add
      .image(0, -DESIGN_HEIGHT / 2, torsoTexture)
      .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT);

    const createJointPart = (part: JointName): Phaser.GameObjects.Container => {
      const joint = JOINTS[part];
      const localJoint = localFromSvg(joint.x, joint.y);
      const image = scene.add
        .image(
          -localJoint.x,
          -DESIGN_HEIGHT / 2 - localJoint.y,
          getConceptCrewPartTexture(profile.id, part)
        )
        .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT);

      return scene.add.container(localJoint.x, localJoint.y, [image]);
    };

    this.leftArm = createJointPart("leftArm");
    this.rightArm = createJointPart("rightArm");
    this.leftLeg = createJointPart("leftLeg");
    this.rightLeg = createJointPart("rightLeg");

    const headSize =
      profile.id === "charly"
        ? { width: 58, height: 62 }
        : profile.id === "philipp"
          ? { width: 55, height: 59 }
          : { width: 53, height: 57 };

    this.headGlow = scene.add
      .ellipse(
        0,
        -19,
        headSize.width * 1.18,
        headSize.height * 1.18,
        profile.accent,
        options.primary ? 0.11 : 0.035
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.head = scene.add
      .image(0, -20, getCrewHeadTexture(profile.id))
      .setDisplaySize(headSize.width, headSize.height);

    // The head uses the high-resolution portrait, while the suit is pure vector.
    // This keeps each child immediately recognizable without sacrificing animation.
    this.headPivot = scene.add.container(0, -157, [
      this.headGlow,
      this.head
    ]);

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
      targets: [this.headGlow, this.floorFocus],
      alpha: {
        from: options.primary ? 0.045 : 0.012,
        to: options.primary ? 0.14 : 0.052
      },
      duration: 1150 + profile.id.length * 85,
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
      Math.abs(dx) > 0.18
        ? Phaser.Math.Clamp(dx * 0.09, -3.2, 3.2)
        : 0;
  }

  updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.014 : 0.0027);

    const wave = Math.sin(this.animationPhase);
    const counterWave = Math.sin(this.animationPhase + Math.PI);
    const step = Math.abs(wave);

    if (moving) {
      this.visualRoot.y = -step * 3.4;
      this.visualRoot.angle = Phaser.Math.Linear(
        this.visualRoot.angle,
        this.movementLean * this.facing,
        0.3
      );

      this.leftArm.angle = wave * 17;
      this.rightArm.angle = counterWave * 17;
      this.leftLeg.angle = counterWave * 10;
      this.rightLeg.angle = wave * 10;
      this.headPivot.angle = -wave * 1.5;

      this.shadow.setScale(1.08 - step * 0.09, 1 - step * 0.08);
      this.floorFocus.setScale(1 + step * 0.016, 1 - step * 0.018);
      return;
    }

    const breathing = wave * 0.7;
    this.visualRoot.y = breathing;
    this.visualRoot.angle = Phaser.Math.Linear(this.visualRoot.angle, 0, 0.16);

    this.leftArm.angle = Phaser.Math.Linear(
      this.leftArm.angle,
      -2.5 + wave * 1.2,
      0.12
    );
    this.rightArm.angle = Phaser.Math.Linear(
      this.rightArm.angle,
      2.5 - wave * 1.2,
      0.12
    );
    this.leftLeg.angle = Phaser.Math.Linear(this.leftLeg.angle, -0.5, 0.14);
    this.rightLeg.angle = Phaser.Math.Linear(this.rightLeg.angle, 0.5, 0.14);
    this.headPivot.angle = wave * 0.6;

    this.torso.setScale(1, 1 + wave * 0.003);
    this.shadow.setScale(1.08 + wave * 0.01, 1 - wave * 0.01);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
