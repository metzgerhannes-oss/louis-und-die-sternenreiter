import Phaser from "phaser";
import { gameEventBus } from "../EventBus";

type ZoomDirection = "in" | "out";

type WorldCameraOptions = {
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  worldWidth?: number;
  worldHeight?: number;
};

function defaultZoomForViewport(width: number, height: number): number {
  if (width <= 860 && height > width) {
    return 1.28;
  }

  if (width <= 1100) {
    return 1.16;
  }

  return 1.08;
}

export class WorldCameraController {
  private readonly scene: Phaser.Scene;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly defaultZoom: number;
  private readonly minZoom: number;
  private readonly maxZoom: number;
  private readonly zoomStep: number;
  private readonly offZoom: () => void;
  private readonly offReset: () => void;

  private targetZoom: number;
  private pinchDistance: number | null = null;

  constructor(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container,
    options: WorldCameraOptions = {}
  ) {
    this.scene = scene;
    this.camera = scene.cameras.main;

    const { width, height } = scene.scale;
    this.defaultZoom =
      options.defaultZoom ?? defaultZoomForViewport(width, height);
    this.minZoom = options.minZoom ?? 1;
    this.maxZoom = options.maxZoom ?? 1.65;
    this.zoomStep = options.zoomStep ?? 0.12;

    const rememberedZoom = scene.game.registry.get("worldCameraZoom");
    this.targetZoom = Phaser.Math.Clamp(
      typeof rememberedZoom === "number" ? rememberedZoom : this.defaultZoom,
      this.minZoom,
      this.maxZoom
    );

    const worldWidth = Math.max(options.worldWidth ?? width, width);
    const worldHeight = Math.max(options.worldHeight ?? height, height);

    this.camera.setBounds(0, 0, worldWidth, worldHeight, true);
    this.camera.roundPixels = true;
    this.camera.setZoom(this.targetZoom);
    this.camera.startFollow(target, true, 0.09, 0.09);

    // Phaser normally has one active pointer. Two additional pointers make
    // two-finger pinch reliable on iPhone/iPad without affecting mouse input.
    const pointerCount = scene.input.manager.pointers.length;
    if (pointerCount < 3) {
      scene.input.addPointer(3 - pointerCount);
    }

    this.offZoom = gameEventBus.on("camera:zoom", ({ direction }) => {
      this.nudge(direction);
    });
    this.offReset = gameEventBus.on("camera:reset", () => {
      this.setTargetZoom(this.defaultZoom);
    });

    scene.input.on("wheel", this.handleWheel);
  }

  update(delta: number): void {
    this.updatePinch();

    const easing = 1 - Math.pow(0.002, delta / 1000);
    const nextZoom = Phaser.Math.Linear(
      this.camera.zoom,
      this.targetZoom,
      easing
    );

    if (Math.abs(nextZoom - this.camera.zoom) > 0.0005) {
      this.camera.setZoom(nextZoom);
    } else if (this.camera.zoom !== this.targetZoom) {
      this.camera.setZoom(this.targetZoom);
    }
  }

  destroy(): void {
    this.offZoom();
    this.offReset();
    this.scene.input.off("wheel", this.handleWheel);
    this.camera.stopFollow();
    this.pinchDistance = null;
  }

  private readonly handleWheel = (
    _pointer: Phaser.Input.Pointer,
    _currentlyOver: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void => {
    if (Math.abs(deltaY) < 1) return;
    this.nudge(deltaY < 0 ? "in" : "out");
  };

  private updatePinch(): void {
    const activePointers = this.scene.input.manager.pointers.filter(
      (pointer) => pointer.isDown
    );

    if (activePointers.length < 2) {
      this.pinchDistance = null;
      return;
    }

    const first = activePointers[0];
    const second = activePointers[1];
    const distance = Phaser.Math.Distance.Between(
      first.x,
      first.y,
      second.x,
      second.y
    );

    if (this.pinchDistance && this.pinchDistance > 12) {
      const ratio = distance / this.pinchDistance;
      if (Number.isFinite(ratio) && Math.abs(ratio - 1) > 0.003) {
        this.setTargetZoom(this.targetZoom * ratio);
      }
    }

    this.pinchDistance = distance;
  }

  private nudge(direction: ZoomDirection): void {
    this.setTargetZoom(
      this.targetZoom + (direction === "in" ? this.zoomStep : -this.zoomStep)
    );
  }

  private setTargetZoom(value: number): void {
    this.targetZoom = Phaser.Math.Clamp(value, this.minZoom, this.maxZoom);
    this.scene.game.registry.set("worldCameraZoom", this.targetZoom);
  }
}
