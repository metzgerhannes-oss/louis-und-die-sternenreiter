import Phaser from "phaser";
import type { ProfileId } from "../../domain/profiles";

export type CrewTextureId = ProfileId | "louis";
export type CrewPart =
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

type Point = readonly [number, number];

const childMasks: Record<Exclude<CrewPart, "dogHead" | "dogBody" | "dogLeftLeg" | "dogRightLeg">, Point[]> = {
  torso: [
    [0.22, 0.2],
    [0.78, 0.2],
    [0.74, 0.62],
    [0.62, 0.68],
    [0.38, 0.68],
    [0.26, 0.62]
  ],
  leftArm: [
    [0.05, 0.27],
    [0.29, 0.23],
    [0.31, 0.41],
    [0.24, 0.63],
    [0.08, 0.67],
    [0.02, 0.52]
  ],
  rightArm: [
    [0.71, 0.23],
    [0.95, 0.27],
    [0.98, 0.52],
    [0.92, 0.67],
    [0.76, 0.63],
    [0.69, 0.41]
  ],
  leftLeg: [
    [0.19, 0.57],
    [0.51, 0.57],
    [0.49, 0.99],
    [0.12, 0.99],
    [0.13, 0.77]
  ],
  rightLeg: [
    [0.49, 0.57],
    [0.81, 0.57],
    [0.87, 0.99],
    [0.51, 0.99]
  ]
};

const dogMasks: Record<"dogHead" | "dogBody" | "dogLeftLeg" | "dogRightLeg", Point[]> = {
  dogHead: [
    [0.03, 0.02],
    [0.97, 0.02],
    [0.9, 0.49],
    [0.68, 0.53],
    [0.32, 0.53],
    [0.1, 0.49]
  ],
  dogBody: [
    [0.14, 0.34],
    [0.86, 0.34],
    [0.86, 0.78],
    [0.14, 0.78]
  ],
  dogLeftLeg: [
    [0.08, 0.58],
    [0.52, 0.58],
    [0.49, 0.99],
    [0.05, 0.99]
  ],
  dogRightLeg: [
    [0.48, 0.58],
    [0.92, 0.58],
    [0.95, 0.99],
    [0.51, 0.99]
  ]
};

function sharpenCanvas(context: CanvasRenderingContext2D, width: number, height: number): void {
  const image = context.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(image.data);
  const target = image.data;
  const centerWeight = 1.28;
  const neighborWeight = -0.07;

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

function drawMask(
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number
): void {
  context.beginPath();
  points.forEach(([x, y], index) => {
    const px = x * width;
    const py = y * height;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  });
  context.closePath();
  context.clip();
}

function createPartTexture(
  scene: Phaser.Scene,
  id: CrewTextureId,
  part: CrewPart,
  points: Point[]
): void {
  const source = crewSpriteSources[id];
  const partKey = `${source.key}-part-${part}`;
  if (scene.textures.exists(partKey) || !scene.textures.exists(source.key)) {
    return;
  }

  const image = scene.textures.get(source.key).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement;
  const width = image.width * HD_SCALE;
  const height = image.height * HD_SCALE;
  const canvasTexture = scene.textures.createCanvas(partKey, width, height);
  if (!canvasTexture) return;

  const context = canvasTexture.context;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.save();
  drawMask(context, points, width, height);
  context.drawImage(image, 0, 0, width, height);
  context.restore();

  sharpenCanvas(context, width, height);
  canvasTexture.refresh();
}

function createRigTextures(scene: Phaser.Scene, id: CrewTextureId): void {
  if (id === "louis") {
    (Object.entries(dogMasks) as Array<[keyof typeof dogMasks, Point[]]>).forEach(
      ([part, points]) => createPartTexture(scene, id, part, points)
    );
    return;
  }

  (Object.entries(childMasks) as Array<[keyof typeof childMasks, Point[]]>).forEach(
    ([part, points]) => createPartTexture(scene, id, part, points)
  );
}

function createHeadTexture(scene: Phaser.Scene, id: ProfileId): void {
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
  context.drawImage(image, -18, -18, 180, 180);

  // Feather the portrait crop so there is no visible circular portrait badge in-world.
  context.globalCompositeOperation = "destination-in";
  const gradient = context.createRadialGradient(72, 67, 38, 72, 67, 69);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.98)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = "source-over";

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
    if (scene.textures.exists(circleKey) || !scene.textures.exists(source.key)) {
      continue;
    }

    const canvasTexture = scene.textures.createCanvas(circleKey, 96, 96);
    if (!canvasTexture) continue;

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

  createRigTextures(scene, "charly");
  createRigTextures(scene, "philipp");
  createRigTextures(scene, "olli");
  createRigTextures(scene, "louis");
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

export function getCrewPartTexture(id: CrewTextureId, part: CrewPart): string {
  return `${crewSpriteSources[id].key}-part-${part}`;
}
