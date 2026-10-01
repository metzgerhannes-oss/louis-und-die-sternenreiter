import Phaser from "phaser";
import {
  adventureWorlds,
  type AdventureHotspot,
  type AdventureWorld,
  type AdventureWorldId
} from "../../domain/adventure";
import {
  getCrewMates,
  playerProfiles,
  type PlayerProfile
} from "../../domain/profiles";
import type { StarPointDefinition } from "../../domain/starPoints";
import {
  getAdventureStep,
  loadAdventureState
} from "../../services/adventureState";
import { isStarPointCompleted } from "../../services/starPointState";
import { CrewMate } from "../entities/CrewMate";
import { LouisCompanion } from "../entities/LouisCompanion";
import { PlayerAvatar } from "../entities/PlayerAvatar";
import { gameEventBus, type MoveDirection } from "../EventBus";

type RuntimeHotspot = {
  data: AdventureHotspot;
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

export class AdventureScene extends Phaser.Scene {
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
    super("AdventureScene");
  }

  create(): void {
    const profile =
      (this.game.registry.get("activeProfile") as PlayerProfile | undefined) ??
      playerProfiles[0];

    const state = loadAdventureState();
    const registryWorld = this.game.registry.get("activeWorld") as
      | AdventureWorldId
      | undefined;
    const worldId = registryWorld ?? state.currentWorld;
    const world = adventureWorlds[worldId];

    this.game.registry.set("activeWorld", worldId);
    this.drawWorld(world, profile);
    this.setupKeyboard();

    const offMove = gameEventBus.on("input:move", ({ direction, active }) => {
      this.moveState[direction] = active;
    });

    const offInteract = gameEventBus.on("input:interact", () => {
      this.openNearestInteraction(world.id);
    });

    const offScanner = gameEventBus.on("ui:scanner:pulse", () => {
      this.pulseScanner();
    });

    const offPing = gameEventBus.on("ui:louis:ping", () => {
      if (!this.louis) return;

      const bubble = this.add
        .text(this.louis.x, this.louis.y - 74, "Hier!", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "18px",
          fontStyle: "700",
          color: "#fff8e8",
          backgroundColor: "#1b3641dd",
          padding: { x: 10, y: 6 }
        })
        .setOrigin(0.5)
        .setDepth(5000);

      this.tweens.add({
        targets: bubble,
        y: bubble.y - 20,
        alpha: 0,
        duration: 1100,
        ease: "Sine.easeOut",
        onComplete: () => bubble.destroy()
      });
    });

    const offStarPoint = gameEventBus.on("starpoint:completed", () => {
      this.scene.restart();
    });

    const offAdventure = gameEventBus.on("adventure:state-changed", () => {
      const latest = loadAdventureState();
      this.game.registry.set("activeWorld", latest.currentWorld);
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
      offAdventure();
      this.scale.off("resize", onResize);
      this.crewMates = [];
      this.starPoints = [];
      this.hotspots = [];

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

      const { width, height } = this.scale;
      const seconds = delta / 1000;
      const speed = 245;

      this.player.setPosition(
        Phaser.Math.Clamp(
          this.player.x + dx * speed * seconds,
          width * 0.06,
          width * 0.94
        ),
        Phaser.Math.Clamp(
          this.player.y + dy * speed * 0.74 * seconds,
          height * 0.47,
          height * 0.9
        )
      );
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
      const worldId =
        (this.game.registry.get("activeWorld") as AdventureWorldId | undefined) ??
        loadAdventureState().currentWorld;
      this.openNearestInteraction(worldId);
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

  private drawWorld(world: AdventureWorld, profile: PlayerProfile): void {
    const { width, height } = this.scale;
    const state = loadAdventureState();
    const step = getAdventureStep(state, world.id);

    this.add.rectangle(width / 2, height / 2, width, height, world.theme.sky);

    this.add
      .rectangle(
        width / 2,
        height * 0.28,
        width,
        height * 0.34,
        world.theme.horizon
      )
      .setDepth(0);

    const ground = this.add.graphics().setDepth(1);
    ground.fillStyle(world.theme.ground, 1);
    ground.fillRect(0, height * 0.42, width, height * 0.58);

    for (let i = 0; i < 6; i += 1) {
      const y = height * (0.48 + i * 0.07);
      ground.lineStyle(2, world.theme.accent, 0.12 + i * 0.02);
      ground.lineBetween(0, y, width, y + (i % 2 === 0 ? 7 : -7));
    }

    this.drawWorldDecor(world, width, height);

    this.add
      .text(width * 0.045, height * 0.062, world.title.toUpperCase(), {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(Math.max(26, Math.min(58, width * 0.045)))}px`,
        fontStyle: "900",
        color: world.theme.labelColor
      })
      .setDepth(10);

    this.add
      .text(width * 0.047, height * 0.135, world.subtitle, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color: world.theme.labelColor
      })
      .setAlpha(0.78)
      .setDepth(10);

    this.hotspots = [];

    for (const hotspot of world.hotspots) {
      const x = width * hotspot.x;
      const y = height * hotspot.y;
      const active =
        step.kind === "story" && step.hotspotId === hotspot.id;

      const marker = this.add
        .rectangle(
          x,
          y,
          Math.max(82, width * 0.09),
          Math.max(54, height * 0.065),
          active ? world.theme.accent : world.theme.horizon,
          active ? 0.86 : 0.62
        )
        .setStrokeStyle(3, active ? world.theme.glow : world.theme.accent, active ? 1 : 0.5)
        .setDepth(y)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(x, y, hotspot.title, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "700",
          color: active ? "#10151d" : world.theme.labelColor,
          align: "center",
          wordWrap: { width: Math.max(76, width * 0.08) }
        })
        .setOrigin(0.5)
        .setDepth(y + 1);

      marker.on("pointerdown", () => {
        gameEventBus.emit("interaction:hotspot", {
          area: "adventure",
          worldId: world.id,
          ...hotspot
        });
      });

      if (active) {
        this.tweens.add({
          targets: marker,
          alpha: { from: 0.72, to: 1 },
          scale: { from: 0.96, to: 1.05 },
          yoyo: true,
          repeat: -1,
          duration: 850
        });
      }

      this.hotspots.push({ data: hotspot, x, y });
    }

    this.starPoints = [];
    if (step.kind === "starpoint") {
      const x = width * step.x;
      const y = height * step.y;
      const completed = isStarPointCompleted(step.point.id);

      const star = this.add
        .star(
          x,
          y,
          8,
          completed ? 12 : 10,
          completed ? 29 : 25,
          completed ? world.theme.glow : world.theme.accent,
          completed ? 0.55 : 0.95
        )
        .setStrokeStyle(3, world.theme.glow)
        .setDepth(2500);

      if (!completed) {
        star.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
          gameEventBus.emit("interaction:starpoint", step.point);
        });

        this.tweens.add({
          targets: star,
          angle: 45,
          scale: { from: 0.88, to: 1.14 },
          alpha: { from: 0.7, to: 1 },
          yoyo: true,
          repeat: -1,
          duration: 900
        });

        this.starPoints.push({ data: step.point, x, y });
      }
    }

    this.drawCompletedCreations(world);

    const startX = width * 0.48;
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
        backgroundColor: "#10151ddd",
        padding: { x: 11, y: 7 }
      })
      .setOrigin(0.5)
      .setDepth(5000)
      .setVisible(false);
  }

  private drawWorldDecor(world: AdventureWorld, width: number, height: number): void {
    const accent = world.theme.accent;
    const glow = world.theme.glow;

    if (world.id === "moss") {
      for (let i = 0; i < 9; i += 1) {
        const x = width * (0.08 + i * 0.11);
        const y = height * (0.34 + (i % 3) * 0.045);
        this.add
          .ellipse(x, y, 75 + (i % 3) * 28, 24, accent, 0.5)
          .setAngle(i % 2 ? 18 : -16)
          .setDepth(2);
        this.add.circle(x + 12, y - 18, 5, glow, 0.8).setDepth(3);
      }
      return;
    }

    if (world.id === "junction-12") {
      for (let i = 0; i < 7; i += 1) {
        const x = width * (0.1 + i * 0.13);
        const h = height * (0.12 + (i % 3) * 0.05);
        this.add
          .rectangle(x, height * 0.38 - h / 2, 54, h, i % 2 ? 0x312a46 : 0x263b4a)
          .setStrokeStyle(2, i % 2 ? accent : glow, 0.75)
          .setDepth(2);
        this.add.circle(x + 16, height * 0.38 - h - 14, 4, glow, 0.8).setDepth(3);
      }
      return;
    }

    if (world.id === "empty-path") {
      for (let i = 0; i < 22; i += 1) {
        this.add
          .circle(
            width * (((i * 37) % 97) / 100),
            height * (0.12 + (((i * 19) % 31) / 100)),
            i % 5 === 0 ? 2.2 : 1.2,
            glow,
            0.7
          )
          .setDepth(2);
      }
      this.add
        .ellipse(width * 0.5, height * 0.4, width * 0.3, 22, accent, 0.18)
        .setStrokeStyle(2, glow, 0.55)
        .setDepth(3);
      return;
    }

    if (world.id === "distortion") {
      this.add.circle(width * 0.18, height * 0.31, 70, 0x5dbd83, 0.35).setDepth(2);
      this.add.rectangle(width * 0.5, height * 0.31, 140, 70, 0xb95b3d, 0.35).setDepth(2);
      this.add.triangle(width * 0.8, height * 0.33, 0, 70, 70, 0, 140, 70, 0xd66fba, 0.35).setDepth(2);
      return;
    }

    if (world.id === "glass-coast") {
      for (let i = 0; i < 10; i += 1) {
        const x = width * (0.05 + i * 0.1);
        this.add
          .polygon(
            x,
            height * 0.37,
            [0, 45, 22, 0, 44, 45, 24, 58],
            i % 2 ? accent : glow,
            0.35
          )
          .setStrokeStyle(2, glow, 0.65)
          .setDepth(2);
      }
      return;
    }

    if (world.id === "cloud-ocean") {
      for (let i = 0; i < 8; i += 1) {
        this.add
          .ellipse(
            width * (0.08 + i * 0.13),
            height * (0.27 + (i % 2) * 0.08),
            150,
            46,
            glow,
            0.22
          )
          .setDepth(2);
      }
      return;
    }

    if (world.id === "scrap-ring") {
      for (let i = 0; i < 12; i += 1) {
        const x = width * (((i * 17) % 91) / 100);
        const y = height * (0.23 + (((i * 11) % 18) / 100));
        this.add
          .rectangle(x, y, 38 + (i % 3) * 18, 10 + (i % 2) * 13, accent, 0.32)
          .setAngle((i * 23) % 160)
          .setDepth(2);
      }
      return;
    }

    const coreX = width * 0.52;
    const coreY = height * 0.33;
    this.add
      .circle(coreX, coreY, Math.min(105, width * 0.1), 0x102d36, 0.9)
      .setStrokeStyle(5, glow, 0.8)
      .setDepth(2);
    for (let i = 0; i < 6; i += 1) {
      this.add
        .circle(coreX, coreY, 34 + i * 18, accent, 0)
        .setStrokeStyle(2, i % 2 ? glow : accent, 0.35)
        .setDepth(3);
    }
  }

  private drawCompletedCreations(world: AdventureWorld): void {
    const { width, height } = this.scale;
    const completedPoints = world.steps.filter(
      (step): step is Extract<(typeof world.steps)[number], { kind: "starpoint" }> =>
        step.kind === "starpoint" && isStarPointCompleted(step.point.id)
    );

    completedPoints.forEach((step, index) => {
      const x = width * (0.12 + index * 0.09);
      const y = height * 0.42;

      this.add
        .star(x, y, 6, 5, 12, world.theme.glow, 0.7)
        .setStrokeStyle(2, world.theme.accent, 0.7)
        .setDepth(20);

      this.add
        .text(x, y + 22, "gebaut", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: world.theme.labelColor
        })
        .setOrigin(0.5)
        .setDepth(21);
    });
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

  private openNearestInteraction(worldId: AdventureWorldId): void {
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

    gameEventBus.emit("interaction:hotspot", {
      area: "adventure",
      worldId,
      ...nearest.hotspot.data
    });
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
