import Phaser from "phaser";
import type { ProfileId } from "../../domain/profiles";

export type CrewTextureId = ProfileId | "louis";

const base = import.meta.env.BASE_URL;

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
    if (!scene.textures.exists(source.key)) {
      continue;
    }

    const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;

    const circleKey = `${source.key}-circle`;
    if (!scene.textures.exists(circleKey)) {
      const canvasTexture = scene.textures.createCanvas(circleKey, 96, 96);
      if (canvasTexture) {
        const context = canvasTexture.context;

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
  }
}

export function getCrewPortraitTexture(id: CrewTextureId): string {
  return `${crewPortraitSources[id].key}-circle`;
}


export function getCrewSpriteTexture(id: CrewTextureId): string {
  return crewSpriteSources[id].key;
}
