import { readFile } from "node:fs/promises";

const sourceAssets = [
  "hangar-main-v2.webp",
  "hangar-energy-v1.webp",
  "hangar-workbench-v1.webp"
];

const runtimeAssets = [
  "hangar-main-blackout-v3.webp",
  "hangar-main-powered-v3.webp",
  "hangar-main-active-v3.webp",
  "hangar-main-open-v3.webp",
  "hangar-energy-v3.webp",
  "hangar-workbench-dark-v3.webp",
  "hangar-workbench-v3.webp",
  "hangar-ship-dark-v3.webp",
  "hangar-ship-v3.webp",
  "hangar-cooling-v3.webp",
  "hangar-navigation-v3.webp",
  "hangar-systemtest-v3.webp",
  "hangar-gate-closed-v3.webp",
  "hangar-gate-open-v3.webp",
  "hangar-crew-v3.webp"
];

async function verify(asset) {
  const url = new URL(
    `../public/assets/scenes/hangar/${asset}`,
    import.meta.url
  );
  const data = await readFile(url);

  if (data.length < 16) {
    throw new Error(`${asset}: file is too small`);
  }

  if (data.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error(`${asset}: missing RIFF header`);
  }

  if (data.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${asset}: not a WebP container`);
  }

  const declaredSize = data.readUInt32LE(4) + 8;

  if (declaredSize !== data.length) {
    throw new Error(
      `${asset}: RIFF declares ${declaredSize} bytes, file has ${data.length}`
    );
  }
}

for (const asset of [...sourceAssets, ...runtimeAssets]) {
  await verify(asset);
}

console.log(
  `Verified ${runtimeAssets.length} Hangar V3 runtime assets and ${sourceAssets.length} approved source assets.`
);
