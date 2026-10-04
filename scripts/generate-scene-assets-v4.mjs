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

function spaceBackdrop(width, height) {
  const stars = Array.from({ length: 90 }, (_, index) => {
    const x = ((index * 73 + 31) % 997) / 997 * width;
    const y = ((index * 47 + 19) % 991) / 991 * height;
    const radius = index % 13 === 0 ? 1.8 : index % 5 === 0 ? 1.2 : 0.7;
    const opacity = index % 4 === 0 ? 0.95 : 0.68;
    const fill = index % 11 === 0 ? "#ffe7b0" : index % 7 === 0 ? "#b8dcff" : "#ffffff";
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${fill}" opacity="${opacity}"/>`;
  }).join("");

  const asteroids = Array.from({ length: 16 }, (_, index) => {
    const x = width * (0.08 + ((index * 61) % 83) / 100);
    const y = height * (0.12 + ((index * 37) % 72) / 100);
    const r = Math.max(3, Math.min(width, height) * (0.012 + (index % 4) * 0.007));
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#26313c" stroke="#8a7355" stroke-width="${Math.max(1, r * 0.12).toFixed(1)}" opacity=".88"/>`;
  }).join("");

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#071629"/>
          <stop offset="55%" stop-color="#0b2341"/>
          <stop offset="100%" stop-color="#020713"/>
        </linearGradient>
        <radialGradient id="nebula" cx="38%" cy="42%" r="70%">
          <stop offset="0%" stop-color="#2b77a8" stop-opacity=".42"/>
          <stop offset="45%" stop-color="#31548a" stop-opacity=".18"/>
          <stop offset="100%" stop-color="#08101e" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="planet" cx="34%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#dcefff"/>
          <stop offset="35%" stop-color="#74bce2"/>
          <stop offset="72%" stop-color="#2e6b9c"/>
          <stop offset="100%" stop-color="#17304d"/>
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#space)"/>
      <rect width="100%" height="100%" fill="url(#nebula)"/>
      ${stars}
      <circle cx="${(width * 0.84).toFixed(1)}" cy="${(height * 0.38).toFixed(1)}"
        r="${(Math.min(width, height) * 0.34).toFixed(1)}" fill="#6db9e8" opacity=".16" filter="url(#glow)"/>
      <circle cx="${(width * 0.88).toFixed(1)}" cy="${(height * 0.42).toFixed(1)}"
        r="${(Math.min(width, height) * 0.31).toFixed(1)}" fill="url(#planet)" stroke="#c7eeff" stroke-width="3"/>
      <path d="M0 ${(height * 0.72).toFixed(1)} C ${(width * 0.28).toFixed(1)} ${(height * 0.58).toFixed(1)}, ${(width * 0.55).toFixed(1)} ${(height * 0.8).toFixed(1)}, ${width} ${(height * 0.62).toFixed(1)}"
        fill="none" stroke="#6bbbe8" stroke-width="${Math.max(2, height * 0.012).toFixed(1)}" opacity=".18"/>
      ${asteroids}
    </svg>
  `);
}


async function renderMainOpen() {
  const opening = spaceBackdrop(290, 450);
  await sharp(scenePath("hangar-main-v2.webp"))
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.98, saturation: 1.02 })
    .composite([
      { input: opening, left: 1290, top: 105 }
    ])
    .webp({ quality: 93, effort: 5 })
    .toFile(scenePath("hangar-main-open-v6.webp"));
}

async function renderGateOpen(storyboard) {
  const closedGate = await sharp(storyboard)
    .extract({ left: 560, top: 675, width: 482, height: 207 })
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.95, saturation: 0.96 })
    .webp({ quality: 94 })
    .toBuffer();
  const opening = spaceBackdrop(1100, 780);

  await sharp(closedGate)
    .composite([
      { input: opening, left: 250, top: 70 }
    ])
    .webp({ quality: 93, effort: 5 })
    .toFile(scenePath("hangar-gate-open-v6.webp"));
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

await renderMainOpen();

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

console.log("Generated Hangar V4/V6 story-image set with clean space-only open-gate states.");
