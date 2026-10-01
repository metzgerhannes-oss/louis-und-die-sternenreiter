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
import { AmbientMotionLayer } from "../effects/AmbientMotionLayer";
import { InteractionFocus } from "../effects/InteractionFocus";
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
  private interactionFocus?: InteractionFocus;
  private atmosphere?: AmbientMotionLayer;
  private interactionColor = 0x65c8df;
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
    this.atmosphere = new AmbientMotionLayer(this, world.id);
    this.interactionFocus = new InteractionFocus(this, this.interactionColor);
    this.setupKeyboard();
    this.cameras.main.fadeIn(320, 7, 12, 18);

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
      this.interactionFocus = undefined;
      this.atmosphere = undefined;
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

    const playerMoving = dx !== 0 || dy !== 0;

    if (playerMoving) {
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
          height * (width <= 860 && height > width ? 0.37 : 0.47),
          height * (width <= 860 && height > width ? 0.78 : 0.9)
        )
      );
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
    const compact = width <= 860 && height > width;
    this.interactionColor = world.theme.accent;

    this.cameras.main.setBackgroundColor("#070c12");

    const sky = this.add.graphics().setDepth(-30);
    sky.fillGradientStyle(
      world.theme.sky,
      world.theme.sky,
      world.theme.horizon,
      world.theme.horizon,
      1
    );
    sky.fillRect(0, 0, width, height * 0.48);

    const horizonGlow = this.add
      .ellipse(
        width * 0.5,
        height * 0.36,
        width * 0.96,
        height * 0.18,
        world.theme.glow,
        world.id === "empty-path" ? 0.025 : 0.055
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-22);

    const celestialX =
      world.id === "cloud-ocean" || world.id === "glass-coast"
        ? width * 0.82
        : width * 0.18;
    const celestialY = height * (world.id === "empty-path" ? 0.17 : 0.14);
    const celestialRadius = Math.max(32, width * 0.038);

    this.add
      .circle(
        celestialX,
        celestialY,
        celestialRadius,
        world.theme.glow,
        world.id === "empty-path" ? 0.16 : 0.3
      )
      .setDepth(-20);
    this.add
      .circle(
        celestialX,
        celestialY,
        celestialRadius * 1.9,
        world.theme.accent,
        0.045
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-21);

    const ground = this.add.graphics().setDepth(-4);
    ground.fillGradientStyle(
      world.theme.ground,
      world.theme.ground,
      world.theme.sky,
      world.theme.sky,
      1
    );
    ground.fillRect(0, height * 0.41, width, height * 0.59);

    // Perspective structure keeps each world readable as a playable space.
    for (let i = 0; i < 7; i += 1) {
      const y = height * (0.47 + i * 0.071);
      ground.lineStyle(2, world.theme.accent, 0.08 + i * 0.018);
      ground.lineBetween(0, y, width, y + (i % 2 === 0 ? 7 : -7));
    }

    for (let i = -4; i <= 4; i += 1) {
      ground.lineStyle(1, world.theme.glow, 0.055);
      ground.lineBetween(
        width * 0.5 + i * width * 0.045,
        height * 0.42,
        width * 0.5 + i * width * 0.135,
        height
      );
    }

    this.drawWorldDecor(world, width, height);
    this.drawForegroundAccents(world, width, height);

    const titlePanel = this.add
      .rectangle(
        width * 0.045,
        height * 0.058,
        Math.min(width * 0.44, 430),
        Math.min(height * 0.115, 88),
        0x08121c,
        0.72
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, world.theme.accent, 0.3)
      .setDepth(9)
      .setVisible(!compact);

    this.add
      .rectangle(
        width * 0.045,
        height * 0.058,
        5,
        Math.min(height * 0.115, 88),
        world.theme.accent,
        0.9
      )
      .setOrigin(0, 0)
      .setDepth(10)
      .setVisible(!compact);

    this.add
      .text(width * 0.061, height * 0.07, world.title.toUpperCase(), {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(Math.max(25, Math.min(52, width * 0.041)))}px`,
        fontStyle: "900",
        color: world.theme.labelColor
      })
      .setDepth(11)
      .setVisible(!compact);

    this.add
      .text(width * 0.063, height * 0.132, world.subtitle, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#e9eee9"
      })
      .setAlpha(0.72)
      .setDepth(11)
      .setVisible(!compact);

    void titlePanel;

    this.hotspots = [];

    for (const hotspot of world.hotspots) {
      const x = width * hotspot.x;
      const y = height * hotspot.y;
      const active = step.kind === "story" && step.hotspotId === hotspot.id;

      const outer = this.add
        .circle(
          x,
          y,
          active ? 31 : 25,
          world.theme.accent,
          active ? 0.18 : 0.08
        )
        .setStrokeStyle(
          active ? 3 : 2,
          active ? world.theme.glow : world.theme.accent,
          active ? 0.95 : 0.45
        )
        .setDepth(y - 2);

      const marker = this.add
        .star(
          x,
          y,
          6,
          active ? 8 : 7,
          active ? 17 : 14,
          active ? world.theme.glow : world.theme.accent,
          active ? 0.9 : 0.7
        )
        .setStrokeStyle(2, world.theme.glow, active ? 1 : 0.52)
        .setDepth(y - 1);

      this.add
        .line(x, y, 0, 26, 0, 48, world.theme.accent, 0.52)
        .setLineWidth(2)
        .setDepth(y - 1);

      const label = this.add
        .text(x, y + 57, hotspot.title, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          fontStyle: "800",
          color: active ? "#fff7df" : world.theme.labelColor,
          align: "center",
          backgroundColor: "#08121ddd",
          padding: { x: 7, y: 4 },
          wordWrap: { width: Math.max(110, width * 0.12) }
        })
        .setOrigin(0.5, 0)
        .setDepth(y + 2)
        .setVisible(!compact);

      const hit = this.add
        .zone(x, y + 18, Math.max(110, width * 0.12), 92)
        .setInteractive({ useHandCursor: true })
        .setDepth(y + 3);

      hit.on("pointerdown", () => {
        gameEventBus.emit("interaction:hotspot", {
          area: "adventure",
          worldId: world.id,
          ...hotspot
        });
      });

      if (active) {
        this.tweens.add({
          targets: [outer, marker],
          alpha: { from: 0.55, to: 1 },
          scale: { from: 0.9, to: 1.13 },
          yoyo: true,
          repeat: -1,
          duration: 760,
          ease: "Sine.easeInOut"
        });

        this.tweens.add({
          targets: label,
          y: label.y - 4,
          duration: 950,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }

      this.hotspots.push({ data: hotspot, x, y });
    }

    this.starPoints = [];
    if (step.kind === "starpoint") {
      const x = width * step.x;
      const y = height * step.y;
      const completed = isStarPointCompleted(step.point.id);

      const halo = this.add
        .circle(
          x,
          y,
          completed ? 38 : 44,
          completed ? world.theme.glow : world.theme.accent,
          completed ? 0.06 : 0.1
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(2498);

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
          targets: [star, halo],
          angle: 45,
          scale: { from: 0.86, to: 1.16 },
          alpha: { from: 0.58, to: 1 },
          yoyo: true,
          repeat: -1,
          duration: 880,
          ease: "Sine.easeInOut"
        });

        this.starPoints.push({ data: step.point, x, y });
      }
    }

    this.drawCompletedCreations(world);

    const startX = width * (compact ? 0.5 : 0.48);
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
        backgroundColor: "#10151ddd",
        padding: compact ? { x: 7, y: 4 } : { x: 11, y: 7 }
      })
      .setOrigin(0.5)
      .setDepth(5000)
      .setVisible(false);
  }

  private drawForegroundAccents(
    world: AdventureWorld,
    width: number,
    height: number
  ): void {
    const edgeDepth = 28;

    if (world.id === "moss") {
      for (let i = 0; i < 7; i += 1) {
        const left = i < 4;
        const x = left
          ? width * (0.015 + i * 0.035)
          : width * (0.87 + (i - 4) * 0.045);
        const h = height * (0.12 + (i % 3) * 0.055);
        this.add
          .rectangle(x, height - h * 0.45, 9, h, 0x244c3c, 0.96)
          .setAngle(left ? -8 : 9)
          .setDepth(edgeDepth);
        this.add
          .ellipse(
            x + (left ? 14 : -14),
            height - h,
            64 + (i % 2) * 28,
            24,
            world.theme.accent,
            0.48
          )
          .setAngle(left ? -18 : 18)
          .setDepth(edgeDepth + 1);
      }
      return;
    }

    if (world.id === "junction-12") {
      for (let i = 0; i < 5; i += 1) {
        const x = i < 3 ? width * (0.02 + i * 0.045) : width * (0.91 + (i - 3) * 0.045);
        const h = height * (0.12 + (i % 2) * 0.07);
        this.add
          .rectangle(x, height - h / 2, 34 + (i % 2) * 18, h, 0x17242f, 0.92)
          .setStrokeStyle(2, world.theme.accent, 0.3)
          .setDepth(edgeDepth);
      }
      return;
    }

    if (world.id === "glass-coast") {
      for (let i = 0; i < 8; i += 1) {
        const x = i < 4 ? width * (0.015 + i * 0.03) : width * (0.88 + (i - 4) * 0.03);
        const h = 45 + (i % 4) * 24;
        this.add
          .polygon(
            x,
            height - h * 0.3,
            [0, h, 13, 0, 28, h, 20, h + 12, 5, h + 10],
            i % 2 ? world.theme.accent : world.theme.glow,
            0.35
          )
          .setStrokeStyle(2, world.theme.glow, 0.45)
          .setDepth(edgeDepth);
      }
      return;
    }

    if (world.id === "cloud-ocean") {
      for (let i = 0; i < 7; i += 1) {
        this.add
          .ellipse(
            width * (0.03 + i * 0.16),
            height * (0.9 + (i % 2) * 0.035),
            180 + (i % 3) * 55,
            52,
            0xffffff,
            0.12
          )
          .setDepth(edgeDepth);
      }
      return;
    }

    if (world.id === "scrap-ring") {
      for (let i = 0; i < 10; i += 1) {
        const x = i < 5 ? width * (0.015 + i * 0.035) : width * (0.84 + (i - 5) * 0.035);
        this.add
          .rectangle(
            x,
            height * (0.88 + (i % 3) * 0.025),
            30 + (i % 4) * 18,
            9 + (i % 2) * 10,
            i % 2 ? world.theme.accent : 0x625d58,
            0.48
          )
          .setAngle((i * 37) % 170)
          .setDepth(edgeDepth);
      }
      return;
    }

    // Empty Path, Distortion and Heart: drifting luminous traces frame the play space.
    for (let i = 0; i < 12; i += 1) {
      const mote = this.add
        .circle(
          width * (((i * 41) % 97) / 100),
          height * (0.73 + (((i * 17) % 23) / 100)),
          2 + (i % 3),
          i % 2 ? world.theme.glow : world.theme.accent,
          0.18 + (i % 4) * 0.06
        )
        .setDepth(edgeDepth);

      this.tweens.add({
        targets: mote,
        y: mote.y - 18 - (i % 4) * 7,
        alpha: { from: mote.alpha, to: 0.03 },
        duration: 1800 + i * 130,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private drawWorldDecor(world: AdventureWorld, width: number, height: number): void {
    const accent = world.theme.accent;
    const glow = world.theme.glow;

    this.drawAtmosphere(world, width, height);

    if (world.id === "moss") {
      this.drawMossVista(width, height, accent, glow);
      return;
    }

    if (world.id === "junction-12") {
      this.drawJunctionVista(width, height, accent, glow);
      return;
    }

    if (world.id === "empty-path") {
      this.drawEmptyPathVista(width, height, accent, glow);
      return;
    }

    if (world.id === "distortion") {
      this.drawDistortionVista(width, height, accent, glow);
      return;
    }

    if (world.id === "glass-coast") {
      this.drawGlassCoastVista(width, height, accent, glow);
      return;
    }

    if (world.id === "cloud-ocean") {
      this.drawCloudOceanVista(width, height, accent, glow);
      return;
    }

    if (world.id === "scrap-ring") {
      this.drawScrapRingVista(width, height, accent, glow);
      return;
    }

    this.drawHeartVista(width, height, accent, glow);
  }

  private drawAtmosphere(
    world: AdventureWorld,
    width: number,
    height: number
  ): void {
    const haze = this.add.graphics().setDepth(0.5);

    for (let i = 0; i < 7; i += 1) {
      const alpha = 0.035 + i * 0.008;
      haze.fillStyle(i % 2 === 0 ? world.theme.glow : world.theme.accent, alpha);
      haze.fillEllipse(
        width * (0.08 + i * 0.145),
        height * (0.19 + (i % 3) * 0.055),
        width * (0.2 + (i % 2) * 0.04),
        height * 0.08
      );
    }

    const vignette = this.add.graphics().setDepth(1800);
    vignette.fillStyle(0x000000, 0.12);
    vignette.fillRect(0, 0, width, height * 0.06);
    vignette.fillRect(0, height * 0.92, width, height * 0.08);
  }

  private drawMossVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    for (let i = 0; i < 11; i += 1) {
      const x = width * (0.03 + i * 0.1);
      const stemH = height * (0.12 + (i % 4) * 0.035);
      const leafW = 70 + (i % 3) * 34;
      const y = height * (0.41 - (i % 3) * 0.012);

      this.add
        .rectangle(x, y - stemH / 2, 8 + (i % 2) * 3, stemH, 0x315b48, 0.78)
        .setAngle(i % 2 ? 6 : -5)
        .setDepth(2);

      this.add
        .ellipse(x - 8, y - stemH, leafW, 26 + (i % 2) * 10, accent, 0.46)
        .setAngle(i % 2 ? 17 : -19)
        .setStrokeStyle(2, glow, 0.24)
        .setDepth(3);

      this.add
        .circle(x + (i % 2 ? 15 : -15), y - stemH * 0.8, 4 + (i % 3), glow, 0.76)
        .setDepth(4);
    }

    const water = this.add.graphics().setDepth(2);
    water.fillStyle(0x173d3c, 0.82);
    water.fillEllipse(width * 0.52, height * 0.49, width * 0.78, height * 0.12);
    water.lineStyle(2, glow, 0.22);
    for (let i = 0; i < 5; i += 1) {
      water.strokeEllipse(
        width * (0.3 + i * 0.11),
        height * (0.49 + (i % 2) * 0.012),
        width * 0.14,
        height * 0.028
      );
    }

    this.add
      .rectangle(width * 0.77, height * 0.34, width * 0.13, height * 0.14, 0x384f48, 0.88)
      .setStrokeStyle(3, accent, 0.58)
      .setDepth(4);
    this.add
      .rectangle(width * 0.77, height * 0.265, 8, height * 0.07, 0x65736e)
      .setDepth(4);
    this.add
      .circle(width * 0.77, height * 0.23, 7, glow, 0.88)
      .setDepth(5);
  }

  private drawJunctionVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    const bridge = this.add.graphics().setDepth(3);
    bridge.fillStyle(0x25303d, 0.96);
    bridge.fillRect(0, height * 0.39, width, height * 0.055);
    bridge.lineStyle(3, glow, 0.3);
    bridge.lineBetween(0, height * 0.39, width, height * 0.39);

    for (let i = 0; i < 9; i += 1) {
      const x = width * (0.04 + i * 0.115);
      const h = height * (0.12 + (i % 4) * 0.045);
      const tower = this.add
        .rectangle(
          x,
          height * 0.38 - h / 2,
          44 + (i % 3) * 22,
          h,
          i % 2 ? 0x2d2942 : 0x213747,
          0.98
        )
        .setStrokeStyle(2, i % 2 ? accent : glow, 0.68)
        .setDepth(4);

      this.add
        .rectangle(x, tower.y + h * 0.1, tower.width * 0.64, 7, i % 2 ? accent : glow, 0.8)
        .setDepth(5);

      for (let j = 0; j < 3; j += 1) {
        this.add
          .circle(
            x - tower.width * 0.25 + j * tower.width * 0.25,
            tower.y - h * 0.15,
            3,
            j % 2 ? accent : glow,
            0.9
          )
          .setDepth(5);
      }

      this.add
        .line(x, tower.y - h / 2, 0, 0, 12, -34 - (i % 3) * 9, glow, 0.55)
        .setLineWidth(2)
        .setDepth(5);
    }

    for (let i = 0; i < 6; i += 1) {
      const y = height * (0.18 + i * 0.03);
      this.add
        .line(width * 0.18, y, 0, 0, width * 0.64, (i % 2 ? 9 : -9), accent, 0.13)
        .setLineWidth(1)
        .setDepth(2);
    }
  }

  private drawEmptyPathVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    for (let i = 0; i < 42; i += 1) {
      this.add
        .circle(
          width * (((i * 37) % 97) / 100),
          height * (0.08 + (((i * 19) % 46) / 100)),
          i % 7 === 0 ? 2.4 : 1.2,
          i % 4 === 0 ? accent : glow,
          0.58 + (i % 3) * 0.1
        )
        .setDepth(2);
    }

    const anchorX = width * 0.5;
    const anchorY = height * 0.34;
    for (let i = 0; i < 4; i += 1) {
      this.add
        .ellipse(anchorX, anchorY, width * (0.15 + i * 0.065), 18 + i * 8, accent, 0)
        .setStrokeStyle(2, i % 2 ? accent : glow, 0.2 + i * 0.08)
        .setDepth(3 + i);
    }

    this.add
      .star(anchorX, anchorY, 8, 12, 34, glow, 0.35)
      .setStrokeStyle(3, glow, 0.6)
      .setDepth(8);
  }

  private drawDistortionVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    this.add
      .ellipse(width * 0.2, height * 0.33, width * 0.26, height * 0.12, 0x4ba873, 0.28)
      .setStrokeStyle(2, 0x8ae6a9, 0.25)
      .setDepth(2);

    this.add
      .polygon(
        width * 0.5,
        height * 0.33,
        [0, 54, 70, 0, 150, 40, 128, 92, 42, 88],
        0xb85e43,
        0.38
      )
      .setStrokeStyle(2, 0xf0a06c, 0.24)
      .setDepth(3);

    this.add
      .rectangle(width * 0.79, height * 0.31, width * 0.18, height * 0.16, 0x3e3159, 0.34)
      .setStrokeStyle(3, 0xe073c5, 0.35)
      .setDepth(4);

    for (let i = 0; i < 8; i += 1) {
      const x1 = width * (0.12 + i * 0.1);
      const y1 = height * (0.18 + (i % 3) * 0.08);
      this.add
        .line(x1, y1, 0, 0, width * 0.28, height * (0.03 - (i % 2) * 0.06), i % 2 ? accent : glow, 0.25)
        .setLineWidth(2)
        .setDepth(6);
    }
  }

  private drawGlassCoastVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    const sea = this.add.graphics().setDepth(2);
    sea.fillStyle(0x1c5c6c, 0.48);
    sea.fillRect(0, height * 0.34, width, height * 0.18);

    for (let i = 0; i < 15; i += 1) {
      const x = width * (0.02 + i * 0.07);
      const h = 48 + (i % 5) * 20;
      this.add
        .polygon(
          x,
          height * 0.39 - h * 0.25,
          [0, h, 18, 0, 36, h, 26, h + 18, 8, h + 14],
          i % 2 ? accent : glow,
          0.28 + (i % 3) * 0.08
        )
        .setStrokeStyle(2, glow, 0.45)
        .setDepth(4);
    }

    this.add
      .ellipse(width * 0.7, height * 0.31, width * 0.16, height * 0.04, glow, 0.16)
      .setStrokeStyle(2, glow, 0.38)
      .setDepth(5);
  }

  private drawCloudOceanVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    for (let i = 0; i < 13; i += 1) {
      this.add
        .ellipse(
          width * (0.02 + i * 0.085),
          height * (0.26 + (i % 3) * 0.055),
          145 + (i % 2) * 60,
          40 + (i % 3) * 12,
          0xffffff,
          0.14 + (i % 4) * 0.025
        )
        .setDepth(1.5);
    }

    this.drawFloatingIsland(width * 0.27, height * 0.29, width * 0.19, height * 0.13, accent, glow, false);
    this.drawFloatingIsland(width * 0.56, height * 0.26, width * 0.14, height * 0.1, accent, glow, false);
    this.drawFloatingIsland(width * 0.76, height * 0.31, width * 0.27, height * 0.16, accent, glow, true);
    this.drawFloatingIsland(width * 0.9, height * 0.22, width * 0.11, height * 0.08, accent, glow, false);

    const harborX = width * 0.76;
    const harborY = height * 0.2;

    for (let i = 0; i < 5; i += 1) {
      const x = harborX + (i - 2) * 26;
      const h = 58 + (i % 3) * 28;
      this.add
        .rectangle(x, harborY - h / 2, 20 + (i % 2) * 10, h, 0x5f5d68, 0.96)
        .setStrokeStyle(2, 0xd9ad5c, 0.7)
        .setDepth(7);
      this.add
        .triangle(x, harborY - h - 15, 0, 20, 12, 0, 24, 20, 0xd9ad5c, 0.76)
        .setDepth(8);
    }

    this.add
      .text(harborX, height * 0.345, "WOLKENHAFEN", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "900",
        color: "#fff0c5",
        backgroundColor: "#16334bcc",
        padding: { x: 10, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(12);

    for (let i = 0; i < 5; i += 1) {
      const shipX = width * (0.42 + i * 0.11);
      const shipY = height * (0.13 + (i % 2) * 0.065);
      this.drawSkySailer(shipX, shipY, i % 2 ? 0.78 : 1);
    }
  }

  private drawFloatingIsland(
    x: number,
    y: number,
    w: number,
    h: number,
    accent: number,
    glow: number,
    withCity: boolean
  ): void {
    const top = this.add
      .ellipse(x, y, w, h * 0.42, 0x6f8e66, 0.92)
      .setStrokeStyle(2, glow, 0.26)
      .setDepth(4);

    this.add
      .polygon(
        x,
        y + h * 0.22,
        [
          -w * 0.44,
          0,
          w * 0.44,
          0,
          w * 0.24,
          h * 0.4,
          0,
          h * 0.75,
          -w * 0.22,
          h * 0.42
        ],
        0x657061,
        0.92
      )
      .setStrokeStyle(2, accent, 0.22)
      .setDepth(3);

    for (let i = 0; i < 3; i += 1) {
      this.add
        .rectangle(
          x - w * 0.22 + i * w * 0.21,
          y + h * 0.24,
          4 + i,
          h * (0.28 + i * 0.08),
          glow,
          0.35
        )
        .setDepth(3.5);
    }

    if (withCity) {
      top.setFillStyle(0x668364, 1);
      for (let i = 0; i < 4; i += 1) {
        this.add
          .rectangle(
            x - w * 0.18 + i * w * 0.12,
            y - h * (0.19 + (i % 2) * 0.05),
            14 + (i % 2) * 7,
            h * (0.24 + (i % 3) * 0.08),
            0x6d6a72,
            0.9
          )
          .setStrokeStyle(2, 0xd9ad5c, 0.48)
          .setDepth(6);
      }
    }
  }

  private drawSkySailer(x: number, y: number, scale: number): void {
    const hull = this.add
      .ellipse(0, 0, 58 * scale, 14 * scale, 0x5d5145, 0.92)
      .setStrokeStyle(2, 0xd29b58, 0.62);

    const sail = this.add
      .triangle(
        0,
        -18 * scale,
        0,
        32 * scale,
        18 * scale,
        0,
        34 * scale,
        32 * scale,
        0xefe0b7,
        0.86
      )
      .setStrokeStyle(1, 0xd29b58, 0.6);

    const mast = this.add
      .rectangle(4 * scale, -15 * scale, 2 * scale, 34 * scale, 0xc59a62, 0.86);

    const craft = this.add
      .container(x, y, [hull, mast, sail])
      .setDepth(9);

    this.tweens.add({
      targets: craft,
      x: x + 22 * scale,
      y: y - 5 * scale,
      angle: 1.2,
      duration: 3100 + Math.round(scale * 500),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: sail,
      scaleX: { from: 0.96, to: 1.04 },
      angle: { from: -1.4, to: 1.4 },
      duration: 1250,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private drawScrapRingVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    for (let i = 0; i < 20; i += 1) {
      const x = width * (((i * 17) % 91) / 100);
      const y = height * (0.14 + (((i * 11) % 24) / 100));
      this.add
        .rectangle(
          x,
          y,
          30 + (i % 4) * 17,
          9 + (i % 3) * 9,
          i % 2 ? accent : 0x6e665e,
          0.24 + (i % 3) * 0.08
        )
        .setAngle((i * 29) % 180)
        .setDepth(2 + (i % 3));
    }

    this.add
      .ellipse(width * 0.58, height * 0.3, width * 0.24, height * 0.08, 0x5e5a56, 0.9)
      .setStrokeStyle(3, accent, 0.48)
      .setAngle(-8)
      .setDepth(5);

    this.add
      .circle(width * 0.49, height * 0.29, 17, glow, 0.3)
      .setStrokeStyle(2, glow, 0.56)
      .setDepth(6);
  }

  private drawHeartVista(
    width: number,
    height: number,
    accent: number,
    glow: number
  ): void {
    const coreX = width * 0.52;
    const coreY = height * 0.28;

    this.add
      .circle(coreX, coreY, Math.min(115, width * 0.1), 0x102d36, 0.9)
      .setStrokeStyle(5, glow, 0.8)
      .setDepth(3);

    for (let i = 0; i < 7; i += 1) {
      this.add
        .ellipse(
          coreX,
          coreY,
          72 + i * 46,
          34 + i * 22,
          accent,
          0
        )
        .setStrokeStyle(2, i % 2 ? glow : accent, 0.22 + i * 0.025)
        .setAngle(i * 13)
        .setDepth(3 + i * 0.01);
    }

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const x = coreX + Math.cos(angle) * width * 0.22;
      const y = coreY + Math.sin(angle) * height * 0.14;
      this.add.circle(x, y, 6, i % 2 ? glow : accent, 0.8).setDepth(7);
      this.add
        .line(coreX, coreY, 0, 0, x - coreX, y - coreY, i % 2 ? glow : accent, 0.22)
        .setLineWidth(2)
        .setDepth(6);
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
      nearest.kind === "starpoint" ? 0x9ceaf0 : this.interactionColor;

    this.interactionFocus?.show(focusX, focusY, focusColor);
    this.hint.setText(`${label} · E / Aktion`).setVisible(true);
  }

  private openNearestInteraction(worldId: AdventureWorldId): void {
    const nearest = this.nearestInteraction();
    if (!nearest) return;

    this.interactionFocus?.confirm(
      nearest.kind === "starpoint" ? 0x9ceaf0 : this.interactionColor
    );

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
