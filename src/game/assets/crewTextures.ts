import Phaser from "phaser";
import type { ProfileId } from "../../domain/profiles";
export type CrewTextureId = ProfileId | "louis";
export type ConceptCrewPart =
  | "torso"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "body"
  | "head";

const base = import.meta.env.BASE_URL;

export const OLLI_V6_TEXTURE = "crew-olli-v6";
export const OLLI_V6_IDLE_ANIM = "crew-olli-v6-idle";
export const OLLI_V6_WALK_ANIM = "crew-olli-v6-walk";

export type GeneratedCrewId = "charly" | "philipp" | "louis";

const OLLI_V6_FRAME_WIDTH = 150;
const OLLI_V6_FRAME_HEIGHT = 216;
const GENERATED_V67_FRAME_WIDTH = 150;
const GENERATED_V67_FRAME_HEIGHT = 216;
const GENERATED_V67_COLUMNS = 3;
const GENERATED_V67_ROWS = 2;
const OLLI_V6_SPRITESHEET_URL = `${base}assets/sprites/olli-v6-pilot-v66.webp`;

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

const conceptPartSources: Record<string, { key: string; url: string }> = {};

for (const id of ["charly", "philipp", "olli"] as const) {
  conceptPartSources[`${id}:torso`] = {
    key: `crew-v5-${id}-torso`,
    url: `${base}assets/crew-v5/${id}-torso.svg`
  };
  conceptPartSources[`${id}:leftArm`] = {
    key: `crew-v5-${id}-left-arm`,
    url: `${base}assets/crew-v5/${id}-left-arm.svg`
  };
  conceptPartSources[`${id}:rightArm`] = {
    key: `crew-v5-${id}-right-arm`,
    url: `${base}assets/crew-v5/${id}-right-arm.svg`
  };
  conceptPartSources[`${id}:leftLeg`] = {
    key: `crew-v5-${id}-left-leg`,
    url: `${base}assets/crew-v5/${id}-left-leg.svg`
  };
  conceptPartSources[`${id}:rightLeg`] = {
    key: `crew-v5-${id}-right-leg`,
    url: `${base}assets/crew-v5/${id}-right-leg.svg`
  };
}

conceptPartSources["louis:body"] = {
  key: "crew-v5-louis-body",
  url: `${base}assets/crew-v5/louis-body.svg`
};
conceptPartSources["louis:head"] = {
  key: "crew-v5-louis-head",
  url: `${base}assets/crew-v5/louis-head.svg`
};
conceptPartSources["louis:leftLeg"] = {
  key: "crew-v5-louis-left-leg",
  url: `${base}assets/crew-v5/louis-left-leg.svg`
};
conceptPartSources["louis:rightLeg"] = {
  key: "crew-v5-louis-right-leg",
  url: `${base}assets/crew-v5/louis-right-leg.svg`
};

export function preloadCrewTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(OLLI_V6_TEXTURE)) {
    // Load the V6 sheet as a plain image. Phaser's spritesheet loader has proven
    // unreliable on the iOS/PWA path; frames are sliced manually after preload.
    scene.load.image(OLLI_V6_TEXTURE, OLLI_V6_SPRITESHEET_URL);
  }

  for (const source of Object.values(crewPortraitSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.image(source.key, source.url);
    }
  }

  // Legacy sprites remain loaded for the other scenes until V5 is rolled out there.
  for (const source of Object.values(crewSpriteSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.image(source.key, source.url);
    }
  }

  for (const source of Object.values(conceptPartSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.svg(source.key, source.url, { width: 360, height: 660 });
    }
  }
}

function createHeadTexture(scene: Phaser.Scene, id: ProfileId): void {
  const source = crewPortraitSources[id];
  const headKey = `${source.key}-head-v5`;

  if (scene.textures.exists(headKey) || !scene.textures.exists(source.key)) {
    return;
  }

  const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;
  const size = 192;
  const canvasTexture = scene.textures.createCanvas(headKey, size, size);
  if (!canvasTexture) return;

  const context = canvasTexture.context;
  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // Larger crop than the old gameplay head: face + hairstyle remain recognizable.
  context.drawImage(image, -20, -22, 232, 232);

  context.globalCompositeOperation = "destination-in";
  const gradient = context.createRadialGradient(96, 86, 56, 96, 88, 95);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.73, "rgba(255,255,255,1)");
  gradient.addColorStop(0.91, "rgba(255,255,255,0.78)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = "source-over";

  canvasTexture.refresh();
}

export function ensureOlliV6Frames(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(OLLI_V6_TEXTURE)) {
    return false;
  }

  const texture = scene.textures.get(OLLI_V6_TEXTURE);

  for (let index = 0; index < 6; index += 1) {
    const frameName = `v6-${index}`;
    if (!texture.has(frameName)) {
      const column = index % 3;
      const row = Math.floor(index / 3);
      texture.add(
        frameName,
        0,
        column * OLLI_V6_FRAME_WIDTH,
        row * OLLI_V6_FRAME_HEIGHT,
        OLLI_V6_FRAME_WIDTH,
        OLLI_V6_FRAME_HEIGHT
      );
    }
  }

  return texture.has("v6-0");
}

export function createCircularCrewTextures(scene: Phaser.Scene): void {
  if (ensureOlliV6Frames(scene)) {
    if (!scene.anims.exists(OLLI_V6_IDLE_ANIM)) {
      scene.anims.create({
        key: OLLI_V6_IDLE_ANIM,
        frames: [
          { key: OLLI_V6_TEXTURE, frame: "v6-0" },
          { key: OLLI_V6_TEXTURE, frame: "v6-5" }
        ],
        frameRate: 1.6,
        repeat: -1,
        yoyo: true
      });
    }

    if (!scene.anims.exists(OLLI_V6_WALK_ANIM)) {
      scene.anims.create({
        key: OLLI_V6_WALK_ANIM,
        frames: [1, 2, 3, 4].map((index) => ({
          key: OLLI_V6_TEXTURE,
          frame: `v6-${index}`
        })),
        frameRate: 7,
        repeat: -1
      });
    }
  }

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

  createHeadTexture(scene, "charly");
  createHeadTexture(scene, "philipp");
  createHeadTexture(scene, "olli");

  ensureGeneratedV67Animations(scene, "charly");
  ensureGeneratedV67Animations(scene, "philipp");
  ensureGeneratedV67Animations(scene, "louis");
}

export function getCrewPortraitTexture(id: CrewTextureId): string {
  return `${crewPortraitSources[id].key}-circle`;
}

export function getCrewHeadTexture(id: ProfileId): string {
  return `${crewPortraitSources[id].key}-head-v5`;
}

export function getCrewSpriteTexture(id: CrewTextureId): string {
  return crewSpriteSources[id].key;
}

export function getConceptCrewPartTexture(
  id: CrewTextureId,
  part: ConceptCrewPart
): string {
  const source = conceptPartSources[`${id}:${part}`];
  if (!source) {
    throw new Error(`Missing concept crew part: ${id}:${part}`);
  }
  return source.key;
}


export function isOlliV6Ready(scene: Phaser.Scene): boolean {
  return ensureOlliV6Frames(scene);
}


function generatedV67TextureKey(id: GeneratedCrewId): string {
  return `crew-v67-${id}`;
}

export function generatedV67IdleAnim(id: GeneratedCrewId): string {
  return `crew-v67-${id}-idle`;
}

export function generatedV67WalkAnim(id: GeneratedCrewId): string {
  return `crew-v67-${id}-walk`;
}

function drawGeneratedV67Frame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  id: GeneratedCrewId,
  frameIndex: number
): void {
  const column = frameIndex % GENERATED_V67_COLUMNS;
  const row = Math.floor(frameIndex / GENERATED_V67_COLUMNS);
  const originX = column * GENERATED_V67_FRAME_WIDTH;
  const originY = row * GENERATED_V67_FRAME_HEIGHT;

  const poses = [
    { dx: 0, dy: 0, angle: 0, sx: 1, sy: 1 },
    { dx: -2, dy: -4, angle: -2.4, sx: 0.99, sy: 1.015 },
    { dx: 2, dy: -7, angle: 2.5, sx: 1.01, sy: 0.99 },
    { dx: -1, dy: -4, angle: -1.7, sx: 1.005, sy: 1.005 },
    { dx: 2, dy: -6, angle: 2.0, sx: 0.995, sy: 1.01 },
    { dx: 0, dy: -1, angle: 0.6, sx: 1, sy: 1.005 }
  ] as const;

  const pose = poses[frameIndex] ?? poses[0];

  context.save();
  context.beginPath();
  context.rect(
    originX,
    originY,
    GENERATED_V67_FRAME_WIDTH,
    GENERATED_V67_FRAME_HEIGHT
  );
  context.clip();

  const targetHeight = id === "louis" ? 190 : 196;
  const aspect = image.width / image.height;
  const targetWidth = Math.max(54, targetHeight * aspect);

  context.translate(
    originX + GENERATED_V67_FRAME_WIDTH / 2 + pose.dx,
    originY + GENERATED_V67_FRAME_HEIGHT - 8 + pose.dy
  );
  context.rotate(Phaser.Math.DegToRad(pose.angle));
  context.scale(pose.sx, pose.sy);
  context.drawImage(
    image,
    -targetWidth / 2,
    -targetHeight,
    targetWidth,
    targetHeight
  );
  context.restore();
}

export function ensureGeneratedV67Frames(
  scene: Phaser.Scene,
  id: GeneratedCrewId
): boolean {
  const textureKey = generatedV67TextureKey(id);

  if (!scene.textures.exists(textureKey)) {
    const source = crewSpriteSources[id];
    if (!source || !scene.textures.exists(source.key)) {
      return false;
    }

    const sourceImage = scene.textures.get(source.key).getSourceImage() as
      | HTMLImageElement
      | HTMLCanvasElement;

    const canvasTexture = scene.textures.createCanvas(
      textureKey,
      GENERATED_V67_FRAME_WIDTH * GENERATED_V67_COLUMNS,
      GENERATED_V67_FRAME_HEIGHT * GENERATED_V67_ROWS
    );

    if (!canvasTexture) {
      return false;
    }

    const context = canvasTexture.context;
    context.clearRect(0, 0, canvasTexture.width, canvasTexture.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    for (let frameIndex = 0; frameIndex < 6; frameIndex += 1) {
      drawGeneratedV67Frame(context, sourceImage, id, frameIndex);
    }

    canvasTexture.refresh();
  }

  const texture = scene.textures.get(textureKey);

  for (let index = 0; index < 6; index += 1) {
    const frameName = `v67-${index}`;
    if (!texture.has(frameName)) {
      const column = index % GENERATED_V67_COLUMNS;
      const row = Math.floor(index / GENERATED_V67_COLUMNS);
      texture.add(
        frameName,
        0,
        column * GENERATED_V67_FRAME_WIDTH,
        row * GENERATED_V67_FRAME_HEIGHT,
        GENERATED_V67_FRAME_WIDTH,
        GENERATED_V67_FRAME_HEIGHT
      );
    }
  }

  return texture.has("v67-0");
}

export function ensureGeneratedV67Animations(
  scene: Phaser.Scene,
  id: GeneratedCrewId
): boolean {
  if (!ensureGeneratedV67Frames(scene, id)) {
    return false;
  }

  const textureKey = generatedV67TextureKey(id);
  const idleKey = generatedV67IdleAnim(id);
  const walkKey = generatedV67WalkAnim(id);

  if (!scene.anims.exists(idleKey)) {
    scene.anims.create({
      key: idleKey,
      frames: [
        { key: textureKey, frame: "v67-0" },
        { key: textureKey, frame: "v67-5" }
      ],
      frameRate: 1.8,
      repeat: -1,
      yoyo: true
    });
  }

  if (!scene.anims.exists(walkKey)) {
    scene.anims.create({
      key: walkKey,
      frames: [1, 2, 3, 4].map((index) => ({
        key: textureKey,
        frame: `v67-${index}`
      })),
      frameRate: id === "louis" ? 8 : 7,
      repeat: -1
    });
  }

  return true;
}

export function getGeneratedV67Texture(id: GeneratedCrewId): string {
  return generatedV67TextureKey(id);
}
