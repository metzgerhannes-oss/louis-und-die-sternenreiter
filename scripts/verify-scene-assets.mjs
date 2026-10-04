import { readFile } from "node:fs/promises";

const sourceAssets = [
  "hangar-main-v2.webp",
  "hangar-energy-v1.webp",
  "hangar-workbench-v1.webp"
];

const runtimeAssets = [
  "hangar-main-blackout-v4.webp",
  "hangar-main-powered-v4.webp",
  "hangar-main-active-v4.webp",
  "hangar-main-open-v6.webp",
  "hangar-energy-v4.webp",
  "hangar-workbench-dark-v4.webp",
  "hangar-workbench-v4.webp",
  "hangar-ship-dark-v4.webp",
  "hangar-ship-v4.webp",
  "hangar-cooling-v4.webp",
  "hangar-navigation-v4.webp",
  "hangar-systemtest-v4.webp",
  "hangar-gate-closed-v4.webp",
  "hangar-gate-open-v6.webp",
  "hangar-crew-v4.webp"
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
  `Verified ${runtimeAssets.length} Hangar V4 runtime assets and ${sourceAssets.length} approved source assets.`
);
