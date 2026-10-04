import Phaser from "phaser";
import type { PlayerProfile } from "../../domain/profiles";
import { GeneratedCrewV67Avatar } from "./GeneratedCrewV67Avatar";
import { OlliV6Avatar } from "./OlliV6Avatar";

type CrewAvatar = GeneratedCrewV67Avatar | OlliV6Avatar;

export class IllustratedCrewMate {
  readonly avatar: CrewAvatar;

  constructor(
    scene: Phaser.Scene,
    profile: PlayerProfile,
    x: number,
    y: number,
    private readonly offsetX: number,
    private readonly offsetY: number,
    displayScale = 1
  ) {
    this.avatar =
      profile.id === "olli"
        ? new OlliV6Avatar(scene, profile, x, y, {
            displayScale,
            primary: false
          })
        : new GeneratedCrewV67Avatar(scene, profile, x, y, {
            displayScale,
            primary: false
          });
  }

  updateFollow(playerX: number, playerY: number, delta: number): void {
    const targetX = playerX + this.offsetX;
    const targetY = playerY + this.offsetY;
    const distance = Phaser.Math.Distance.Between(
      this.avatar.x,
      this.avatar.y,
      targetX,
      targetY
    );

    const factor = 1 - Math.pow(0.012, delta / 1000);
    const nextX = Phaser.Math.Linear(this.avatar.x, targetX, factor);
    const nextY = Phaser.Math.Linear(this.avatar.y, targetY, factor);

    this.avatar.setPosition(nextX, nextY);
    this.avatar.updateAnimation(delta, distance > 0.85);
  }
}
