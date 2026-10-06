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

  const scene = sharp(background)
    .composite([{ input: foreground, left: x, top }]);

  if (panel.id === "distortion") {
    // Störungsknoten: the world overlap is baked into the native WebP at build time.
    // Keep the lower character zone untouched so crew anatomy and identities remain
    // exactly as in the approved source artwork.
    const distortionOverlay = Buffer.from(`
      <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur24"><feGaussianBlur stdDeviation="24"/></filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="10" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="cinder" x1="0" x2="1">
            <stop offset="0" stop-color="#e36a36" stop-opacity=".74"/>
            <stop offset="1" stop-color="#e36a36" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="moss" x1="1" x2="0">
            <stop offset="0" stop-color="#58d391" stop-opacity=".62"/>
            <stop offset="1" stop-color="#58d391" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="junction" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#58c8ff" stop-opacity=".18"/>
            <stop offset=".5" stop-color="#78a7ff" stop-opacity=".52"/>
            <stop offset="1" stop-color="#cf69ff" stop-opacity=".1"/>
          </linearGradient>
        </defs>

        <!-- Cinder dust bleeding into the node -->
        <path d="M0 84 C250 30 470 150 645 315 C520 400 290 470 0 432 Z"
              fill="url(#cinder)" filter="url(#blur24)"/>
        <path d="M0 220 C270 140 470 250 625 390"
              fill="none" stroke="#ffad68" stroke-opacity=".48" stroke-width="10"/>

        <!-- Moss organic light bleeding in from the opposite side -->
        <path d="M1600 65 C1375 40 1190 160 1030 320 C1150 420 1360 475 1600 420 Z"
              fill="url(#moss)" filter="url(#blur24)"/>
        <path d="M1590 240 C1375 160 1200 260 1040 410"
              fill="none" stroke="#7ff0ad" stroke-opacity=".42" stroke-width="9"/>

        <!-- Junction-12 route geometry -->
        <g opacity=".55" stroke="#63cfff" fill="none">
          <path d="M280 115 L520 215 L710 132 L930 215 L1190 115" stroke-width="4"/>
          <path d="M350 175 L560 300 L800 170 L1040 300 L1250 175" stroke-width="2"/>
          <circle cx="800" cy="260" r="150" stroke-width="3" stroke-dasharray="16 12"/>
          <circle cx="800" cy="260" r="205" stroke-width="2" stroke-dasharray="9 17"/>
        </g>

        <!-- central unstable route-node -->
        <g filter="url(#glow)">
          <circle cx="800" cy="250" r="76" fill="url(#junction)" stroke="#bdeaff" stroke-width="7"/>
          <circle cx="800" cy="250" r="37" fill="#f2c5ff" fill-opacity=".64"/>
          <path d="M800 85 C735 155 865 205 800 275 C735 345 865 395 800 505"
                fill="none" stroke="#92ddff" stroke-width="12" stroke-linecap="round"/>
          <path d="M735 105 C800 165 690 225 765 300 C835 370 735 420 785 510"
                fill="none" stroke="#d673ff" stroke-width="7" stroke-linecap="round" opacity=".8"/>
        </g>

        <!-- small reality tears; all stay above the character zone -->
        <g fill="#e9f7ff" fill-opacity=".72">
          <path d="M420 92 l38 24 -31 25 -42 -18z"/>
          <path d="M1110 122 l42 -20 23 36 -48 17z"/>
          <path d="M620 390 l34 -17 25 32 -39 22z"/>
          <path d="M1000 395 l43 -22 18 35 -47 22z"/>
        </g>
      </svg>
    `);

    scene.composite([{ input: distortionOverlay, left: 0, top: 0 }]);
  }

  await scene
    .webp({ quality: 92, effort: 5 })
    .toFile(fileURLToPath(new URL(`world-${panel.id}-overview-v1.webp`, outputDir)));
}

console.log(`Generated ${panels.length} approved world overview assets (ART 0.24 with native Distortion node).`);
