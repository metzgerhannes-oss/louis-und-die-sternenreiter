import Phaser from "phaser";
import { getCrewPartTexture } from "../assets/crewTextures";

const SOURCE_WIDTH = 66;
const SOURCE_HEIGHT = 160;

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
    const centerY = -SOURCE_HEIGHT / 2;

    this.shadow = scene.add
      .ellipse(0, 7, 78, 20, 0x000000, 0.62)
      .setScale(1.05, 1);

    this.floorFocus = scene.add
      .ellipse(0, 6, 88, 21, 0xe4a04a, 0.025)
      .setStrokeStyle(1.2, 0xe4a04a, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.body = scene.add
      .image(0, centerY, getCrewPartTexture("louis", "dogBody"))
      .setDisplaySize(SOURCE_WIDTH, SOURCE_HEIGHT);

    const headJointY = -SOURCE_HEIGHT + SOURCE_HEIGHT * 0.39;
    const head = scene.add
      .image(0, centerY - headJointY, getCrewPartTexture("louis", "dogHead"))
      .setDisplaySize(SOURCE_WIDTH, SOURCE_HEIGHT);
    this.headPivot = scene.add.container(0, headJointY, [head]);

    const createLeg = (
      part: "dogLeftLeg" | "dogRightLeg",
      jointXNorm: number
    ): Phaser.GameObjects.Container => {
      const jointX = -SOURCE_WIDTH / 2 + SOURCE_WIDTH * jointXNorm;
      const jointY = -SOURCE_HEIGHT + SOURCE_HEIGHT * 0.63;
      const image = scene.add
        .image(-jointX, centerY - jointY, getCrewPartTexture("louis", part))
        .setDisplaySize(SOURCE_WIDTH, SOURCE_HEIGHT);
      return scene.add.container(jointX, jointY, [image]);
    };

    this.leftLeg = createLeg("dogLeftLeg", 0.34);
    this.rightLeg = createLeg("dogRightLeg", 0.66);

    this.beacon = scene.add
      .circle(22, -101, 4.5, 0x74e0e4, 1)
      .setStrokeStyle(1.5, 0xd8ffff, 0.88);

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
      .setSize(96, 154)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onInteract);

    scene.tweens.add({
      targets: [this.floorFocus, this.beacon],
      alpha: { from: 0.06, to: 0.26 },
      duration: 900,
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
      0.9,
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
    this.setPosition(
      Phaser.Math.Linear(this.container.x, targetX, factor),
      Phaser.Math.Linear(this.container.y, targetY, factor)
    );

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
      this.visualRoot.y = -step * 3.5;
      this.visualRoot.angle = Phaser.Math.Linear(
        this.visualRoot.angle,
        this.movementLean * this.facing,
        0.3
      );
      this.leftLeg.angle = counterWave * 9;
      this.rightLeg.angle = wave * 9;
      this.headPivot.angle = wave * 2;
      this.shadow.setScale(1.05 - step * 0.09, 1 - step * 0.08);
      return;
    }

    this.visualRoot.y = wave * 0.7;
    this.visualRoot.angle = Phaser.Math.Linear(this.visualRoot.angle, 0, 0.18);
    this.leftLeg.angle = Phaser.Math.Linear(this.leftLeg.angle, -0.6, 0.14);
    this.rightLeg.angle = Phaser.Math.Linear(this.rightLeg.angle, 0.6, 0.14);
    this.headPivot.angle = wave * 0.75;
    this.shadow.setScale(1.05 + wave * 0.01, 1 - wave * 0.01);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }
}
