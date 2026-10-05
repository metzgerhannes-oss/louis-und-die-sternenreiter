import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(
  new URL("./scene-source/world-art-approved-v023.webp", import.meta.url)
);
const outputDir = new URL("../public/assets/scenes/worlds/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const TARGET_W = 1600;
const TARGET_H = 900;

const panels = [
  { id: "hangar3", row: 0, col: 0 },
  { id: "cinder", row: 0, col: 1 },
  { id: "moss", row: 0, col: 2 },
  { id: "junction12", row: 0, col: 3 },
  { id: "empty-path", row: 0, col: 4 },
  { id: "distortion", row: 1, col: 0 },
  { id: "glass-coast", row: 1, col: 1 },
  { id: "cloud-ocean", row: 1, col: 2 },
  { id: "scrap-ring", row: 1, col: 3 },
  { id: "heart-of-ways", row: 1, col: 4 }
];

const meta = await sharp(source).metadata();
if (!meta.width || !meta.height) {
  throw new Error("Approved world-art source has no readable dimensions.");
}

const topCrop = { top: 70, bottom: 320 };
const bottomCrop = { top: 454, bottom: 704 };

for (const panel of panels) {
  const left = Math.round((panel.col * meta.width) / 5);
  const right = Math.round(((panel.col + 1) * meta.width) / 5);
  const y = panel.row === 0 ? topCrop : bottomCrop;
  const width = right - left;
  const height = y.bottom - y.top;

  const crop = await sharp(source)
    .extract({ left, top: y.top, width, height })
    .webp({ quality: 96 })
    .toBuffer();

  const background = await sharp(crop)
    .resize(TARGET_W, TARGET_H, { fit: "cover", position: "centre" })
    .blur(24)
    .modulate({ brightness: 0.72, saturation: 0.92 })
    .webp({ quality: 88 })
    .toBuffer();

  const foreground = await sharp(crop)
    .resize(1480, TARGET_H, {
      fit: "inside",
      withoutEnlargement: false
    })
    .sharpen({ sigma: 0.55 })
    .webp({ quality: 94 })
    .toBuffer();

  const fgMeta = await sharp(foreground).metadata();
  const x = Math.max(0, Math.round((TARGET_W - (fgMeta.width ?? TARGET_W)) / 2));
  const top = Math.max(0, Math.round((TARGET_H - (fgMeta.height ?? TARGET_H)) / 2));

  await sharp(background)
    .composite([{ input: foreground, left: x, top }])
    .webp({ quality: 92, effort: 5 })
    .toFile(fileURLToPath(new URL(`world-${panel.id}-overview-v1.webp`, outputDir)));
}

console.log(`Generated ${panels.length} approved world overview assets.`);
