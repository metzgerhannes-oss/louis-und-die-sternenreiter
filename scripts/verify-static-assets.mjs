import { readFile } from "node:fs/promises";

const assetPath = new URL("../public/assets/sprites/olli-v6-pilot-v66.webp", import.meta.url);
const data = await readFile(assetPath);

if (data.length < 16) {
  throw new Error("Olli V6 WebP is too small to be valid.");
}

if (data.toString("ascii", 0, 4) !== "RIFF") {
  throw new Error("Olli V6 WebP is missing RIFF header.");
}

if (data.toString("ascii", 8, 12) !== "WEBP") {
  throw new Error("Olli V6 asset is not a WebP container.");
}

const declaredSize = data.readUInt32LE(4) + 8;

if (declaredSize !== data.length) {
  throw new Error(
    `Olli V6 WebP is corrupt: RIFF declares ${declaredSize} bytes, file has ${data.length} bytes.`
  );
}

console.log(`Olli V6 asset OK: ${data.length} bytes`);
