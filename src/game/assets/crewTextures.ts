import Phaser from "phaser";
import type { ProfileId } from "../../domain/profiles";

export type CrewTextureId = ProfileId | "louis";

export type CrewRigFrame =
  | "torso"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "dogHead"
  | "dogBody"
  | "dogLeftLeg"
  | "dogRightLeg";

const base = import.meta.env.BASE_URL;
const HD_SCALE = 3;

const crewPortraitSources: Record<CrewTextureId, { key: string; url: string }> = {
  philipp: {
    key: "crew-portrait-philipp",
    url: `${base}assets/crew/philipp-portrait-v4.webp`
  },
  charly: {
    key: "crew-portrait-charly",
    url: `${base}assets/crew/charly-portrait-v4.webp`
  },
  olli: {
    key: "crew-portrait-olli",
    url: `${base}assets/crew/olli-portrait-v4.webp`
  },
  louis: {
    key: "crew-portrait-louis",
    url: `${base}assets/crew/louis.webp`
  }
};

const crewSpriteSources: Record<CrewTextureId, { key: string; url: string }> = {
  philipp: {
    key: "crew-sprite-philipp-front-v1",
    url: `${base}assets/sprites/philipp-front-v1.webp`
  },
  charly: {
    key: "crew-sprite-charly-front-v1",
    url: `${base}assets/sprites/charly-front-v1.webp`
  },
  olli: {
    key: "crew-sprite-olli-front-v1",
    url: `${base}assets/sprites/olli-front-v1.webp`
  },
  louis: {
    key: "crew-sprite-louis-front-v1",
    url: `${base}assets/sprites/louis-front-v1.webp`
  }
};

type CropSpec = {
  frame: CrewRigFrame;
  x: number;
  y: number;
  width: number;
  height: number;
};

const childRigSpecs: CropSpec[] = [
  { frame: "torso", x: 0.2, y: 0.25, width: 0.6, height: 0.48 },
  { frame: "leftArm", x: 0, y: 0.27, width: 0.44, height: 0.49 },
  { frame: "rightArm", x: 0.56, y: 0.27, width: 0.44, height: 0.49 },
  { frame: "leftLeg", x: 0.12, y: 0.6, width: 0.5, height: 0.4 },
  { frame: "rightLeg", x: 0.38, y: 0.6, width: 0.5, height: 0.4 }
];

const louisRigSpecs: CropSpec[] = [
  { frame: "dogHead", x: 0.06, y: 0.02, width: 0.88, height: 0.52 },
  { frame: "dogBody", x: 0.08, y: 0.32, width: 0.84, height: 0.45 },
  { frame: "dogLeftLeg", x: 0.08, y: 0.58, width: 0.48, height: 0.42 },
  { frame: "dogRightLeg", x: 0.44, y: 0.58, width: 0.48, height: 0.42 }
];

function sharpenCanvas(context: CanvasRenderingContext2D, width: number, height: number): void {
  const image = context.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(image.data);
  const target = image.data;

  const centerWeight = 1.48;
  const neighborWeight = -0.12;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const left = index - 4;
      const right = index + 4;
      const up = index - width * 4;
      const down = index + width * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const value =
          source[index + channel] * centerWeight +
          (source[left + channel] +
            source[right + channel] +
            source[up + channel] +
            source[down + channel]) *
            neighborWeight;

        target[index + channel] = Phaser.Math.Clamp(Math.round(value), 0, 255);
      }

      target[index + 3] = source[index + 3];
    }
  }

  context.putImageData(image, 0, 0);
}

function createHdSpriteTexture(scene: Phaser.Scene, id: CrewTextureId): void {
  const source = crewSpriteSources[id];
  const hdKey = `${source.key}-hd`;

  if (scene.textures.exists(hdKey) || !scene.textures.exists(source.key)) {
    return;
  }

  const image = scene.textures.get(source.key).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement;
  const width = image.width;
  const height = image.height;
  const canvasTexture = scene.textures.createCanvas(
    hdKey,
    width * HD_SCALE,
    height * HD_SCALE
  );

  if (!canvasTexture) return;

  const context = canvasTexture.context;
  context.clearRect(0, 0, canvasTexture.width, canvasTexture.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    0,
    0,
    width * HD_SCALE,
    height * HD_SCALE
  );

  sharpenCanvas(context, width * HD_SCALE, height * HD_SCALE);
  canvasTexture.refresh();

  const texture = scene.textures.get(hdKey);
  const specs = id === "louis" ? louisRigSpecs : childRigSpecs;

  for (const spec of specs) {
    const frameName = `rig-${spec.frame}`;
    if (texture.has(frameName)) continue;

    texture.add(
      frameName,
      0,
      Math.round(width * HD_SCALE * spec.x),
      Math.round(height * HD_SCALE * spec.y),
      Math.max(1, Math.round(width * HD_SCALE * spec.width)),
      Math.max(1, Math.round(height * HD_SCALE * spec.height))
    );
  }
}

function createHeadTexture(scene: Phaser.Scene, id: Exclude<CrewTextureId, "louis">): void {
  const source = crewPortraitSources[id];
  const headKey = `${source.key}-head-hd`;

  if (scene.textures.exists(headKey) || !scene.textures.exists(source.key)) {
    return;
  }

  const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;
  const size = 144;
  const canvasTexture = scene.textures.createCanvas(headKey, size, size);
  if (!canvasTexture) return;

  const context = canvasTexture.context;
  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.save();
  context.beginPath();
  context.ellipse(72, 71, 57, 64, 0, 0, Math.PI * 2);
  context.clip();

  // Zoom the existing 256px portrait so face + hair stay readable in gameplay.
  context.drawImage(image, -18, -20, 180, 180);
  context.restore();

  canvasTexture.refresh();
}

export function preloadCrewTextures(scene: Phaser.Scene): void {
  for (const source of Object.values(crewPortraitSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.image(source.key, source.url);
    }
  }

  for (const source of Object.values(crewSpriteSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.image(source.key, source.url);
    }
  }
}

export function createCircularCrewTextures(scene: Phaser.Scene): void {
  for (const source of Object.values(crewPortraitSources)) {
    const circleKey = `${source.key}-circle`;
    if (!scene.textures.exists(circleKey) && scene.textures.exists(source.key)) {
      const canvasTexture = scene.textures.createCanvas(circleKey, 96, 96);
      if (canvasTexture) {
        const context = canvasTexture.context;
        const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;

        context.clearRect(0, 0, 96, 96);
        context.save();
        context.beginPath();
        context.arc(48, 48, 46, 0, Math.PI * 2);
        context.clip();
        context.drawImage(image, 0, 0, 96, 96);
        context.restore();

        context.beginPath();
        context.arc(48, 48, 45, 0, Math.PI * 2);
        context.lineWidth = 4;
        context.strokeStyle = "rgba(255,255,255,0.55)";
        context.stroke();

        canvasTexture.refresh();
      }
    }
  }

  createHdSpriteTexture(scene, "charly");
  createHdSpriteTexture(scene, "philipp");
  createHdSpriteTexture(scene, "olli");
  createHdSpriteTexture(scene, "louis");

  createHeadTexture(scene, "charly");
  createHeadTexture(scene, "philipp");
  createHeadTexture(scene, "olli");
}

export function getCrewPortraitTexture(id: CrewTextureId): string {
  return `${crewPortraitSources[id].key}-circle`;
}

export function getCrewHeadTexture(id: ProfileId): string {
  return `${crewPortraitSources[id].key}-head-hd`;
}

export function getCrewSpriteTexture(id: CrewTextureId): string {
  return `${crewSpriteSources[id].key}-hd`;
}

export function getCrewRigFrame(part: CrewRigFrame): string {
  return `rig-${part}`;
}

export function getCrewHdScale(): number {
  return HD_SCALE;
}
