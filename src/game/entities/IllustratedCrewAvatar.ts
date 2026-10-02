import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import {
  getCrewHeadTexture,
  getCrewRigFrame,
  getCrewSpriteTexture
} from "../assets/crewTextures";

type IllustratedCrewAvatarOptions = {
  displayScale?: number;
  primary?: boolean;
  showName?: boolean;
};

type NormalizedCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Joint = {
  x: number;
  y: number;
};

const SOURCE_SIZE: Record<PlayerProfile["id"], { width: number; height: number }> = {
  charly: { width: 68, height: 160 },
  philipp: { width: 58, height: 160 },
  olli: { width: 53, height: 160 }
};

const CROPS: Record<
  "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg",
  NormalizedCrop
> = {
  torso: { x: 0.2, y: 0.25, width: 0.6, height: 0.48 },
  leftArm: { x: 0, y: 0.27, width: 0.44, height: 0.49 },
  rightArm: { x: 0.56, y: 0.27, width: 0.44, height: 0.49 },
  leftLeg: { x: 0.12, y: 0.6, width: 0.5, height: 0.4 },
  rightLeg: { x: 0.38, y: 0.6, width: 0.5, height: 0.4 }
};

const JOINTS: Record<"leftArm" | "rightArm" | "leftLeg" | "rightLeg", Joint> = {
  leftArm: { x: 0.27, y: 0.34 },
  rightArm: { x: 0.73, y: 0.34 },
  leftLeg: { x: 0.42, y: 0.62 },
  rightLeg: { x: 0.58, y: 0.62 }
};

function phaseOffset(profile: PlayerProfile): number {
  if (profile.id === "charly") return Math.PI * 0.72;
  if (profile.id === "olli") return Math.PI * 1.36;
  return 0;
}

function localCenter(
  sourceWidth: number,
  sourceHeight: number,
  crop: NormalizedCrop
): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    -sourceWidth / 2 + sourceWidth * (crop.x + crop.width / 2),
    -sourceHeight + sourceHeight * (crop.y + crop.height / 2)
  );
}

function localJoint(
  sourceWidth: number,
  sourceHeight: number,
  joint: Joint
): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    -sourceWidth / 2 + sourceWidth * joint.x,
    -sourceHeight + sourceHeight * joint.y
  );
}

export class IllustratedCrewAvatar {
  readonly container: Phaser.GameObjects.Container;
  readonly profile: PlayerProfile;

  private readonly visualRoot: Phaser.GameObjects.Container;
  private readonly torso: Phaser.GameObjects.Image;
  private readonly headPivot: Phaser.GameObjects.Container;
  private readonly head: Phaser.GameObjects.Image;
  private readonly headHalo: Phaser.GameObjects.Ellipse;
  private readonly leftArm: Phaser.GameObjects.Container;
  private readonly rightArm: Phaser.GameObjects.Container;
  private readonly leftLeg: Phaser.GameObjects.Container;
  private readonly rightLeg: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly namePlate?: Phaser.GameObjects.Text;

  private readonly displayScale: number;
  private readonly primary: boolean;
  private readonly sourceWidth: number;
  private readonly sourceHeight: number;

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
    this.primary = options.primary ?? false;
    this.animationPhase = phaseOffset(profile);

    const size = SOURCE_SIZE[profile.id];
    this.sourceWidth = size.width;
    this.sourceHeight = size.height;
    const texture = getCrewSpriteTexture(profile.id);

    this.shadow = scene.add
      .ellipse(0, 7, size.width * 1.12, 20, 0x000000, 0.64)
      .setScale(1.08, 1);

    this.floorFocus = scene.add
      .ellipse(
        0,
        6,
        size.width * 1.25,
        24,
        profile.accent,
        this.primary ? 0.1 : 0.025
      )
      .setStrokeStyle(
        this.primary ? 2.4 : 1,
        profile.accent,
        this.primary ? 0.76 : 0.2
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    const torsoCrop = CROPS.torso;
    const torsoCenter = localCenter(size.width, size.height, torsoCrop);
    this.torso = scene.add
      .image(
        torsoCenter.x,
        torsoCenter.y,
        texture,
        getCrewRigFrame("torso")
      )
      .setDisplaySize(
        size.width * torsoCrop.width,
        size.height * torsoCrop.height
      );

    const createJointPart = (
      part: "leftArm" | "rightArm" | "leftLeg" | "rightLeg"
    ): Phaser.GameObjects.Container => {
      const crop = CROPS[part];
      const center = localCenter(size.width, size.height, crop);
      const joint = localJoint(size.width, size.height, JOINTS[part]);
      const image = scene.add
        .image(
          center.x - joint.x,
          center.y - joint.y,
          texture,
          getCrewRigFrame(part)
        )
        .setDisplaySize(size.width * crop.width, size.height * crop.height);

      return scene.add.container(joint.x, joint.y, [image]);
    };

    this.leftArm = createJointPart("leftArm");
    this.rightArm = createJointPart("rightArm");
    this.leftLeg = createJointPart("leftLeg");
    this.rightLeg = createJointPart("rightLeg");

    // Use the 256px portrait only for the face / hair. The body itself remains
    // the original approved character illustration.
    this.headHalo = scene.add
      .ellipse(
        0,
        -130,
        profile.id === "charly" ? 58 : 54,
        profile.id === "charly" ? 66 : 61,
        profile.accent,
        this.primary ? 0.12 : 0.045
      )
      .setStrokeStyle(
        this.primary ? 2 : 1,
        profile.accent,
        this.primary ? 0.65 : 0.28
      )
      .setBlendMode(Phaser.BlendModes.ADD);

    this.head = scene.add
      .image(0, -132, getCrewHeadTexture(profile.id))
      .setDisplaySize(
        profile.id === "charly" ? 62 : profile.id === "philipp" ? 58 : 56,
        profile.id === "charly" ? 66 : profile.id === "philipp" ? 63 : 61
      );

    this.headPivot = scene.add.container(0, -111, [
      this.headHalo.setPosition(0, -19),
      this.head.setPosition(0, -21)
    ]);

    this.visualRoot = scene.add.container(0, 0, [
      this.leftLeg,
      this.rightLeg,
      this.torso,
      this.leftArm,
      this.rightArm,
      this.headPivot
    ]);

    const children: Phaser.GameObjects.GameObject[] = [
      this.shadow,
      this.floorFocus,
      this.visualRoot
    ];

    if (options.showName) {
      this.namePlate = scene.add
        .text(0, 18, profile.displayName, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          fontStyle: "800",
          color: "#f4efe4",
          backgroundColor: "#071019cc",
          padding: { x: 5, y: 2 }
        })
        .setOrigin(0.5, 0);

      children.push(this.namePlate);
    }

    this.container = scene.add.container(x, y, children);
    this.container.setDepth(y);

    scene.tweens.add({
      targets: [this.headHalo, this.floorFocus],
      alpha: {
        from: this.primary ? 0.08 : 0.025,
        to: this.primary ? 0.2 : 0.08
      },
      duration: 1200 + profile.id.length * 85,
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
      1.06,
      Phaser.Math.Clamp((y - 420) / 620, 0, 1)
    );

    this.container.setScale(
      perspectiveScale * this.profile.scaleFactor * this.displayScale
    );

    const dx = x - previousX;
    if (Math.abs(dx) > 0.2) {
      this.facing = dx < 0 ? -1 : 1;
      this.visualRoot.setScale(this.facing, 1);
    }

    this.movementLean =
      Math.abs(dx) > 0.2 ? Phaser.Math.Clamp(dx * 0.08, -3.2, 3.2) : 0;
  }

  updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.0135 : 0.0027);

    const wave = Math.sin(this.animationPhase);
    const counterWave = Math.sin(this.animationPhase + Math.PI);
    const step = Math.abs(wave);

    if (moving) {
      this.visualRoot.y = -step * 3.2;
      this.visualRoot.angle = Phaser.Math.Linear(
        this.visualRoot.angle,
        this.movementLean * this.facing,
        0.28
      );

      this.leftArm.angle = wave * 18;
      this.rightArm.angle = counterWave * 18;
      this.leftLeg.angle = counterWave * 11;
      this.rightLeg.angle = wave * 11;
      this.headPivot.angle = -wave * 1.8;

      this.torso.setScale(1 + step * 0.006, 1 - step * 0.004);
      this.shadow.setScale(1.08 - step * 0.09, 1 - step * 0.08);
      this.floorFocus.setScale(1 + step * 0.018, 1 - step * 0.02);
      return;
    }

    const breathing = wave * 0.72;
    this.visualRoot.y = breathing;
    this.visualRoot.angle = Phaser.Math.Linear(this.visualRoot.angle, 0, 0.14);

    this.leftArm.angle = Phaser.Math.Linear(
      this.leftArm.angle,
      -2.5 + wave * 1.4,
      0.12
    );
    this.rightArm.angle = Phaser.Math.Linear(
      this.rightArm.angle,
      2.5 - wave * 1.4,
      0.12
    );
    this.leftLeg.angle = Phaser.Math.Linear(this.leftLeg.angle, -0.8, 0.16);
    this.rightLeg.angle = Phaser.Math.Linear(this.rightLeg.angle, 0.8, 0.16);
    this.headPivot.angle = wave * 0.65;

    this.torso.setScale(1, 1 + wave * 0.004);
    this.shadow.setScale(1.08 + wave * 0.01, 1 - wave * 0.01);
    this.floorFocus.setScale(1 + wave * 0.008, 1 - wave * 0.008);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
