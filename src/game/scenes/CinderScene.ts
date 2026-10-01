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

    if (dx !== 0 || dy !== 0) {
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
      const nextY = Phaser.Math.Clamp(
        this.player.y + dy * speed * 0.74 * seconds,
        height * 0.46,
        height * 0.9
      );

      this.player.setPosition(nextX, nextY);
    }

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

    this.add.rectangle(width / 2, height / 2, width, height, 0x9b4935);

    this.add
      .rectangle(width / 2, height * 0.18, width, height * 0.36, 0xd98255)
      .setDepth(0);

    this.add
      .circle(width * 0.82, height * 0.12, Math.max(38, width * 0.045), 0xf5c66f, 0.84)
      .setDepth(0);

    const mesas = this.add.graphics().setDepth(1);
    mesas.fillStyle(0x6e352c, 1);
    mesas.fillTriangle(0, height * 0.44, width * 0.18, height * 0.22, width * 0.34, height * 0.44);
    mesas.fillTriangle(width * 0.23, height * 0.44, width * 0.44, height * 0.26, width * 0.62, height * 0.44);
    mesas.fillTriangle(width * 0.55, height * 0.44, width * 0.77, height * 0.2, width, height * 0.44);

    const ground = this.add.graphics().setDepth(2);
    ground.fillStyle(0x8c4a38, 1);
    ground.fillRect(0, height * 0.41, width, height * 0.59);
    ground.lineStyle(2, 0xbd7352, 0.5);
    for (let i = 0; i < 7; i += 1) {
      const y = height * 0.49 + i * height * 0.065;
      ground.lineBetween(0, y, width, y + ((i % 2) * 12 - 6));
    }

    this.add
      .text(width * 0.045, height * 0.065, "CINDER", {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(Math.max(26, Math.min(58, width * 0.048)))}px`,
        fontStyle: "900",
        color: "#ffe0a6"
      })
      .setDepth(3);

    this.add
      .text(width * 0.047, height * 0.135, "Staubhafen · roter Außenposten", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color: "#f0b18e"
      })
      .setDepth(3);

    this.drawShip(width * 0.16, height * 0.7, state.complete);
    this.drawSettlement(width * 0.74, height * 0.56, distributionBuilt);
    this.drawCondensers(width * 0.28, height * 0.54, moistureRestored);
    this.drawWorkshop(width * 0.84, height * 0.72, state.waterCelebrated);

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
        x: width * 0.16,
        y: height * 0.74
      },
      {
        data: cinderHotspots.settlement,
        x: width * 0.74,
        y: height * 0.63
      },
      {
        data: cinderHotspots.condensers,
        x: width * 0.28,
        y: height * 0.61
      },
      {
        data: cinderHotspots.workshop,
        x: width * 0.84,
        y: height * 0.77
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

    const startX = width * 0.47;
    const startY = height * 0.78;

    this.player = new PlayerAvatar(this, profile, startX, startY);
    this.player.setPosition(startX, startY);

    const formation = [
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

    this.louis = new LouisCompanion(this, startX - 62, startY + 20, () => {
      gameEventBus.emit("interaction:louis", undefined);
    });

    this.hint = this.add
      .text(width / 2, height * 0.43, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "700",
        color: "#fff7e7",
        backgroundColor: "#4e2b24dd",
        padding: { x: 11, y: 7 }
      })
      .setOrigin(0.5)
      .setDepth(4000)
      .setVisible(false);
  }

  private drawShip(x: number, y: number, upgraded: boolean): void {
    this.add
      .ellipse(x, y, 230, 92, 0xb9a38a)
      .setStrokeStyle(4, 0x6a5546)
      .setDepth(y - 18);

    this.add
      .ellipse(x - 96, y - 26, 72, 34, 0x61584f)
      .setStrokeStyle(3, upgraded ? 0xf0b45e : 0x8e7965)
      .setDepth(y - 17);

    this.add
      .ellipse(x - 96, y + 28, 72, 34, 0x61584f)
      .setStrokeStyle(3, upgraded ? 0xf0b45e : 0x8e7965)
      .setDepth(y - 17);

    this.add
      .ellipse(x + 56, y - 13, 68, 38, 0x305e69)
      .setStrokeStyle(3, 0x75c3c7)
      .setDepth(y - 16);
  }

  private drawSettlement(x: number, y: number, waterRestored: boolean): void {
    const buildingA = this.add
      .rectangle(x - 70, y, 100, 82, 0x765143)
      .setStrokeStyle(3, 0xa56d50)
      .setDepth(y);

    const buildingB = this.add
      .rectangle(x + 38, y - 10, 120, 100, 0x68504a)
      .setStrokeStyle(3, 0x96705d)
      .setDepth(y - 2);

    this.add
      .rectangle(x + 16, y - 67, 165, 10, 0x4b423d)
      .setAngle(-4)
      .setDepth(y - 3);

    this.add
      .text(x, y - 88, waterRestored ? "STAUBHAFEN · WASSER LÄUFT" : "STAUBHAFEN", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "800",
        color: waterRestored ? "#9bd7d8" : "#e8c39e"
      })
      .setOrigin(0.5)
      .setDepth(y + 2);

    buildingA.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.settlement);
    });
    buildingB.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.settlement);
    });
  }

  private drawCondensers(x: number, y: number, restored: boolean): void {
    for (let i = -1; i <= 1; i += 1) {
      const px = x + i * 62;
      this.add
        .rectangle(px, y, 14, 96, 0x574940)
        .setStrokeStyle(2, 0x8e7561)
        .setDepth(y - 1);
      this.add
        .ellipse(px, y - 46, 54, 18, restored ? 0x6b8f8b : 0x6d6257)
        .setStrokeStyle(2, restored ? 0x9bd7d8 : 0x988575)
        .setDepth(y);
    }

    const hit = this.add
      .rectangle(x, y, 220, 128, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(y + 3);

    hit.on("pointerdown", () => {
      gameEventBus.emit("interaction:hotspot", cinderHotspots.condensers);
    });

    this.add
      .text(x, y - 88, restored ? "KONDENSATOREN · AKTIV" : "ALTE KONDENSATOREN", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        fontStyle: "700",
        color: restored ? "#9bd7d8" : "#d7ad8a"
      })
      .setOrigin(0.5)
      .setDepth(y + 5);
  }

  private drawWorkshop(x: number, y: number, available: boolean): void {
    const workshop = this.add
      .rectangle(x, y, 150, 86, 0x554138)
      .setStrokeStyle(3, available ? 0xd2a35f : 0x7b5d4f)
      .setInteractive({ useHandCursor: true })
      .setDepth(y);

    this.add
      .text(x, y - 58, available ? "RIKAS WERKSTATT · ETWAS WARTET" : "RIKAS WERKSTATT", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "700",
        color: available ? "#f1c975" : "#c89b7d"
      })
      .setOrigin(0.5)
      .setDepth(y + 2);

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
    if (!nearest) return;

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
