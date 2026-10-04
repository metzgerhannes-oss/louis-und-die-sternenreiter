import sharp from "sharp";
import { fileURLToPath } from "node:url";

const sceneDir = new URL("../public/assets/scenes/hangar/", import.meta.url);
const scenePath = (fileName) => fileURLToPath(new URL(fileName, sceneDir));
const approvedClosedOverview = scenePath("hangar-main-v2.webp");

const sceneConfigs = {
  overview: { source: "hangar-main-v2.webp", gateWidth: 0.31 },
  energy: { source: "hangar-energy-v1.webp", gateWidth: 0.31 },
  workbench: { source: "hangar-workbench-v1.webp", gateWidth: 0.27 },
  ship: { source: "hangar-ship-v1.webp", gateWidth: 0.29 },
  cooling: { source: "hangar-cooling-v1.webp", gateWidth: 0.27 },
  navigation: { source: "hangar-navigation-v1.webp", gateWidth: 0.27 },
  systemtest: { source: "hangar-systemtest-v1.webp", gateWidth: 0.27 },
  gate: { source: "hangar-gate-v1.webp", gateWidth: 0.46 },
  crew: { source: "hangar-crew-v1.webp", gateWidth: 0.29 }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function metadata(fileName) {
  const data = await sharp(scenePath(fileName)).metadata();
  if (!data.width || !data.height) {
    throw new Error(`${fileName}: missing dimensions`);
  }
  return { width: data.width, height: data.height };
}

async function approvedGateBuffer(width, height) {
  const sourceMeta = await sharp(approvedClosedOverview).metadata();
  if (!sourceMeta.width || !sourceMeta.height) {
    throw new Error("hangar-main-v2.webp: missing dimensions");
  }

  const sourceWidth = Math.round(sourceMeta.width * 0.31);
  return sharp(approvedClosedOverview)
    .extract({
      left: sourceMeta.width - sourceWidth,
      top: 0,
      width: sourceWidth,
      height: sourceMeta.height
    })
    .resize({ width, height, fit: "fill" })
    .webp({ quality: 94 })
    .toBuffer();
}

function sceneGlow(width, height, {
  x = 0.5,
  y = 0.55,
  rx = 0.28,
  ry = 0.28,
  color = "#8ad9df",
  opacity = 0.2
} = {}) {
  const cx = Math.round(width * x);
  const cy = Math.round(height * y);
  const ellipseRx = Math.round(width * rx);
  const ellipseRy = Math.round(height * ry);
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g">
          <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}" />
          <stop offset="45%" stop-color="${color}" stop-opacity="${opacity * 0.42}" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${ellipseRx}" ry="${ellipseRy}" fill="url(#g)" />
    </svg>
  `);
}

function starfield(width, height) {
  const stars = Array.from({ length: 44 }, (_, index) => {
    const x = (index * 83 + 31) % Math.max(1, width - 8) + 4;
    const y = (index * 47 + 19) % Math.max(1, height - 8) + 4;
    const r = index % 9 === 0 ? 1.7 : index % 4 === 0 ? 1.2 : 0.8;
    const opacity = index % 5 === 0 ? 0.95 : 0.66;
    const fill = index % 7 === 0 ? "#cfe8ff" : index % 11 === 0 ? "#ffe9b8" : "#ffffff";
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}" />`;
  }).join("");

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#071425" />
          <stop offset="72%" stop-color="#020710" />
          <stop offset="100%" stop-color="#01030a" />
        </linearGradient>
        <radialGradient id="nebula">
          <stop offset="0%" stop-color="#345f86" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#345f86" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#space)" />
      <ellipse cx="${Math.round(width * 0.7)}" cy="${Math.round(height * 0.36)}" rx="${Math.round(width * 0.62)}" ry="${Math.round(height * 0.42)}" fill="url(#nebula)" />
      ${stars}
    </svg>
  `);
}

function edgeShade(width, height) {
  const shadeWidth = clamp(Math.round(width * 0.045), 12, 42);
  return {
    input: Buffer.from(`
      <svg width="${shadeWidth}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="s" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#05090d" stop-opacity="0.52" />
            <stop offset="100%" stop-color="#05090d" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#s)" />
      </svg>
    `),
    left: 0,
    top: 0,
    blend: "over"
  };
}

async function makeClosedScene({
  source,
  output,
  gateWidth,
  brightness = 1,
  saturation = 1,
  glow = null
}) {
  const { width, height } = await metadata(source);
  const coverWidth = clamp(Math.round(width * gateWidth), 1, width);
  const gate = await approvedGateBuffer(coverWidth, height);
  const overlays = [
    { input: gate, left: width - coverWidth, top: 0, blend: "over" }
  ];

  if (glow) {
    overlays.push({ input: sceneGlow(width, height, glow), left: 0, top: 0, blend: "screen" });
  }

  const seam = edgeShade(coverWidth, height);
  overlays.push({ ...seam, left: width - coverWidth });

  await sharp(scenePath(source))
    .composite(overlays)
    .modulate({ brightness, saturation })
    .webp({ quality: 92, effort: 5 })
    .toFile(scenePath(output));
}

async function makeOpenScene({
  source,
  output,
  gateWidth,
  brightness = 1,
  saturation = 1,
  glow = null
}) {
  const { width, height } = await metadata(source);
  const openingWidth = clamp(Math.round(width * gateWidth), 1, width);
  const overlays = [
    {
      input: starfield(openingWidth, height),
      left: width - openingWidth,
      top: 0,
      blend: "over"
    }
  ];

  if (glow) {
    overlays.push({ input: sceneGlow(width, height, glow), left: 0, top: 0, blend: "screen" });
  }

  const seam = edgeShade(openingWidth, height);
  overlays.push({ ...seam, left: width - openingWidth });

  await sharp(scenePath(source))
    .composite(overlays)
    .modulate({ brightness, saturation })
    .webp({ quality: 92, effort: 5 })
    .toFile(scenePath(output));
}

async function makeNativeState({
  source,
  output,
  brightness = 1,
  saturation = 1,
  glow = null
}) {
  const { width, height } = await metadata(source);
  const overlays = glow
    ? [{ input: sceneGlow(width, height, glow), left: 0, top: 0, blend: "screen" }]
    : [];

  await sharp(scenePath(source))
    .composite(overlays)
    .modulate({ brightness, saturation })
    .webp({ quality: 92, effort: 5 })
    .toFile(scenePath(output));
}

const closed = [
  {
    source: sceneConfigs.energy.source,
    output: "hangar-energy-v2.webp",
    gateWidth: sceneConfigs.energy.gateWidth,
    brightness: 0.52,
    saturation: 0.66
  },
  {
    source: sceneConfigs.workbench.source,
    output: "hangar-workbench-dark-v2.webp",
    gateWidth: sceneConfigs.workbench.gateWidth,
    brightness: 0.5,
    saturation: 0.64
  },
  {
    source: sceneConfigs.workbench.source,
    output: "hangar-workbench-v2.webp",
    gateWidth: sceneConfigs.workbench.gateWidth,
    brightness: 0.92,
    saturation: 1.02,
    glow: { x: 0.25, y: 0.58, rx: 0.34, ry: 0.34, color: "#e6b66c", opacity: 0.26 }
  },
  {
    source: sceneConfigs.ship.source,
    output: "hangar-ship-dark-v2.webp",
    gateWidth: sceneConfigs.ship.gateWidth,
    brightness: 0.56,
    saturation: 0.68
  },
  {
    source: sceneConfigs.ship.source,
    output: "hangar-ship-v2.webp",
    gateWidth: sceneConfigs.ship.gateWidth,
    brightness: 0.94,
    saturation: 1.02,
    glow: { x: 0.59, y: 0.53, rx: 0.36, ry: 0.31, color: "#75d6df", opacity: 0.19 }
  },
  {
    source: sceneConfigs.cooling.source,
    output: "hangar-cooling-v2.webp",
    gateWidth: sceneConfigs.cooling.gateWidth,
    brightness: 0.9,
    saturation: 0.96,
    glow: { x: 0.46, y: 0.6, rx: 0.3, ry: 0.3, color: "#e1aa62", opacity: 0.12 }
  },
  {
    source: sceneConfigs.navigation.source,
    output: "hangar-navigation-v2.webp",
    gateWidth: sceneConfigs.navigation.gateWidth,
    brightness: 0.94,
    saturation: 1.02,
    glow: { x: 0.48, y: 0.48, rx: 0.34, ry: 0.34, color: "#70d4df", opacity: 0.22 }
  },
  {
    source: sceneConfigs.systemtest.source,
    output: "hangar-systemtest-v2.webp",
    gateWidth: sceneConfigs.systemtest.gateWidth,
    brightness: 1.01,
    saturation: 1.05,
    glow: { x: 0.56, y: 0.5, rx: 0.42, ry: 0.38, color: "#7adce4", opacity: 0.22 }
  },
  {
    source: sceneConfigs.gate.source,
    output: "hangar-gate-closed-v2.webp",
    gateWidth: sceneConfigs.gate.gateWidth,
    brightness: 0.92,
    saturation: 0.94
  },
  {
    source: sceneConfigs.crew.source,
    output: "hangar-crew-v2.webp",
    gateWidth: sceneConfigs.crew.gateWidth,
    brightness: 0.9,
    saturation: 0.97
  }
];

for (const config of closed) {
  await makeClosedScene(config);
}

await makeNativeState({
  source: sceneConfigs.overview.source,
  output: "hangar-main-blackout-v2.webp",
  brightness: 0.46,
  saturation: 0.62
});
await makeNativeState({
  source: sceneConfigs.overview.source,
  output: "hangar-main-powered-v2.webp",
  brightness: 0.78,
  saturation: 0.88,
  glow: { x: 0.19, y: 0.56, rx: 0.25, ry: 0.31, color: "#e4b36b", opacity: 0.18 }
});
await makeNativeState({
  source: sceneConfigs.overview.source,
  output: "hangar-main-active-v2.webp",
  brightness: 0.96,
  saturation: 1.01,
  glow: { x: 0.56, y: 0.52, rx: 0.34, ry: 0.31, color: "#72d6df", opacity: 0.15 }
});

const open = [
  ["hangar-main-v1.webp", "hangar-main-open-v2.webp", sceneConfigs.overview.gateWidth],
  [sceneConfigs.energy.source, "hangar-energy-open-v2.webp", sceneConfigs.energy.gateWidth],
  [sceneConfigs.workbench.source, "hangar-workbench-open-v2.webp", sceneConfigs.workbench.gateWidth],
  [sceneConfigs.ship.source, "hangar-ship-open-v2.webp", sceneConfigs.ship.gateWidth],
  [sceneConfigs.cooling.source, "hangar-cooling-open-v2.webp", sceneConfigs.cooling.gateWidth],
  [sceneConfigs.navigation.source, "hangar-navigation-open-v2.webp", sceneConfigs.navigation.gateWidth],
  [sceneConfigs.systemtest.source, "hangar-systemtest-open-v2.webp", sceneConfigs.systemtest.gateWidth],
  [sceneConfigs.gate.source, "hangar-gate-open-v2.webp", sceneConfigs.gate.gateWidth],
  [sceneConfigs.crew.source, "hangar-crew-open-v2.webp", sceneConfigs.crew.gateWidth]
];

for (const [source, output, gateWidth] of open) {
  await makeOpenScene({
    source,
    output,
    gateWidth,
    brightness: 1,
    saturation: 1.02
  });
}

console.log("Generated Hangar V2 native scene states.");
