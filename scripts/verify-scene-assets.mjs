import { readFile } from "node:fs/promises";

const sourceAssets = [
  "hangar-main-v1.webp",
  "hangar-main-v2.webp",
  "hangar-energy-v1.webp",
  "hangar-workbench-v1.webp",
  "hangar-ship-v1.webp",
  "hangar-cooling-v1.webp",
  "hangar-navigation-v1.webp",
  "hangar-systemtest-v1.webp",
  "hangar-gate-v1.webp",
  "hangar-crew-v1.webp"
];

const runtimeAssets = [
  "hangar-main-blackout-v2.webp",
  "hangar-main-powered-v2.webp",
  "hangar-main-active-v2.webp",
  "hangar-main-open-v2.webp",
  "hangar-energy-v2.webp",
  "hangar-energy-open-v2.webp",
  "hangar-workbench-dark-v2.webp",
  "hangar-workbench-v2.webp",
  "hangar-workbench-open-v2.webp",
  "hangar-ship-dark-v2.webp",
  "hangar-ship-v2.webp",
  "hangar-ship-open-v2.webp",
  "hangar-cooling-v2.webp",
  "hangar-cooling-open-v2.webp",
  "hangar-navigation-v2.webp",
  "hangar-navigation-open-v2.webp",
  "hangar-systemtest-v2.webp",
  "hangar-systemtest-open-v2.webp",
  "hangar-gate-closed-v2.webp",
  "hangar-gate-open-v2.webp",
  "hangar-crew-v2.webp",
  "hangar-crew-open-v2.webp"
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
  `Verified ${runtimeAssets.length} native Hangar V2 runtime assets and ${sourceAssets.length} source assets.`
);
