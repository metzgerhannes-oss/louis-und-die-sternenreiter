import Phaser from "phaser";
import { playerProfiles, type PlayerProfile } from "../../domain/profiles";
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

export class HangarScene extends Phaser.Scene {
  private player?: PlayerAvatar;
  private louis?: LouisCompanion;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey?: Phaser.Input.Keyboard.Key;
  private hint?: Phaser.GameObjects.Text;
  private hotspots: RuntimeHotspot[] = [];
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

    const onResize = () => this.scene.restart();
    this.scale.on("resize", onResize);

    this.events.once("shutdown", () => {
      offMove();
      offInteract();
      offPing();
      this.scale.off("resize", onResize);
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

    let dx = Number(keyboardRight || this.moveState.right) - Number(keyboardLeft || this.moveState.left);
    let dy = Number(keyboardDown || this.moveState.down) - Number(keyboardUp || this.moveState.up);

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

    this.add.rectangle(width / 2, height / 2, width, height, 0x10151d);

    const backWall = this.add
      .rectangle(width * 0.5, height * 0.27, width * 0.94, height * 0.42, 0x222933)
      .setStrokeStyle(3, 0x394550);
    backWall.setDepth(0);

    const floor = this.add.graphics();
    floor.fillStyle(0x343238, 1);
    floor.fillTriangle(width * 0.04, height * 0.43, width * 0.96, height * 0.43, width, height);
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
      .text(width * 0.055, height * 0.145, `${profile.displayName} · Sternenreiter Level 1`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: profile.accentCss
      })
      .setDepth(2);

    const doorX = width * 0.52;
    const doorY = height * 0.29;
    const door = this.add
      .rectangle(doorX, doorY, width * 0.32, height * 0.30, 0x171c24)
      .setStrokeStyle(5, 0x59646a)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);
    this.add
      .rectangle(doorX, doorY, width * 0.008, height * 0.29, 0x63747a)
      .setDepth(2);
    this.add
      .text(doorX, height * 0.12, "AUSGANG ZUM STERNENFELD", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#82979a"
      })
      .setOrigin(0.5)
      .setDepth(2);
    door.on("pointerdown", () => this.openHotspot("hangar-door"));

    const shipX = width * 0.72;
    const shipY = height * 0.58;
    const ship = this.add
      .ellipse(shipX, shipY, Math.min(390, width * 0.34), Math.min(150, height * 0.2), 0x765b48)
      .setStrokeStyle(4, 0xb98761)
      .setInteractive({ useHandCursor: true })
      .setDepth(shipY - 20);
    this.add
      .triangle(shipX + width * 0.12, shipY, 0, -35, 74, 0, 0, 35, 0x584c46)
      .setDepth(shipY - 19);
    this.add
      .circle(shipX - 25, shipY - 14, 22, 0x274f59)
      .setStrokeStyle(3, 0x73afb6)
      .setDepth(shipY - 18);
    this.add
      .text(shipX, shipY + 52, "altes Sternenschiff", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#d2b99c"
      })
      .setOrigin(0.5)
      .setDepth(shipY + 53);
    ship.on("pointerdown", () => this.openHotspot("ship"));

    const benchX = width * 0.18;
    const benchY = height * 0.56;
    const bench = this.add
      .rectangle(benchX, benchY, Math.min(190, width * 0.21), 56, 0x5d4938)
      .setStrokeStyle(3, 0x9a7656)
      .setInteractive({ useHandCursor: true })
      .setDepth(benchY);
    this.add.rectangle(benchX - 60, benchY + 43, 18, 72, 0x44372e).setDepth(benchY - 1);
    this.add.rectangle(benchX + 60, benchY + 43, 18, 72, 0x44372e).setDepth(benchY - 1);
    this.add
      .text(benchX, benchY - 44, "WERKBANK", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "700",
        color: "#e5c590"
      })
      .setOrigin(0.5)
      .setDepth(benchY + 1);
    bench.on("pointerdown", () => this.openHotspot("workbench"));

    this.hotspots = [
      { data: hangarHotspots["hangar-door"], x: doorX, y: height * 0.47 },
      { data: hangarHotspots.ship, x: shipX, y: shipY + 50 },
      { data: hangarHotspots.workbench, x: benchX, y: benchY + 55 }
    ];

    const startX = width * 0.48;
    const startY = height * 0.76;
    this.player = new PlayerAvatar(this, profile, startX, startY);
    this.player.setPosition(startX, startY);

    this.louis = new LouisCompanion(this, startX - 68, startY + 20, () => {
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

  private nearestInteraction():
    | { kind: "louis"; distance: number }
    | { kind: "hotspot"; hotspot: RuntimeHotspot; distance: number }
    | null {
    if (!this.player || !this.louis) {
      return null;
    }

    const louisDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.louis.x,
      this.louis.y
    );

    let nearest:
      | { kind: "louis"; distance: number }
      | { kind: "hotspot"; hotspot: RuntimeHotspot; distance: number } = {
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

    const label = nearest.kind === "louis" ? "Mit Louis sprechen" : nearest.hotspot.data.title;
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

    gameEventBus.emit("interaction:hotspot", nearest.hotspot.data);
  }

  private openHotspot(id: HangarHotspotId): void {
    gameEventBus.emit("interaction:hotspot", hangarHotspots[id]);
  }
}
