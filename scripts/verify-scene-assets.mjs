import { readFile } from "node:fs/promises";

const assets = [
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

for (const asset of assets) {
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

console.log(`Verified ${assets.length} Hangar story scene assets.`);
