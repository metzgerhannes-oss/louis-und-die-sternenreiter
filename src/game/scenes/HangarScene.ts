import Phaser from "phaser";
import {
  getCrewMates,
  playerProfiles,
  type PlayerProfile
} from "../../domain/profiles";
import {
  hangarEnergyStarPoint,
  hangarGateStarPoint,
  type StarPointDefinition
} from "../../domain/starPoints";
import { loadChapter1State } from "../../services/chapter1State";
import { isStarPointCompleted } from "../../services/starPointState";
import { CrewMate } from "../entities/CrewMate";
import { PlayerAvatar } from "../entities/PlayerAvatar";
import { LouisCompanion } from "../entities/LouisCompanion";
import { AmbientMotionLayer } from "../effects/AmbientMotionLayer";
import { InteractionFocus } from "../effects/InteractionFocus";
import { gameEventBus, type MoveDirection } from "../EventBus";
import {
  hangarHotspots,
  type HangarHotspot,
  type HangarHotspotId
} from "../world/hangarContent";

type RuntimeHotspot = {
  data: HangarHotspot;
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

export class HangarScene extends Phaser.Scene {
  private player?: PlayerAvatar;
  private crewMates: CrewMate[] = [];
  private louis?: LouisCompanion;
  private interactionFocus?: InteractionFocus;
  private atmosphere?: AmbientMotionLayer;
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
    super("HangarScene");
  }

  create(): void {
    const profile =
      (this.game.registry.get("activeProfile") as PlayerProfile | undefined) ?? playerProfiles[0];

    this.drawHangar(profile);
    this.atmosphere = new AmbientMotionLayer(this, "hangar");
    this.interactionFocus = new InteractionFocus(this, 0xf0b45e);
    this.setupKeyboard();
    this.cameras.main.fadeIn(320, 7, 12, 18);

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
      if (!this.louis) {
        return;
      }

      const bubble = this.add
        .text(this.louis.x, this.louis.y - 72, "Hier!", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "18px",
          fontStyle: "700",
          color: "#fff8e8",
          backgroundColor: "#23565dcc",
          padding: { x: 10, y: 6 }
        })
        .setOrigin(0.5)
        .setDepth(2000);

      this.tweens.add({
        targets: bubble,
        y: bubble.y - 20,
        alpha: 0,
        duration: 1100,
        ease: "Sine.easeOut",
        onComplete: () => bubble.destroy()
      });
    });

    const offStarPointCompleted = gameEventBus.on("starpoint:completed", ({ id }) => {
      if (id === hangarEnergyStarPoint.id || id === hangarGateStarPoint.id) {
        this.scene.restart();
      }
    });

    const offChapterState = gameEventBus.on("chapter1:state-changed", () => {
      this.scene.restart();
    });

    const onResize = () => this.scene.restart();
    this.scale.on("resize", onResize);

    this.events.once("shutdown", () => {
      offMove();
      offInteract();
      offPing();
      offScanner();
      offStarPointCompleted();
      offChapterState();
      this.scale.off("resize", onResize);
      this.crewMates = [];
      this.starPoints = [];
      this.interactionFocus = undefined;
      this.atmosphere = undefined;

      for (const direction of Object.keys(this.moveState) as MoveDirection[]) {
        this.moveState[direction] = false;
      }
    });

    gameEventBus.emit("scene:ready", { sceneKey: this.scene.key });
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.louis) {
      return;
    }

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

      const speed = 235;
      const seconds = delta / 1000;
      const { width, height } = this.scale;
      const nextX = Phaser.Math.Clamp(
        this.player.x + dx * speed * seconds,
        width * 0.08,
        width * 0.92
      );
      const compact = width <= 860 && height > width;
      const nextY = Phaser.Math.Clamp(
        this.player.y + dy * speed * 0.72 * seconds,
        height * (compact ? 0.37 : 0.48),
        height * (compact ? 0.78 : 0.86)
      );

      this.player.setPosition(nextX, nextY);
    }

    this.player.updateAnimation(delta, playerMoving);

    for (const crewMate of this.crewMates) {
      crewMate.updateFollow(this.player.x, this.player.y, delta);
    }

    this.louis.updateFollow(this.player.x, this.player.y, delta);
    this.atmosphere?.update(this.player.x, this.player.y, delta);
    this.updateInteractionHint();

    if (this.scannerKey && Phaser.Input.Keyboard.JustDown(this.scannerKey)) {
      this.pulseScanner();
    }

    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.openNearestInteraction();
    }
  }

  private setupKeyboard(): void {
    if (!this.input.keyboard) {
      return;
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.scannerKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  private drawHangar(profile: PlayerProfile): void {
    const { width, height } = this.scale;
    const chapterState = loadChapter1State();
    const energyRestored = isStarPointCompleted(hangarEnergyStarPoint.id);
    const gateOpen = isStarPointCompleted(hangarGateStarPoint.id);
    const compact = width <= 860 && height > width;

    this.cameras.main.setBackgroundColor("#070c12");

    const atmosphere = this.add.graphics().setDepth(-20);
    atmosphere.fillGradientStyle(0x111c28, 0x172431, 0x080d14, 0x0a1018, 1);
    atmosphere.fillRect(0, 0, width, height);

    // Massive patched back wall with visible steel framing.
    const backWall = this.add
      .rectangle(width * 0.5, height * 0.27, width * 0.96, height * 0.44, 0x1a232d)
      .setStrokeStyle(4, 0x465463)
      .setDepth(-12);

    for (let i = 0; i < 8; i += 1) {
      const x = width * (0.06 + i * 0.125);
      this.add
        .rectangle(x, height * 0.27, Math.max(7, width * 0.009), height * 0.43, 0x303c48)
        .setStrokeStyle(1, 0x66727a, 0.55)
        .setDepth(-11);
    }

    // Upper catwalk, workshop clutter and hanging repair cables.
    this.add
      .rectangle(width * 0.24, height * 0.17, width * 0.34, 10, 0x5b4838)
      .setStrokeStyle(2, 0xa2764c, 0.62)
      .setDepth(-8);

    for (let i = 0; i < 5; i += 1) {
      const cableX = width * (0.12 + i * 0.11);
      const cable = this.add.graphics().setDepth(-7);
      cable.lineStyle(3, i % 2 === 0 ? 0x9d6639 : 0x394c56, 0.78);
      cable.beginPath();
      cable.moveTo(cableX, 0);
      cable.lineTo(cableX + (i % 2 === 0 ? 14 : -11), height * (0.12 + (i % 3) * 0.035));
      cable.lineTo(cableX + (i % 2 === 0 ? 3 : 8), height * (0.2 + (i % 2) * 0.035));
      cable.strokePath();
    }

    // Open hangar door gives the scene real depth and a destination.
    const vistaX = width * 0.76;
    const vistaY = height * 0.25;
    const vistaW = width * 0.34;
    const vistaH = height * 0.3;

    this.add
      .rectangle(vistaX, vistaY, vistaW, vistaH, 0x07111e)
      .setStrokeStyle(7, 0x4c5b64)
      .setDepth(-10);

    this.add
      .ellipse(vistaX + vistaW * 0.21, vistaY + vistaH * 0.18, vistaW * 0.34, vistaW * 0.34, 0x5f708c, 0.58)
      .setDepth(-9);
    this.add
      .ellipse(vistaX + vistaW * 0.24, vistaY + vistaH * 0.15, vistaW * 0.29, vistaW * 0.29, 0xc38c69, 0.22)
      .setDepth(-8);

    for (let i = 0; i < 26; i += 1) {
      const starX = vistaX - vistaW * 0.44 + ((i * 71) % Math.max(60, vistaW * 0.86));
      const starY = vistaY - vistaH * 0.4 + ((i * 37) % Math.max(36, vistaH * 0.78));
      this.add
        .circle(starX, starY, i % 6 === 0 ? 1.7 : 0.8, 0xe8f2ef, 0.65)
        .setDepth(-7);
    }

    // Warm practical lights: the hangar should feel repaired and lived in.
    const lampXs = [0.12, 0.31, 0.49, 0.66, 0.89];
    for (const ratio of lampXs) {
      const lx = width * ratio;
      this.add
        .rectangle(lx, height * 0.055, 34, 9, 0x4a3e33)
        .setStrokeStyle(2, 0xb9874d)
        .setDepth(-5);
      const glow = this.add
        .ellipse(lx, height * 0.075, 82, 44, 0xffb457, 0.07)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-6);
      this.add
        .circle(lx, height * 0.062, 5, 0xffcf79, 0.96)
        .setDepth(-4);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.045, to: 0.095 },
        duration: 1500 + ratio * 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // Floor perspective, rails, patched plates and orange guide markings.
    const floor = this.add.graphics().setDepth(-4);
    floor.fillStyle(0x29282b, 1);
    floor.fillTriangle(
      width * 0.02,
      height * 0.43,
      width * 0.98,
      height * 0.43,
      width,
      height
    );
    floor.fillTriangle(width * 0.02, height * 0.43, width, height, 0, height);
    floor.lineStyle(2, 0x665d53, 0.72);

    for (let i = 1; i <= 7; i += 1) {
      const y = Phaser.Math.Linear(height * 0.46, height * 0.96, i / 7);
      floor.lineBetween(width * 0.02, y, width * 0.98, y);
    }

    for (let i = -4; i <= 4; i += 1) {
      floor.lineBetween(
        width * 0.5 + i * width * 0.06,
        height * 0.43,
        width * 0.5 + i * width * 0.145,
        height
      );
    }

    floor.lineStyle(5, 0xb46e2b, 0.62);
    floor.lineBetween(width * 0.53, height * 0.49, width * 0.59, height * 0.98);
    floor.lineBetween(width * 0.91, height * 0.5, width * 0.82, height * 0.98);

    // Workshop details.
    this.add
      .rectangle(width * 0.095, height * 0.34, width * 0.12, height * 0.15, 0x25303a)
      .setStrokeStyle(3, 0x715b47)
      .setDepth(-2);

    for (let i = 0; i < 6; i += 1) {
      this.add
        .rectangle(
          width * (0.055 + (i % 3) * 0.04),
          height * (0.305 + Math.floor(i / 3) * 0.055),
          width * 0.026,
          height * 0.025,
          i % 2 === 0 ? 0x485663 : 0x6b4733
        )
        .setStrokeStyle(1, 0xa77c52, 0.55)
        .setDepth(-1);
    }

    this.add
      .text(width * 0.055, height * 0.075, "HANGAR 3", {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(Math.max(25, Math.min(54, width * 0.043)))}px`,
        fontStyle: "800",
        color: "#e9c382"
      })
      .setDepth(2);

    this.add
      .text(
        width * 0.055,
        height * 0.145,
        `Aktiv: ${profile.displayName} · Crew vollständig`,
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "16px",
          color: profile.accentCss
        }
      )
      .setDepth(2);

    const doorX = width * 0.52;
    const doorY = height * 0.29;
    const doorWidth = width * 0.32;
    const doorHeight = height * 0.3;

    if (gateOpen) {
      this.add
        .rectangle(doorX, doorY, doorWidth, doorHeight, 0x07101f)
        .setStrokeStyle(4, 0x536c78)
        .setDepth(1);

      for (let i = 0; i < 16; i += 1) {
        const starX = doorX - doorWidth * 0.43 + ((i * 47) % Math.max(40, doorWidth * 0.86));
        const starY = doorY - doorHeight * 0.4 + ((i * 29) % Math.max(30, doorHeight * 0.78));
        this.add
          .circle(starX, starY, i % 4 === 0 ? 2 : 1, 0xf5efe2, 0.8)
          .setDepth(1.5);
      }

      this.add
        .rectangle(doorX - doorWidth * 0.43, doorY, doorWidth * 0.12, doorHeight, 0x303a43)
        .setStrokeStyle(3, 0x63747a)
        .setDepth(2);
      this.add
        .rectangle(doorX + doorWidth * 0.43, doorY, doorWidth * 0.12, doorHeight, 0x303a43)
        .setStrokeStyle(3, 0x63747a)
        .setDepth(2);
    } else {
      this.add
        .rectangle(doorX, doorY, doorWidth, doorHeight, 0x171c24)
        .setStrokeStyle(5, chapterState.shipTested ? 0xd2a35f : 0x59646a)
        .setDepth(1);

      this.add
        .rectangle(doorX, doorY, width * 0.008, height * 0.29, 0x63747a)
        .setDepth(2);
    }

    const doorHit = this.add
      .rectangle(doorX, doorY, doorWidth, doorHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(3);

    this.add
      .text(
        doorX,
        height * 0.12,
        gateOpen
          ? "STERNENFELD · CINDER"
          : chapterState.shipTested
            ? "✦ STERNENPUNKT · HANGARTOR"
            : "AUSGANG ZUM STERNENFELD",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: gateOpen ? "#9ccfd1" : chapterState.shipTested ? "#e7b96c" : "#82979a"
        }
      )
      .setOrigin(0.5)
      .setDepth(4)
      .setVisible(!compact);

    doorHit.on("pointerdown", () => this.openHotspot("hangar-door"));

    const shipX = width * (compact ? 0.73 : 0.72);
    const shipY = height * (compact ? 0.47 : 0.59);
    const shipScale = compact
      ? Phaser.Math.Clamp(width / 1450, 0.48, 0.58)
      : Phaser.Math.Clamp(width / 1180, 0.68, 1.03);

    const shipShadow = this.add.ellipse(0, 57, 360, 58, 0x000000, 0.34);

    const rearGlowTop = this.add
      .ellipse(-149, -31, 78, 33, chapterState.shipTested ? 0xffaa45 : 0x624b3e, chapterState.shipTested ? 0.48 : 0.18)
      .setBlendMode(Phaser.BlendModes.ADD);
    const rearGlowBottom = this.add
      .ellipse(-149, 29, 78, 33, chapterState.shipTested ? 0xffaa45 : 0x624b3e, chapterState.shipTested ? 0.48 : 0.18)
      .setBlendMode(Phaser.BlendModes.ADD);

    const engineTop = this.add
      .ellipse(-118, -31, 92, 48, 0x4a5054)
      .setStrokeStyle(4, 0xc2894c);
    const engineBottom = this.add
      .ellipse(-118, 29, 92, 48, 0x4a5054)
      .setStrokeStyle(4, 0xc2894c);

    const engineTopCore = this.add
      .circle(-135, -31, 15, chapterState.shipTested ? 0xffb34d : 0x6e523d)
      .setStrokeStyle(3, 0xead0a4);
    const engineBottomCore = this.add
      .circle(-135, 29, 15, chapterState.shipTested ? 0xffb34d : 0x6e523d)
      .setStrokeStyle(3, 0xead0a4);

    const leftWing = this.add
      .triangle(-24, 34, -65, 0, 40, 5, 10, 50, 0x58616a)
      .setStrokeStyle(3, 0xb49d7e);
    const rightWing = this.add
      .triangle(-14, -35, -58, 0, 38, -6, 13, -48, 0x58616a)
      .setStrokeStyle(3, 0xb49d7e);

    const hull = this.add
      .ellipse(20, 0, 305, 100, 0xd4c8b0)
      .setStrokeStyle(4, 0x72685c);

    const nose = this.add
      .triangle(164, 0, -28, -43, 52, 0, -28, 43, 0xb9aa92)
      .setStrokeStyle(3, 0x6b6258);

    const cockpit = this.add
      .ellipse(76, -12, 112, 56, chapterState.navigationRestored ? 0x376c7b : 0x2d4852, 0.96)
      .setStrokeStyle(4, chapterState.navigationRestored ? 0x8bdde4 : 0x587a83);
    const cockpitGlass = this.add
      .ellipse(87, -18, 82, 37, 0x7ec5d6, chapterState.navigationRestored ? 0.26 : 0.1)
      .setStrokeStyle(2, 0xcbeff1, 0.38);

    const dorsal = this.add
      .rectangle(-5, -48, 98, 23, 0x7d7567)
      .setStrokeStyle(3, 0xb8a589)
      .setAngle(-2);

    const blueStripe = this.add
      .rectangle(16, 23, 145, 10, 0x356f8e, 0.9)
      .setAngle(-3);
    const berryStripe = this.add
      .rectangle(10, 34, 74, 8, 0x9d4c67, 0.9)
      .setAngle(-3);
    const amberStripe = this.add
      .rectangle(65, 32, 52, 7, 0xd08b38, 0.95)
      .setAngle(-3);

    const servicePanelA = this.add
      .rectangle(-44, -6, 34, 23, 0x665f55)
      .setStrokeStyle(2, 0xa9916c);
    const servicePanelB = this.add
      .rectangle(13, -31, 27, 18, 0x5f625f)
      .setStrokeStyle(2, 0xb49972);
    const servicePanelC = this.add
      .rectangle(111, 19, 25, 20, 0x766c5c)
      .setStrokeStyle(2, 0x9c8666);

    const energyCell = this.add
      .circle(-48, 10, 8, chapterState.energyCellInstalled ? 0xf4b244 : 0x604739, chapterState.energyCellInstalled ? 1 : 0.55)
      .setStrokeStyle(2, chapterState.energyCellInstalled ? 0xffd78b : 0x856a55);

    const coolingLine = this.add
      .line(0, 0, -66, 40, 34, 40, chapterState.coolingRepaired ? 0x69c7d4 : 0x59636a, chapterState.coolingRepaired ? 0.95 : 0.42)
      .setLineWidth(5);

    const turretBase = this.add
      .ellipse(-4, -67, 42, 18, 0x454d53)
      .setStrokeStyle(3, 0xc18a4c);
    const turret = this.add
      .rectangle(10, -72, 57, 10, 0x5c6265)
      .setStrokeStyle(2, 0xb5996f)
      .setAngle(-5);
    const turretMuzzle = this.add
      .circle(39, -75, 6, 0x2a3034)
      .setStrokeStyle(2, 0xe29b42);

    const antenna = this.add
      .line(0, 0, 5, -56, 14, -94, 0xa8bcc0, 0.9)
      .setLineWidth(2);
    const antennaTip = this.add
      .circle(14, -94, 3.5, chapterState.navigationRestored ? 0x7fe6e6 : 0x9a6a49)
      .setStrokeStyle(1, 0xe3e8dc);

    const gearLeft = this.add
      .line(0, 0, -54, 38, -63, 63, 0x3e4549, 1)
      .setLineWidth(5);
    const gearRight = this.add
      .line(0, 0, 86, 35, 92, 62, 0x3e4549, 1)
      .setLineWidth(5);
    const footLeft = this.add
      .rectangle(-64, 65, 35, 7, 0x252b30)
      .setStrokeStyle(1, 0xb28a58);
    const footRight = this.add
      .rectangle(92, 64, 35, 7, 0x252b30)
      .setStrokeStyle(1, 0xb28a58);

    const shipName = this.add
      .text(27, 4, "STERNE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        fontStyle: "900",
        color: "#243442"
      })
      .setOrigin(0.5);

    const shipContainer = this.add.container(shipX, shipY, [
      shipShadow,
      rearGlowTop,
      rearGlowBottom,
      engineTop,
      engineBottom,
      engineTopCore,
      engineBottomCore,
      leftWing,
      rightWing,
      hull,
      nose,
      blueStripe,
      berryStripe,
      amberStripe,
      servicePanelA,
      servicePanelB,
      servicePanelC,
      coolingLine,
      energyCell,
      dorsal,
      cockpit,
      cockpitGlass,
      turretBase,
      turret,
      turretMuzzle,
      antenna,
      antennaTip,
      gearLeft,
      gearRight,
      footLeft,
      footRight,
      shipName
    ]);

    shipContainer
      .setScale(shipScale)
      .setDepth(shipY - 20)
      .setSize(380, 180)
      .setInteractive({ useHandCursor: true });

    if (chapterState.shipTested) {
      this.tweens.add({
        targets: [rearGlowTop, rearGlowBottom, engineTopCore, engineBottomCore],
        alpha: { from: 0.55, to: 1 },
        scale: { from: 0.96, to: 1.08 },
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    if (chapterState.navigationRestored) {
      this.tweens.add({
        targets: antennaTip,
        alpha: { from: 0.45, to: 1 },
        duration: 760,
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .text(
        shipX,
        shipY + 78 * shipScale,
        chapterState.shipTested ? "DIE STERNENREITER · STARTKLAR" : "DIE STERNENREITER · IN REPARATUR",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "800",
          color: chapterState.shipTested ? "#f1c975" : "#d2b99c",
          backgroundColor: "#10151dcc",
          padding: { x: 8, y: 4 }
        }
      )
      .setOrigin(0.5)
      .setDepth(shipY + 80)
      .setVisible(!compact);

    shipContainer.on("pointerdown", () => this.openHotspot("ship"));

    const benchX = width * (compact ? 0.17 : 0.18);
    const benchY = height * (compact ? 0.49 : 0.56);
    const benchColor = energyRestored ? 0x6b5540 : 0x463c34;
    const benchStroke = energyRestored ? 0xd2a35f : 0x735b49;

    const bench = this.add
      .rectangle(benchX, benchY, Math.min(190, width * 0.21), 56, benchColor)
      .setStrokeStyle(3, benchStroke)
      .setInteractive({ useHandCursor: true })
      .setDepth(benchY);

    this.add
      .rectangle(benchX - 60, benchY + 43, 18, 72, 0x44372e)
      .setDepth(benchY - 1);

    this.add
      .rectangle(benchX + 60, benchY + 43, 18, 72, 0x44372e)
      .setDepth(benchY - 1);

    this.add
      .text(benchX, benchY - 44, energyRestored ? "WERKBANK · ONLINE" : "WERKBANK · OHNE STROM", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "700",
        color: energyRestored ? "#f1c975" : "#a58d76"
      })
      .setOrigin(0.5)
      .setDepth(benchY + 1)
      .setVisible(!compact);

    bench.on("pointerdown", () => this.openHotspot("workbench"));

    const energyX = width * (compact ? 0.35 : 0.34);
    const energyY = height * (compact ? 0.49 : 0.55);

    const energyNode = this.add
      .rectangle(
        energyX,
        energyY,
        Math.min(88, width * 0.085),
        72,
        energyRestored ? 0x254e4f : 0x482d2b
      )
      .setStrokeStyle(3, energyRestored ? 0x74d1c9 : 0xc0715d)
      .setDepth(energyY);

    this.add
      .circle(
        energyX,
        energyY,
        12,
        energyRestored ? 0x7de0d0 : 0xd66f5c,
        energyRestored ? 0.95 : 0.7
      )
      .setDepth(energyY + 1);

    this.add
      .text(energyX, energyY - 54, energyRestored ? "ENERGIE STABIL" : "✦ STERNENPUNKT", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        fontStyle: "700",
        color: energyRestored ? "#9ce6dc" : "#e7a37c"
      })
      .setOrigin(0.5)
      .setDepth(energyY + 2)
      .setVisible(!compact);

    if (energyRestored) {
      const cable = this.add.graphics().setDepth(benchY - 2);
      cable.lineStyle(6, 0x5daeb3, 0.78);
      cable.beginPath();
      cable.moveTo(energyX - 30, energyY + 18);
      cable.lineTo(benchX + 70, benchY + 18);
      cable.lineTo(benchX + 45, benchY + 4);
      cable.strokePath();

      this.add
        .circle(benchX + 72, benchY - 8, 7, 0x79d7ca, 0.9)
        .setDepth(benchY + 3);
    } else {
      energyNode.setInteractive({ useHandCursor: true });
      energyNode.on("pointerdown", () => {
        gameEventBus.emit("interaction:starpoint", hangarEnergyStarPoint);
      });

      this.tweens.add({
        targets: energyNode,
        alpha: { from: 0.72, to: 1 },
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      this.starPoints = [
        {
          data: hangarEnergyStarPoint,
          x: energyX,
          y: energyY + 34
        }
      ];
    }

    this.hotspots = [
      { data: hangarHotspots["hangar-door"], x: doorX, y: height * 0.47 },
      { data: hangarHotspots.ship, x: shipX, y: shipY + 50 },
      { data: hangarHotspots.workbench, x: benchX, y: benchY + 55 }
    ];

    const startX = width * (compact ? 0.5 : 0.48);
    const startY = height * (compact ? 0.66 : 0.72);

    this.player = new PlayerAvatar(this, profile, startX, startY);
    this.player.setPosition(startX, startY);

    const crewProfiles = getCrewMates(profile.id);
    const formation = compact
      ? [
          { x: -72, y: 48 },
          { x: 70, y: 44 }
        ]
      : [
          { x: -105, y: 72 },
          { x: 95, y: 64 }
        ];

    this.crewMates = crewProfiles.map((crewProfile, index) => {
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
        backgroundColor: "#10151ddd",
        padding: compact ? { x: 7, y: 4 } : { x: 11, y: 7 }
      })
      .setOrigin(0.5)
      .setDepth(4000)
      .setVisible(false);
  }

  private nearestInteraction(): NearestInteraction | null {
    if (!this.player || !this.louis) {
      return null;
    }

    const louisDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.louis.x,
      this.louis.y
    );

    let nearest: NearestInteraction = {
      kind: "louis",
      distance: louisDistance
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

    return nearest.distance <= 130 ? nearest : null;
  }

  private updateInteractionHint(): void {
    if (!this.hint) {
      return;
    }

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
      nearest.kind === "starpoint" ? 0x9ceaf0 : 0xf0b45e;

    this.interactionFocus?.show(focusX, focusY, focusColor);
    this.hint.setText(`${label} · E / Aktion`).setVisible(true);
  }

  private openNearestInteraction(): void {
    const nearest = this.nearestInteraction();

    if (!nearest) {
      return;
    }

    this.interactionFocus?.confirm(
      nearest.kind === "starpoint" ? 0x9ceaf0 : 0xf0b45e
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

  private openHotspot(id: HangarHotspotId): void {
    gameEventBus.emit("interaction:hotspot", hangarHotspots[id]);
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
