import Phaser from "phaser";
import {
  getCrewRigFrame,
  getCrewSpriteTexture
} from "../assets/crewTextures";

type NormalizedCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SOURCE_WIDTH = 66;
const SOURCE_HEIGHT = 160;

const CROPS: Record<
  "dogHead" | "dogBody" | "dogLeftLeg" | "dogRightLeg",
  NormalizedCrop
> = {
  dogHead: { x: 0.06, y: 0.02, width: 0.88, height: 0.52 },
  dogBody: { x: 0.08, y: 0.32, width: 0.84, height: 0.45 },
  dogLeftLeg: { x: 0.08, y: 0.58, width: 0.48, height: 0.42 },
  dogRightLeg: { x: 0.44, y: 0.58, width: 0.48, height: 0.42 }
};

function localCenter(crop: NormalizedCrop): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    -SOURCE_WIDTH / 2 + SOURCE_WIDTH * (crop.x + crop.width / 2),
    -SOURCE_HEIGHT + SOURCE_HEIGHT * (crop.y + crop.height / 2)
  );
}

export class IllustratedLouisCompanion {
  readonly container: Phaser.GameObjects.Container;

  private readonly visualRoot: Phaser.GameObjects.Container;
  private readonly headPivot: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Image;
  private readonly leftLeg: Phaser.GameObjects.Container;
  private readonly rightLeg: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly floorFocus: Phaser.GameObjects.Ellipse;
  private readonly beacon: Phaser.GameObjects.Arc;

  private animationPhase = Math.PI * 0.4;
  private movementLean = 0;
  private facing = 1;

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

    this.shadow = scene.add
      .ellipse(0, 7, 82, 21, 0x000000, 0.64)
      .setScale(1.06, 1);

    this.floorFocus = scene.add
      .ellipse(0, 6, 92, 23, 0xe4a04a, 0.035)
      .setStrokeStyle(1.3, 0xe4a04a, 0.28)
      .setBlendMode(Phaser.BlendModes.ADD);

    const bodyCrop = CROPS.dogBody;
    const bodyCenter = localCenter(bodyCrop);
    this.body = scene.add
      .image(
        bodyCenter.x,
        bodyCenter.y,
        texture,
        getCrewRigFrame("dogBody")
      )
      .setDisplaySize(
        SOURCE_WIDTH * bodyCrop.width,
        SOURCE_HEIGHT * bodyCrop.height
      );

    const headCrop = CROPS.dogHead;
    const headCenter = localCenter(headCrop);
    const headJoint = new Phaser.Math.Vector2(0, -SOURCE_HEIGHT * 0.62);
    const head = scene.add
      .image(
        headCenter.x - headJoint.x,
        headCenter.y - headJoint.y,
        texture,
        getCrewRigFrame("dogHead")
      )
      .setDisplaySize(
        SOURCE_WIDTH * headCrop.width,
        SOURCE_HEIGHT * headCrop.height
      );

    this.headPivot = scene.add.container(headJoint.x, headJoint.y, [head]);

    const createLeg = (
      frame: "dogLeftLeg" | "dogRightLeg",
      jointX: number
    ): Phaser.GameObjects.Container => {
      const crop = CROPS[frame];
      const center = localCenter(crop);
      const joint = new Phaser.Math.Vector2(
        -SOURCE_WIDTH / 2 + SOURCE_WIDTH * jointX,
        -SOURCE_HEIGHT + SOURCE_HEIGHT * 0.62
      );
      const image = scene.add
        .image(
          center.x - joint.x,
          center.y - joint.y,
          texture,
          getCrewRigFrame(frame)
        )
        .setDisplaySize(
          SOURCE_WIDTH * crop.width,
          SOURCE_HEIGHT * crop.height
        );

      return scene.add.container(joint.x, joint.y, [image]);
    };

    this.leftLeg = createLeg("dogLeftLeg", 0.34);
    this.rightLeg = createLeg("dogRightLeg", 0.66);

    this.beacon = scene.add
      .circle(23, -101, 4.5, 0x74e0e4, 1)
      .setStrokeStyle(1.5, 0xd8ffff, 0.9);

    this.visualRoot = scene.add.container(0, 0, [
      this.leftLeg,
      this.rightLeg,
      this.body,
      this.headPivot,
      this.beacon
    ]);

    this.container = scene.add.container(x, y, [
      this.shadow,
      this.floorFocus,
      this.visualRoot
    ]);

    this.container
      .setSize(100, 160)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onInteract);

    scene.tweens.add({
      targets: [this.floorFocus, this.beacon],
      alpha: { from: 0.08, to: 0.32 },
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
      0.88,
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
      this.facing = dx < 0 ? -1 : 1;
      this.visualRoot.setScale(this.facing, 1);
    }

    this.movementLean = Phaser.Math.Clamp(dx * 0.12, -3.2, 3.2);
    this.updateAnimation(delta, moving);
  }

  private updateAnimation(delta: number, moving: boolean): void {
    this.animationPhase += delta * (moving ? 0.016 : 0.0034);

    const wave = Math.sin(this.animationPhase);
    const counterWave = Math.sin(this.animationPhase + Math.PI);
    const step = Math.abs(wave);

    if (moving) {
      this.visualRoot.y = -step * 3.6;
      this.visualRoot.angle = Phaser.Math.Linear(
        this.visualRoot.angle,
        this.movementLean * this.facing,
        0.3
      );

      this.leftLeg.angle = counterWave * 10;
      this.rightLeg.angle = wave * 10;
      this.headPivot.angle = wave * 2.3;
      this.body.setScale(1 + step * 0.006, 1 - step * 0.004);

      this.shadow.setScale(1.06 - step * 0.1, 1 - step * 0.08);
      this.floorFocus.setScale(1 + step * 0.018, 1 - step * 0.02);
      return;
    }

    const breathing = wave * 0.82;
    this.visualRoot.y = breathing;
    this.visualRoot.angle = Phaser.Math.Linear(this.visualRoot.angle, 0, 0.18);

    this.leftLeg.angle = Phaser.Math.Linear(
      this.leftLeg.angle,
      -1 + wave * 0.5,
      0.14
    );
    this.rightLeg.angle = Phaser.Math.Linear(
      this.rightLeg.angle,
      1 - wave * 0.5,
      0.14
    );
    this.headPivot.angle = wave * 0.8;
    this.body.setScale(1, 1 + wave * 0.004);

    this.shadow.setScale(1.06 + wave * 0.01, 1 - wave * 0.01);
    this.floorFocus.setScale(1 + wave * 0.008, 1 - wave * 0.008);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
