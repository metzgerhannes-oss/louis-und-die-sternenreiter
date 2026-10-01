import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { PlayerAvatar } from "./PlayerAvatar";

export class CrewMate {
  readonly avatar: PlayerAvatar;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    private readonly offsetX: number,
    private readonly offsetY: number
  ) {
    this.avatar = new PlayerAvatar(scene, profile, x, y);
    this.avatar.container.setAlpha(0.98);
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX + this.offsetX;
    const targetY = playerY + this.offsetY;
    const factor = 1 - Math.pow(0.012, delta / 1000);

    const nextX = Phaser.Math.Linear(this.avatar.x, targetX, factor);
    const nextY = Phaser.Math.Linear(this.avatar.y, targetY, factor);

    this.avatar.setPosition(nextX, nextY);
  }
}
