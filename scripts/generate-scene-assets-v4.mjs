import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sceneDir = new URL("../public/assets/scenes/hangar/", import.meta.url);
const sourceDir = new URL("./scene-source/", import.meta.url);
const scenePath = (name) => fileURLToPath(new URL(name, sceneDir));

const W = 1600;
const H = 900;

async function loadStoryboard() {
  const parts = [];
  for (let i = 0; i < 15; i += 1) {
    const name = `storyboard-v010.part-${String(i).padStart(2, "0")}.b64`;
    parts.push((await readFile(new URL(name, sourceDir), "utf8")).trim());
  }
  return Buffer.from(parts.join(""), "base64");
}

async function renderStoryboardCrop(storyboard, output, box, {
  brightness = 1,
  saturation = 1,
  position = "centre",
  sharpen = true
} = {}) {
  let img = sharp(storyboard)
    .extract(box)
    .resize(W, H, { fit: "cover", position })
    .modulate({ brightness, saturation });

  if (sharpen) img = img.sharpen({ sigma: 0.8 });

  await img.webp({ quality: 92, effort: 5 }).toFile(scenePath(output));
}

async function renderApprovedOverview(output, {
  brightness = 1,
  saturation = 1
} = {}) {
  await sharp(scenePath("hangar-main-v2.webp"))
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness, saturation })
    .webp({ quality: 92, effort: 5 })
    .toFile(scenePath(output));
}

async function renderCrew(output) {
  await sharp(scenePath("hangar-main-v2.webp"))
    .extract({ left: 440, top: 400, width: 810, height: 455 })
    .resize(W, H, { fit: "cover", position: "centre" })
    .sharpen({ sigma: 0.65 })
    .webp({ quality: 92, effort: 5 })
    .toFile(scenePath(output));
}

async function starBackdrop(storyboard, width, height) {
  return sharp(storyboard)
    .extract({ left: 430, top: 895, width: 800, height: 129 })
    .resize(width, height, { fit: "cover", position: "centre" })
    .sharpen({ sigma: 0.55 })
    .webp({ quality: 94 })
    .toBuffer();
}

function portalFrame(width, height, stroke = 22) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${stroke / 2}" y="${stroke / 2}"
        width="${width - stroke}" height="${height - stroke}"
        rx="10" fill="none" stroke="#1d2730" stroke-width="${stroke}"/>
      <rect x="${stroke + 3}" y="${stroke + 3}"
        width="${width - (stroke + 3) * 2}" height="${height - (stroke + 3) * 2}"
        rx="7" fill="none" stroke="#9b692d" stroke-width="5"/>
    </svg>
  `);
}

async function renderMainOpen(storyboard) {
  const opening = await starBackdrop(storyboard, 300, 430);
  await sharp(scenePath("hangar-main-v2.webp"))
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.98, saturation: 1.02 })
    .composite([
      { input: opening, left: 1280, top: 112 },
      { input: portalFrame(300, 430, 14), left: 1280, top: 112 }
    ])
    .webp({ quality: 93, effort: 5 })
    .toFile(scenePath("hangar-main-open-v5.webp"));
}

async function renderGateOpen(storyboard) {
  const closedGate = await sharp(storyboard)
    .extract({ left: 560, top: 675, width: 482, height: 207 })
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.95, saturation: 0.96 })
    .webp({ quality: 94 })
    .toBuffer();
  const opening = await starBackdrop(storyboard, 1090, 760);

  await sharp(closedGate)
    .composite([
      { input: opening, left: 255, top: 80 },
      { input: portalFrame(1090, 760, 24), left: 255, top: 80 }
    ])
    .webp({ quality: 93, effort: 5 })
    .toFile(scenePath("hangar-gate-open-v5.webp"));
}

const storyboard = await loadStoryboard();

await renderApprovedOverview("hangar-main-blackout-v4.webp", {
  brightness: 0.32,
  saturation: 0.58
});
await renderApprovedOverview("hangar-main-powered-v4.webp", {
  brightness: 0.74,
  saturation: 0.88
});
await renderApprovedOverview("hangar-main-active-v4.webp", {
  brightness: 0.98,
  saturation: 1.02
});

await renderMainOpen(storyboard);

await renderStoryboardCrop(
  storyboard,
  "hangar-energy-v4.webp",
  { left: 590, top: 80, width: 450, height: 227 },
  { brightness: 0.66, saturation: 0.72, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-workbench-dark-v4.webp",
  { left: 1080, top: 82, width: 456, height: 225 },
  { brightness: 0.38, saturation: 0.58, position: "centre" }
);
await renderStoryboardCrop(
  storyboard,
  "hangar-workbench-v4.webp",
  { left: 1080, top: 82, width: 456, height: 225 },
  { brightness: 1.0, saturation: 1.02, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-ship-dark-v4.webp",
  { left: 0, top: 392, width: 558, height: 202 },
  { brightness: 0.42, saturation: 0.60, position: "centre" }
);
await renderStoryboardCrop(
  storyboard,
  "hangar-ship-v4.webp",
  { left: 0, top: 392, width: 558, height: 202 },
  { brightness: 0.96, saturation: 1.02, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-cooling-v4.webp",
  { left: 560, top: 392, width: 482, height: 202 },
  { brightness: 0.98, saturation: 1.0, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-navigation-v4.webp",
  { left: 1044, top: 392, width: 492, height: 202 },
  { brightness: 0.96, saturation: 0.98, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-systemtest-v4.webp",
  { left: 0, top: 675, width: 558, height: 207 },
  { brightness: 1.0, saturation: 1.04, position: "centre" }
);

await renderStoryboardCrop(
  storyboard,
  "hangar-gate-closed-v4.webp",
  { left: 560, top: 675, width: 482, height: 207 },
  { brightness: 0.95, saturation: 0.96, position: "centre" }
);

await renderGateOpen(storyboard);

await renderCrew("hangar-crew-v4.webp");

console.log("Generated Hangar V4/V5 story-image set with full-resolution open-gate states.");
