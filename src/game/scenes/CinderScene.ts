import Phaser from "phaser";
import {
  getCrewMates,
  playerProfiles,
  type PlayerProfile
} from "../../domain/profiles";
import {
  cinderDistributionStarPoint,
  cinderMoistureStarPoint,
  type StarPointDefinition
} from "../../domain/starPoints";
import { loadCinderState } from "../../services/cinderState";
import { isStarPointCompleted } from "../../services/starPointState";
import { CrewMate } from "../entities/CrewMate";
import { PlayerAvatar } from "../entities/PlayerAvatar";
import { LouisCompanion } from "../entities/LouisCompanion";
import { InteractionFocus } from "../effects/InteractionFocus";
import { gameEventBus, type MoveDirection } from "../EventBus";
import {
  cinderHotspots,
  type CinderHotspot
} from "../world/cinderContent";

type RuntimeHotspot = {
  data: CinderHotspot;
  x: number;
  y: number;
};

type RuntimeStarPoint = {
  data: StarPointDefinition;
  x: number;
  y: number;
};

type NearestInteraction =
  | { kind: "louis"; distance: number }
  | { kind: "hotspot"; hotspot: RuntimeHotspot; distance: number }
  | { kind: "starpoint"; starPoint: RuntimeStarPoint; distance: number };

export class CinderScene extends Phaser.Scene {
  private player?: PlayerAvatar;
  private crewMates: CrewMate[] = [];
  private louis?: LouisCompanion;
  private interactionFocus?: InteractionFocus;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey?: Phaser.Input.Keyboard.Key;
  private scannerKey?: Phaser.Input.Keyboard.Key;
  private hint?: Phaser.GameObjects.Text;
  private hotspots: RuntimeHotspot[] = [];
  private starPoints: RuntimeStarPoint[] = [];
  private readonly moveState: Record<MoveDirection, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  constructor() {
    super("CinderScene");
  }

  create(): void {
    const profile =
      (this.game.registry.get("activeProfile") as PlayerProfile | undefined) ??
      playerProfiles[0];

    this.drawCinder(profile);
    this.interactionFocus = new InteractionFocus(this, 0xf0a05a);
    this.setupKeyboard();

    const offMove = gameEventBus.on("input:move", ({ direction, active }) => {
      this.moveState[direction] = active;
    });

    const offInteract = gameEventBus.on("input:interact", () => {
      this.openNearestInteraction();
    });

    const offScanner = gameEventBus.on("ui:scanner:pulse", () => {
      this.pulseScanner();
    });

    const offPing = gameEventBus.on("ui:louis:ping", () => {
      if (!this.louis) return;

      const bubble = this.add
        .text(this.louis.x, this.louis.y - 72, "Hier! Viel Staub.", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "17px",
          fontStyle: "700",
          color: "#fff4df",
          backgroundColor: "#6c392ddd",
          padding: { x: 10, y: 6 }
        })
        .setOrigin(0.5)
        .setDepth(4000);

      this.tweens.add({
        targets: bubble,
        y: bubble.y - 18,
        alpha: 0,
        duration: 1100,
        ease: "Sine.easeOut",
        onComplete: () => bubble.destroy()
      });
    });

    const offStarPoint = gameEventBus.on("starpoint:completed", ({ id }) => {
      if (
        id === cinderMoistureStarPoint.id ||
        id === cinderDistributionStarPoint.id
      ) {
        this.scene.restart();
      }
    });

    const offChapter = gameEventBus.on("chapter2:state-changed", () => {
      this.scene.restart();
    });

    const onResize = () => this.scene.restart();
    this.scale.on("resize", onResize);

    this.events.once("shutdown", () => {
      offMove();
      offInteract();
      offPing();
      offScanner();
      offStarPoint();
      offChapter();
      this.scale.off("resize", onResize);
      this.crewMates = [];
      this.starPoints = [];
      this.interactionFocus = undefined;

      for (const direction of Object.keys(this.moveState) as MoveDirection[]) {
        this.moveState[direction] = false;
      }
    });

    gameEventBus.emit("scene:ready", { sceneKey: this.scene.key });
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.louis) return;

    const keyboardLeft = Boolean(this.cursors?.left.isDown || this.wasd?.A.isDown);
    const keyboardRight = Boolean(this.cursors?.right.isDown || this.wasd?.D.isDown);
    const keyboardUp = Boolean(this.cursors?.up.isDown || this.wasd?.W.isDown);
    const keyboardDown = Boolean(this.cursors?.down.isDown || this.wasd?.S.isDown);

    let dx =
      Number(keyboardRight || this.moveState.right) -
      Number(keyboardLeft || this.moveState.left);
    let dy =
      Number(keyboardDown || this.moveState.down) -
      Number(keyboardUp || this.moveState.up);

    const playerMoving = dx !== 0 || dy !== 0;

    if (playerMoving) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;

      const speed = 245;
      const seconds = delta / 1000;
      const { width, height } = this.scale;

      const nextX = Phaser.Math.Clamp(
        this.player.x + dx * speed * seconds,
        width * 0.06,
        width * 0.94
      );
      const compact = width <= 860 && height > width;
      const nextY = Phaser.Math.Clamp(
        this.player.y + dy * speed * 0.74 * seconds,
        height * (compact ? 0.37 : 0.46),
        height * (compact ? 0.78 : 0.9)
      );

      this.player.setPosition(nextX, nextY);
    }

    this.player.updateAnimation(delta, playerMoving);

    for (const crewMate of this.crewMates) {
      crewMate.updateFollow(this.player.x, this.player.y, delta);
    }

    this.louis.updateFollow(this.player.x, this.player.y, delta);
    this.updateInteractionHint();

    if (this.scannerKey && Phaser.Input.Keyboard.JustDown(this.scannerKey)) {
      this.pulseScanner();
    }

    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.openNearestInteraction();
    }
  }

  private setupKeyboard(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.scannerKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  private drawCinder(profile: PlayerProfile): void {
    const { width, height } = this.scale;
    const state = loadCinderState();
    const moistureRestored = isStarPointCompleted(cinderMoistureStarPoint.id);
    const distributionBuilt = isStarPointCompleted(cinderDistributionStarPoint.id);
    const compact = width <= 860 && height > width;

    this.cameras.main.setBackgroundColor("#391e1a");

    const sky = this.add.graphics().setDepth(-20);
    sky.fillGradientStyle(0x6f3128, 0x8c3d2c, 0xd66f46, 0xf0a15b, 1);
    sky.fillRect(0, 0, width, height * 0.44);

    this.add
      .circle(
        width * 0.82,
        height * 0.12,
        Math.max(42, width * 0.05),
        0xffd47b,
        0.9
      )
      .setDepth(-18);

    this.add
      .circle(
        width * 0.82,
        height * 0.12,
        Math.max(72, width * 0.085),
        0xffa54f,
        0.08
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-19);

    // Layered salvage mesas create depth instead of one flat silhouette.
    const farMesas = this.add.graphics().setDepth(-14);
    farMesas.fillStyle(0x5a302c, 0.82);
    farMesas.fillTriangle(0, height * 0.42, width * 0.13, height * 0.28, width * 0.27, height * 0.42);
    farMesas.fillTriangle(width * 0.18, height * 0.42, width * 0.38, height * 0.25, width * 0.54, height * 0.42);
    farMesas.fillTriangle(width * 0.49, height * 0.42, width * 0.68, height * 0.22, width * 0.86, height * 0.42);
    farMesas.fillTriangle(width * 0.74, height * 0.42, width * 0.9, height * 0.29, width, height * 0.42);

    const nearMesas = this.add.graphics().setDepth(-12);
    nearMesas.fillStyle(0x6d372f, 0.96);
    nearMesas.fillTriangle(-20, height * 0.46, width * 0.11, height * 0.33, width * 0.29, height * 0.46);
    nearMesas.fillTriangle(width * 0.53, height * 0.46, width * 0.74, height * 0.3, width * 0.98, height * 0.46);

    // Distant scrapyard silhouettes and wind towers.
    for (let i = 0; i < 9; i += 1) {
      const x = width * (0.03 + i * 0.115);
      const h = height * (0.06 + (i % 4) * 0.025);
      this.add
        .rectangle(x, height * 0.4 - h / 2, 10 + (i % 3) * 7, h, 0x45302d, 0.78)
        .setDepth(-10);
      this.add
        .line(x, height * 0.4 - h, 0, 0, (i % 2 ? 9 : -8), -24 - (i % 3) * 8, 0x59413a, 0.8)
        .setLineWidth(2)
        .setDepth(-9);
    }

    const ground = this.add.graphics().setDepth(-5);
    ground.fillGradientStyle(0x824433, 0x874635, 0x4e2c28, 0x4a2925, 1);
    ground.fillRect(0, height * 0.41, width, height * 0.59);

    // Track lines, cracked plates and old haul roads.
    ground.lineStyle(2, 0xc77753, 0.34);
    for (let i = 0; i < 7; i += 1) {
      const y = height * (0.49 + i * 0.067);
      ground.lineBetween(0, y, width, y + (i % 2 ? 8 : -8));
    }

    ground.lineStyle(4, 0x5b332d, 0.55);
    ground.lineBetween(width * 0.08, height * 0.47, width * 0.22, height);
    ground.lineBetween(width * 0.88, height * 0.47, width * 0.72, height);

    for (let i = 0; i < 12; i += 1) {
      const px = width * (((i * 23) % 91) / 100);
      const py = height * (0.48 + (((i * 17) % 43) / 100));
      const scrap = this.add
        .rectangle(
          px,
          py,
          13 + (i % 4) * 7,
          5 + (i % 3) * 4,
          i % 2 ? 0x55423a : 0x6c4b3b,
          0.74
        )
        .setAngle((i * 31) % 170)
        .setDepth(py - 30);
      if (i % 3 === 0) {
        scrap.setStrokeStyle(1, 0xa06a49, 0.5);
      }
    }

    // Animated dust gives Cinder a living desert atmosphere.
    for (let i = 0; i < 18; i += 1) {
      const dust = this.add
        .ellipse(
          width * (((i * 37) % 97) / 100),
          height * (0.18 + (((i * 29) % 55) / 100)),
          18 + (i % 5) * 12,
          4 + (i % 3) * 2,
          0xf2b078,
          0.06 + (i % 4) * 0.018
        )
        .setDepth(-2);

      this.tweens.add({
        targets: dust,
        x: dust.x + width * (0.08 + (i % 4) * 0.025),
        alpha: { from: dust.alpha, to: 0.01 },
        duration: 3400 + i * 170,
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut"
      });
    }

    this.add
      .text(width * 0.045, height * 0.065, "CINDER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(Math.max(26, Math.min(58, width * 0.048)))}px`,
        fontStyle: "900",
        color: "#ffe0a6"
      })
      .setDepth(3)
      .setVisible(!compact);

    this.add
      .text(width * 0.047, height * 0.135, "Staubhafen · roter Außenposten", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color: "#f0b18e"
      })
      .setDepth(3)
      .setVisible(!compact);

    const shipX = width * (compact ? 0.17 : 0.16);
    const shipY = height * (compact ? 0.48 : 0.7);
    const settlementX = width * (compact ? 0.74 : 0.74);
    const settlementY = height * (compact ? 0.49 : 0.56);
    const condenserX = width * (compact ? 0.3 : 0.28);
    const condenserY = height * (compact ? 0.5 : 0.54);
    const workshopX = width * (compact ? 0.82 : 0.84);
    const workshopY = height * (compact ? 0.64 : 0.72);

    this.drawShip(shipX, shipY, state.complete);
    this.drawSettlement(settlementX, settlementY, distributionBuilt);
    this.drawCondensers(condenserX, condenserY, moistureRestored);
    this.drawWorkshop(workshopX, workshopY, state.waterCelebrated);

    if (distributionBuilt) {
      const pipe = this.add.graphics().setDepth(4);
      pipe.lineStyle(7, 0x496d73, 0.95);
      pipe.beginPath();
      pipe.moveTo(width * 0.34, height * 0.58);
      pipe.lineTo(width * 0.5, height * 0.65);
      pipe.lineTo(width * 0.65, height * 0.61);
      pipe.lineTo(width * 0.72, height * 0.57);
      pipe.strokePath();

      this.add
        .ellipse(width * 0.75, height * 0.64, 90, 28, 0x4c99a7, 0.78)
        .setStrokeStyle(3, 0x9ad7d8)
        .setDepth(5);
    }

    this.hotspots = [
      {
        data: cinderHotspots.ship,
        x: shipX,
        y: shipY + (compact ? 26 : 40)
      },
      {
        data: cinderHotspots.settlement,
        x: settlementX,
        y: settlementY + (compact ? 42 : 70)
      },
      {
        data: cinderHotspots.condensers,
        x: condenserX,
        y: condenserY + (compact ? 42 : 70)
      },
      {
        data: cinderHotspots.workshop,
        x: workshopX,
        y: workshopY + (compact ? 38 : 66)
      }
    ];

    if (moistureRestored && !state.stardustCollected) {
      const sx = width * 0.37;
      const sy = height * 0.62;

      const dust = this.add
        .star(sx, sy, 8, 7, 17, 0xe8c26b, 0.95)
        .setStrokeStyle(2, 0xffe9a5)
        .setInteractive({ useHandCursor: true })
        .setDepth(1200);

      this.tweens.add({
        targets: dust,
        scale: { from: 0.88, to: 1.12 },
        alpha: { from: 0.72, to: 1 },
        yoyo: true,
        repeat: -1,
        duration: 760
      });

      dust.on("pointerdown", () => {
        gameEventBus.emit("interaction:hotspot", cinderHotspots.stardust);
      });

      this.hotspots.push({
        data: cinderHotspots.stardust,
        x: sx,
        y: sy
      });
    }

    if (state.intakeInspected && !moistureRestored) {
      this.addStarPoint(
        cinderMoistureStarPoint,
        width * 0.31,
        height * 0.56
      );
    }

    if (
      state.stardustCollected &&
      moistureRestored &&
      !distributionBuilt
    ) {
      this.addStarPoint(
        cinderDistributionStarPoint,
        width * 0.56,
        height * 0.61
      );
    }

    const startX = width * (compact ? 0.5 : 0.47);
    const startY = height * (compact ? 0.68 : 0.78);

    this.player = new PlayerAvatar(this, profile, startX, startY);
    this.player.setPosition(startX, startY);

    const formation = compact
      ? [
          { x: -72, y: 48 },
          { x: 70, y: 44 }
        ]
      : [
          { x: -108, y: 70 },
          { x: 98, y: 65 }
        ];

    this.crewMates = getCrewMates(profile.id).map((crewProfile, index) => {
      const offset = formation[index];
      return new CrewMate(
        this,
        crewProfile,
        startX + offset.x,
        startY + offset.y,
        offset.x,
        offset.y
      );
    });

    this.louis = new LouisCompanion(
      this,
      startX - (compact ? 46 : 62),
      startY + (compact ? 12 : 20),
      () => {
        gameEventBus.emit("interaction:louis", undefined);
      }
    );

    this.hint = this.add
      .text(width / 2, compact ? height * 0.19 : height * 0.43, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: compact ? "12px" : "15px",
        fontStyle: "700",
        color: "#fff7e7",
        backgroundColor: "#4e2b24dd",
        padding: compact ? { x: 7, y: 4 } : { x: 11, y: 7 }
      })
      .setOrigin(0.5)
      .setDepth(4000)
      .setVisible(false);
  }

  private drawShip(x: number, y: number, upgraded: boolean): void {
    const compact = this.scale.width <= 860 && this.scale.height > this.scale.width;
    const scale = compact
      ? Phaser.Math.Clamp(this.scale.width / 1500, 0.46, 0.56)
      : Phaser.Math.Clamp(this.scale.width / 1180, 0.66, 0.92);

    const shadow = this.add.ellipse(0, 42, 235, 37, 0x000000, 0.3);

    const glowA = this.add
      .ellipse(-101, -20, 58, 24, upgraded ? 0xffa33c : 0x674b3e, upgraded ? 0.46 : 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    const glowB = this.add
      .ellipse(-101, 22, 58, 24, upgraded ? 0xffa33c : 0x674b3e, upgraded ? 0.46 : 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);

    const engineA = this.add
      .ellipse(-79, -20, 67, 37, 0x4d5050)
      .setStrokeStyle(3, 0xb78148);
    const engineB = this.add
      .ellipse(-79, 22, 67, 37, 0x4d5050)
      .setStrokeStyle(3, 0xb78148);

    const hull = this.add
      .ellipse(18, 0, 215, 75, 0xc8b79f)
      .setStrokeStyle(3, 0x6b5d50);

    const nose = this.add
      .triangle(124, 0, -24, -33, 43, 0, -24, 33, 0xad9b84)
      .setStrokeStyle(2, 0x62564c);

    const cockpit = this.add
      .ellipse(62, -10, 78, 42, 0x315d69, 0.95)
      .setStrokeStyle(3, 0x78c4c8);

    const stripeBlue = this.add.rectangle(13, 17, 103, 8, 0x356e8a, 0.9).setAngle(-3);
    const stripeBerry = this.add.rectangle(6, 27, 52, 6, 0x954b64, 0.9).setAngle(-3);
    const stripeAmber = this.add.rectangle(55, 25, 38, 5, 0xcf8735, 0.95).setAngle(-3);

    const panelA = this.add.rectangle(-30, -5, 27, 19, 0x696156).setStrokeStyle(1, 0xa98a66);
    const panelB = this.add.rectangle(21, -25, 23, 15, 0x5b605d).setStrokeStyle(1, 0xb89b71);

    const turretBase = this.add.ellipse(-2, -48, 31, 14, 0x454a4d).setStrokeStyle(2, 0xbb8145);
    const turret = this.add.rectangle(8, -53, 45, 8, 0x5b5f60).setStrokeStyle(1, 0xb49a75).setAngle(-4);
    const turretMuzzle = this.add.circle(30, -55, 4.5, 0x252a2e).setStrokeStyle(2, 0xd7913e);

    const gearA = this.add.line(0, 0, -39, 29, -44, 47, 0x343b3f, 1).setLineWidth(4);
    const gearB = this.add.line(0, 0, 67, 27, 70, 47, 0x343b3f, 1).setLineWidth(4);
    const footA = this.add.rectangle(-45, 49, 28, 6, 0x252a2d).setStrokeStyle(1, 0xa77f53);
    const footB = this.add.rectangle(70, 49, 28, 6, 0x252a2d).setStrokeStyle(1, 0xa77f53);

    const ship = this.add.container(x, y, [
      shadow,
      glowA,
      glowB,
      engineA,
      engineB,
      hull,
      nose,
      stripeBlue,
      stripeBerry,
      stripeAmber,
      panelA,
      panelB,
      cockpit,
      turretBase,
      turret,
      turretMuzzle,
      gearA,
      gearB,
      footA,
      footB
    ]);

    ship
      .setScale(scale)
      .setDepth(y - 18)
      .setSize(260, 120)
      .setInteractive({ useHandCursor: true });

    if (upgraded) {
      this.tweens.add({
        targets: [glowA, glowB],
        alpha: { from: 0.35, to: 0.88 },
        scale: { from: 0.92, to: 1.08 },
        duration: 640,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    ship.on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.ship);
    });
  }

  private drawSettlement(x: number, y: number, waterRestored: boolean): void {
    const modules = [
      { dx: -76, dy: 6, w: 88, h: 76, color: 0x765043 },
      { dx: 12, dy: -8, w: 105, h: 96, color: 0x68504a },
      { dx: 84, dy: 10, w: 63, h: 68, color: 0x5c4540 }
    ];

    const hitObjects: Phaser.GameObjects.Rectangle[] = [];

    for (const [index, module] of modules.entries()) {
      const block = this.add
        .rectangle(x + module.dx, y + module.dy, module.w, module.h, module.color)
        .setStrokeStyle(3, index === 1 ? 0xa97659 : 0x91614d)
        .setDepth(y + module.dy);

      hitObjects.push(block);

      this.add
        .rectangle(
          x + module.dx,
          y + module.dy - module.h * 0.25,
          module.w * 0.58,
          7,
          index % 2 ? 0x394a50 : 0x4c3933
        )
        .setDepth(y + module.dy + 1);

      for (let i = 0; i < 3; i += 1) {
        this.add
          .circle(
            x + module.dx - module.w * 0.25 + i * module.w * 0.24,
            y + module.dy + module.h * 0.16,
            3,
            waterRestored ? 0x75ced2 : 0xd58d55,
            waterRestored ? 0.9 : 0.6
          )
          .setDepth(y + module.dy + 2);
      }
    }

    const awning = this.add
      .rectangle(x + 4, y - 67, 196, 11, 0x403937)
      .setStrokeStyle(2, 0x9a6b50)
      .setAngle(-3)
      .setDepth(y - 9);

    for (let i = 0; i < 6; i += 1) {
      this.add
        .line(
          x - 92 + i * 36,
          y - 66,
          0,
          0,
          i % 2 ? 8 : -7,
          -25 - (i % 3) * 7,
          0x4f4842,
          0.82
        )
        .setLineWidth(2)
        .setDepth(y - 8);
    }

    const waterPipe = this.add.graphics().setDepth(y + 3);
    waterPipe.lineStyle(5, waterRestored ? 0x5d9ea5 : 0x5c5550, 0.92);
    waterPipe.beginPath();
    waterPipe.moveTo(x - 115, y + 32);
    waterPipe.lineTo(x - 34, y + 32);
    waterPipe.lineTo(x + 38, y + 46);
    waterPipe.lineTo(x + 112, y + 41);
    waterPipe.strokePath();

    if (waterRestored) {
      for (let i = 0; i < 4; i += 1) {
        const lamp = this.add
          .circle(x - 67 + i * 48, y - 53, 4, 0x8de3df, 0.9)
          .setDepth(y + 5);
        this.tweens.add({
          targets: lamp,
          alpha: { from: 0.45, to: 1 },
          duration: 900 + i * 120,
          yoyo: true,
          repeat: -1
        });
      }
    }

    this.add
      .text(
        x,
        y - 93,
        waterRestored ? "STAUBHAFEN · WASSER LÄUFT" : "STAUBHAFEN",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          fontStyle: "800",
          color: waterRestored ? "#9bd7d8" : "#e8c39e",
          backgroundColor: "#3a201bcc",
          padding: { x: 7, y: 3 }
        }
      )
      .setOrigin(0.5)
      .setDepth(y + 7)
      .setVisible(!(this.scale.width <= 860 && this.scale.height > this.scale.width));

    for (const block of hitObjects) {
      block.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        gameEventBus.emit("interaction:hotspot", cinderHotspots.settlement);
      });
    }

    awning.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.settlement);
    });
  }

  private drawCondensers(x: number, y: number, restored: boolean): void {
    for (let i = -1; i <= 1; i += 1) {
      const px = x + i * 62;

      this.add
        .ellipse(px, y + 44, 44, 14, 0x321f1b, 0.28)
        .setDepth(y - 4);

      this.add
        .rectangle(px, y, 18, 102, 0x574940)
        .setStrokeStyle(2, restored ? 0x7caaa7 : 0x8e7561)
        .setDepth(y - 2);

      for (let fin = -2; fin <= 2; fin += 1) {
        this.add
          .rectangle(
            px,
            y + fin * 16,
            42 + Math.abs(fin) * 5,
            5,
            restored ? 0x547b79 : 0x65584d,
            0.92
          )
          .setStrokeStyle(1, restored ? 0x9bd7d8 : 0x8a7564, 0.5)
          .setDepth(y - 1);
      }

      this.add
        .ellipse(px, y - 51, 58, 20, restored ? 0x608c89 : 0x6d6257)
        .setStrokeStyle(2, restored ? 0xb1ebea : 0x988575)
        .setDepth(y);

      const crown = this.add
        .circle(px, y - 52, 7, restored ? 0x8be0dc : 0x7b6353, restored ? 0.95 : 0.6)
        .setDepth(y + 1);

      if (restored) {
        this.tweens.add({
          targets: crown,
          alpha: { from: 0.48, to: 1 },
          scale: { from: 0.9, to: 1.13 },
          duration: 820 + (i + 1) * 120,
          yoyo: true,
          repeat: -1
        });

        for (let puff = 0; puff < 2; puff += 1) {
          const vapor = this.add
            .ellipse(px + puff * 7 - 3, y - 73 - puff * 10, 22 + puff * 7, 9, 0xc8e0d9, 0.11)
            .setDepth(y - 1);
          this.tweens.add({
            targets: vapor,
            y: vapor.y - 20,
            alpha: { from: 0.14, to: 0.015 },
            duration: 1800 + puff * 300,
            yoyo: true,
            repeat: -1
          });
        }
      }
    }

    const basePipe = this.add.graphics().setDepth(y - 3);
    basePipe.lineStyle(5, restored ? 0x5f8e91 : 0x5c5148, 0.86);
    basePipe.beginPath();
    basePipe.moveTo(x - 75, y + 48);
    basePipe.lineTo(x + 75, y + 48);
    basePipe.strokePath();

    const hit = this.add
      .rectangle(x, y, 220, 140, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(y + 4);

    hit.on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.condensers);
    });

    this.add
      .text(
        x,
        y - 94,
        restored ? "KONDENSATOREN · AKTIV" : "ALTE KONDENSATOREN",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "700",
          color: restored ? "#b8ece9" : "#d7ad8a",
          backgroundColor: "#3b211ccc",
          padding: { x: 6, y: 3 }
        }
      )
      .setOrigin(0.5)
      .setDepth(y + 6)
      .setVisible(!(this.scale.width <= 860 && this.scale.height > this.scale.width));
  }

  private drawWorkshop(x: number, y: number, available: boolean): void {
    const workshop = this.add
      .rectangle(x, y, 156, 90, 0x4d3931)
      .setStrokeStyle(3, available ? 0xe0aa62 : 0x7b5d4f)
      .setInteractive({ useHandCursor: true })
      .setDepth(y);

    this.add
      .rectangle(x, y - 38, 169, 13, 0x8a5335)
      .setStrokeStyle(2, 0xd09052, 0.68)
      .setAngle(-2)
      .setDepth(y + 1);

    for (let i = 0; i < 5; i += 1) {
      this.add
        .rectangle(
          x - 56 + i * 28,
          y + 7,
          16,
          24 + (i % 2) * 8,
          i % 2 ? 0x5a4d43 : 0x6c5140,
          0.95
        )
        .setStrokeStyle(1, 0x9c7352, 0.6)
        .setDepth(y + 2);
    }

    const sign = this.add
      .rectangle(x + 45, y - 17, 45, 24, 0x2a3438)
      .setStrokeStyle(2, available ? 0xf0b15a : 0x6e7777)
      .setDepth(y + 3);

    const signLight = this.add
      .circle(x + 45, y - 17, 5, available ? 0xffbd5b : 0x75665b, available ? 1 : 0.52)
      .setDepth(y + 4);

    if (available) {
      this.tweens.add({
        targets: [sign, signLight],
        alpha: { from: 0.55, to: 1 },
        duration: 720,
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .text(
        x,
        y - 61,
        available ? "RIKAS WERKSTATT · ETWAS WARTET" : "RIKAS WERKSTATT",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          fontStyle: "700",
          color: available ? "#f5cd83" : "#c89b7d",
          backgroundColor: "#37201bcc",
          padding: { x: 6, y: 3 }
        }
      )
      .setOrigin(0.5)
      .setDepth(y + 5)
      .setVisible(!(this.scale.width <= 860 && this.scale.height > this.scale.width));

    workshop.on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.workshop);
    });
  }

  private addStarPoint(point: StarPointDefinition, x: number, y: number): void {
    const marker = this.add
      .star(x, y, 8, 11, 25, 0xe7aa59, 0.92)
      .setStrokeStyle(3, 0xffdda0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1500);

    this.tweens.add({
      targets: marker,
      angle: 45,
      scale: { from: 0.88, to: 1.12 },
      alpha: { from: 0.7, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 900
    });

    marker.on("pointerdown", () => {
      gameEventBus.emit("interaction:starpoint", point);
    });

    this.starPoints.push({ data: point, x, y });
  }

  private nearestInteraction(): NearestInteraction | null {
    if (!this.player || !this.louis) return null;

    let nearest: NearestInteraction = {
      kind: "louis",
      distance: Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.louis.x,
        this.louis.y
      )
    };

    for (const hotspot of this.hotspots) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        hotspot.x,
        hotspot.y
      );
      if (distance < nearest.distance) {
        nearest = { kind: "hotspot", hotspot, distance };
      }
    }

    for (const starPoint of this.starPoints) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        starPoint.x,
        starPoint.y
      );
      if (distance < nearest.distance) {
        nearest = { kind: "starpoint", starPoint, distance };
      }
    }

    return nearest.distance <= 145 ? nearest : null;
  }

  private updateInteractionHint(): void {
    if (!this.hint) return;

    const nearest = this.nearestInteraction();
    if (!nearest) {
      this.hint.setVisible(false);
      this.interactionFocus?.hide();
      return;
    }

    const label =
      nearest.kind === "louis"
        ? "Mit Louis sprechen"
        : nearest.kind === "starpoint"
          ? "Louis zeigt einen Sternenpunkt"
          : nearest.hotspot.data.title;

    const focusX =
      nearest.kind === "louis"
        ? this.louis?.x ?? 0
        : nearest.kind === "starpoint"
          ? nearest.starPoint.x
          : nearest.hotspot.x;
    const focusY =
      nearest.kind === "louis"
        ? (this.louis?.y ?? 0) - 46
        : nearest.kind === "starpoint"
          ? nearest.starPoint.y
          : nearest.hotspot.y;
    const focusColor =
      nearest.kind === "starpoint" ? 0x9ceaf0 : 0xf0a05a;

    this.interactionFocus?.show(focusX, focusY, focusColor);
    this.hint.setText(`${label} · E / Aktion`).setVisible(true);
  }

  private openNearestInteraction(): void {
    const nearest = this.nearestInteraction();
    if (!nearest) return;

    this.interactionFocus?.confirm(
      nearest.kind === "starpoint" ? 0x9ceaf0 : 0xf0a05a
    );

    if (nearest.kind === "louis") {
      gameEventBus.emit("interaction:louis", undefined);
      return;
    }

    if (nearest.kind === "starpoint") {
      gameEventBus.emit("interaction:starpoint", nearest.starPoint.data);
      return;
    }

    gameEventBus.emit("interaction:hotspot", nearest.hotspot.data);
  }

  private pulseScanner(): void {
    const { width, height } = this.scale;
    const originX = this.player?.x ?? width / 2;
    const originY = this.player?.y ?? height * 0.7;

    const pulse = this.add
      .circle(originX, originY, 28, 0x65c8df, 0)
      .setStrokeStyle(3, 0x83e2ed, 0.88)
      .setDepth(4900);

    this.tweens.add({
      targets: pulse,
      scale: Math.max(width, height) / 32,
      alpha: { from: 0.8, to: 0 },
      duration: 760,
      ease: "Sine.easeOut",
      onComplete: () => pulse.destroy()
    });

    const targets = [
      ...this.hotspots.map((hotspot) => ({ x: hotspot.x, y: hotspot.y })),
      ...this.starPoints.map((starPoint) => ({ x: starPoint.x, y: starPoint.y }))
    ];

    for (const target of targets) {
      const ring = this.add
        .circle(target.x, target.y, 24, 0x65c8df, 0.08)
        .setStrokeStyle(3, 0x9ceaf0, 0.95)
        .setDepth(4901);

      this.tweens.add({
        targets: ring,
        scale: { from: 0.65, to: 1.65 },
        alpha: { from: 1, to: 0 },
        duration: 900,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeOut",
        onComplete: () => ring.destroy()
      });
    }
  }

}
