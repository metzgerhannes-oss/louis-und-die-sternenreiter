import Phaser from "phaser";
import type { ProfileId } from "../../domain/profiles";

export type CrewTextureId = ProfileId | "louis";

const base = import.meta.env.BASE_URL;

const crewTextureSources: Record<CrewTextureId, { key: string; url: string }> = {
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

export function preloadCrewTextures(scene: Phaser.Scene): void {
  for (const source of Object.values(crewTextureSources)) {
    if (!scene.textures.exists(source.key)) {
      scene.load.image(source.key, source.url);
    }
  }
}

export function createCircularCrewTextures(scene: Phaser.Scene): void {
  for (const source of Object.values(crewTextureSources)) {
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
}

export function getCrewPortraitTexture(id: CrewTextureId): string {
  return `${crewTextureSources[id].key}-circle`;
}
