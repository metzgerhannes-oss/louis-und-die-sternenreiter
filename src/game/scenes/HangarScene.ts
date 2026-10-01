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
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey?: Phaser.Input.Keyboard.Key;
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
    this.setupKeyboard();

    const offMove = gameEventBus.on("input:move", ({ direction, active }) => {
      this.moveState[direction] = active;
    });

    const offInteract = gameEventBus.on("input:interact", () => {
      this.openNearestInteraction();
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
      offStarPointCompleted();
      offChapterState();
      this.scale.off("resize", onResize);
      this.crewMates = [];
      this.starPoints = [];

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

    if (dx !== 0 || dy !== 0) {
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
      const nextY = Phaser.Math.Clamp(
        this.player.y + dy * speed * 0.72 * seconds,
        height * 0.48,
        height * 0.86
      );

      this.player.setPosition(nextX, nextY);
    }

    for (const crewMate of this.crewMates) {
      crewMate.updateFollow(this.player.x, this.player.y, delta);
    }

    this.louis.updateFollow(this.player.x, this.player.y, delta);
    this.updateInteractionHint();

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
  }

  private drawHangar(profile: PlayerProfile): void {
    const { width, height } = this.scale;
    const chapterState = loadChapter1State();
    const energyRestored = isStarPointCompleted(hangarEnergyStarPoint.id);
    const gateOpen = isStarPointCompleted(hangarGateStarPoint.id);

    this.add.rectangle(width / 2, height / 2, width, height, 0x10151d);

    const backWall = this.add
      .rectangle(width * 0.5, height * 0.27, width * 0.94, height * 0.42, 0x222933)
      .setStrokeStyle(3, 0x394550);
    backWall.setDepth(0);

    const floor = this.add.graphics();
    floor.fillStyle(0x343238, 1);
    floor.fillTriangle(
      width * 0.04,
      height * 0.43,
      width * 0.96,
      height * 0.43,
      width,
      height
    );
    floor.fillTriangle(width * 0.04, height * 0.43, width, height, 0, height);
    floor.lineStyle(2, 0x675c51, 0.75);

    for (let i = 1; i <= 5; i += 1) {
      const y = Phaser.Math.Linear(height * 0.48, height * 0.92, i / 5);
      floor.lineBetween(width * 0.04, y, width * 0.96, y);
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
      .setDepth(4);

    doorHit.on("pointerdown", () => this.openHotspot("hangar-door"));

    const shipX = width * 0.72;
    const shipY = height * 0.58;
    const ship = this.add
      .ellipse(
        shipX,
        shipY,
        Math.min(390, width * 0.34),
        Math.min(150, height * 0.2),
        0x765b48
      )
      .setStrokeStyle(4, 0xb98761)
      .setInteractive({ useHandCursor: true })
      .setDepth(shipY - 20);

    this.add
      .triangle(shipX + width * 0.12, shipY, 0, -35, 74, 0, 0, 35, 0x584c46)
      .setDepth(shipY - 19);

    this.add
      .circle(shipX - 25, shipY - 14, 22, chapterState.navigationRestored ? 0x3c7d87 : 0x274f59)
      .setStrokeStyle(3, chapterState.navigationRestored ? 0x9ce6dc : 0x73afb6)
      .setDepth(shipY - 18);

    if (chapterState.energyCellInstalled) {
      this.add
        .circle(shipX + 28, shipY + 10, 7, 0xe1b45e, 0.95)
        .setDepth(shipY + 4);
    }

    if (chapterState.coolingRepaired) {
      const cooling = this.add.graphics().setDepth(shipY + 2);
      cooling.lineStyle(5, 0x5daeb3, 0.9);
      cooling.beginPath();
      cooling.moveTo(shipX - 70, shipY + 38);
      cooling.lineTo(shipX + 38, shipY + 38);
      cooling.strokePath();
    }

    if (chapterState.navigationRestored) {
      this.add
        .line(shipX, shipY, 28, -45, 42, -83, 0x9ccfd1, 0.9)
        .setLineWidth(2)
        .setDepth(shipY - 17);
      this.add
        .circle(shipX + 42, shipY - 83, 4, 0x9ccfd1, 1)
        .setDepth(shipY - 16);
    }

    if (chapterState.shipTested) {
      this.add
        .ellipse(shipX - 155, shipY - 27, 42, 24, 0x5a5650)
        .setStrokeStyle(3, 0xd2a35f)
        .setDepth(shipY - 17);
      this.add
        .ellipse(shipX - 155, shipY + 28, 42, 24, 0x5a5650)
        .setStrokeStyle(3, 0xd2a35f)
        .setDepth(shipY - 17);
      this.add
        .ellipse(shipX - 181, shipY - 27, 46, 12, 0xe7a84f, 0.5)
        .setDepth(shipY - 18);
      this.add
        .ellipse(shipX - 181, shipY + 28, 46, 12, 0xe7a84f, 0.5)
        .setDepth(shipY - 18);
    }

    this.add
      .text(
        shipX,
        shipY + 52,
        chapterState.shipTested ? "Sternenschiff · STARTKLAR" : "altes Sternenschiff",
        {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
          color: chapterState.shipTested ? "#f1c975" : "#d2b99c"
        }
      )
      .setOrigin(0.5)
      .setDepth(shipY + 53);

    ship.on("pointerdown", () => this.openHotspot("ship"));

    const benchX = width * 0.18;
    const benchY = height * 0.56;
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
      .setDepth(benchY + 1);

    bench.on("pointerdown", () => this.openHotspot("workbench"));

    const energyX = width * 0.34;
    const energyY = height * 0.55;

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
      .setDepth(energyY + 2);

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

    const startX = width * 0.48;
    const startY = height * 0.72;

    this.player = new PlayerAvatar(this, profile, startX, startY);
    this.player.setPosition(startX, startY);

    const crewProfiles = getCrewMates(profile.id);
    const formation = [
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

    this.louis = new LouisCompanion(this, startX - 62, startY + 20, () => {
      gameEventBus.emit("interaction:louis", undefined);
    });

    this.hint = this.add
      .text(width / 2, height * 0.43, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "700",
        color: "#fff7e7",
        backgroundColor: "#10151ddd",
        padding: { x: 11, y: 7 }
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
      return;
    }

    const label =
      nearest.kind === "louis"
        ? "Mit Louis sprechen"
        : nearest.kind === "starpoint"
          ? "Louis zeigt einen Sternenpunkt"
          : nearest.hotspot.data.title;

    this.hint.setText(`${label} · E / Aktion`).setVisible(true);
  }

  private openNearestInteraction(): void {
    const nearest = this.nearestInteraction();

    if (!nearest) {
      return;
    }

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
}
