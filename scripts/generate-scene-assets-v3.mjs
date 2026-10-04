import sharp from "sharp";
import { fileURLToPath } from "node:url";

const sceneDir = new URL("../public/assets/scenes/hangar/", import.meta.url);
const scenePath = (fileName) => fileURLToPath(new URL(fileName, sceneDir));
const W = 1600;
const H = 900;

const sources = {
  mainClosed: "hangar-main-v2.webp",
  energy: "hangar-energy-v1.webp",
  workbench: "hangar-workbench-v1.webp"
};

function svg(content) {
  return Buffer.from(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`
  );
}

function starfieldSvg() {
  const stars = Array.from({ length: 120 }, (_, index) => {
    const x = (index * 137 + 83) % 1540 + 30;
    const y = (index * 89 + 47) % 840 + 30;
    const r = index % 13 === 0 ? 2.2 : index % 5 === 0 ? 1.5 : 0.9;
    const color = index % 11 === 0 ? "#ffe8b2" : index % 7 === 0 ? "#b9dcff" : "#ffffff";
    const opacity = index % 4 === 0 ? 0.95 : 0.72;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
  }).join("");

  return svg(`
    <defs>
      <radialGradient id="nebula" cx="65%" cy="40%" r="75%">
        <stop offset="0%" stop-color="#214e78" stop-opacity=".42"/>
        <stop offset="45%" stop-color="#142945" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#030712" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#071527"/>
        <stop offset="100%" stop-color="#02050d"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#space)"/>
    <rect width="1600" height="900" fill="url(#nebula)"/>
    ${stars}
  `);
}

function energyCellSvg() {
  return svg(`
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#202d38"/>
        <stop offset="42%" stop-color="#8e9aa4"/>
        <stop offset="70%" stop-color="#1f2b35"/>
        <stop offset="100%" stop-color="#0f171e"/>
      </linearGradient>
      <linearGradient id="core" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3d78a5"/>
        <stop offset="45%" stop-color="#9df6ff"/>
        <stop offset="100%" stop-color="#2476b2"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <g transform="translate(350 510) rotate(-7 210 70)">
      <rect x="42" y="23" width="330" height="94" rx="45" fill="#48d7ff" opacity=".42" filter="url(#glow)"/>
      <rect x="0" y="10" width="420" height="120" rx="60" fill="url(#metal)" stroke="#e7b86c" stroke-width="6"/>
      <rect x="70" y="27" width="280" height="86" rx="42" fill="url(#core)" stroke="#bffaff" stroke-width="4"/>
      <path d="M118 30 V110 M305 30 V110" stroke="#0f3147" stroke-width="8" opacity=".65"/>
      <rect x="18" y="38" width="56" height="64" rx="16" fill="#222c34"/>
      <rect x="347" y="38" width="56" height="64" rx="16" fill="#222c34"/>
    </g>
  `);
}

function coolingRepairSvg() {
  return svg(`
    <defs>
      <linearGradient id="pipe" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d8e0e6"/>
        <stop offset="26%" stop-color="#4c5c69"/>
        <stop offset="58%" stop-color="#aebbc5"/>
        <stop offset="100%" stop-color="#263541"/>
      </linearGradient>
      <filter id="steam"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <g transform="translate(590 250) rotate(-4 470 150)">
      <rect x="0" y="72" width="940" height="170" rx="78" fill="url(#pipe)" stroke="#192733" stroke-width="18"/>
      <rect x="180" y="45" width="62" height="220" rx="20" fill="#bf8741" opacity=".85"/>
      <rect x="690" y="45" width="62" height="220" rx="20" fill="#bf8741" opacity=".85"/>
      <path d="M500 82 l35 42 -28 28 42 26 -42 52" fill="none" stroke="#08131c" stroke-width="22" stroke-linecap="round"/>
      <path d="M500 82 l35 42 -28 28 42 26 -42 52" fill="none" stroke="#7ce8ff" stroke-width="5" opacity=".65"/>
      <path d="M535 155 C570 160 585 230 560 300 C548 336 525 356 520 390" fill="none" stroke="#a8edff" stroke-width="15" opacity=".82"/>
      <circle cx="560" cy="302" r="26" fill="#b6f0ff" opacity=".30" filter="url(#steam)"/>
      <circle cx="525" cy="380" r="20" fill="#b6f0ff" opacity=".30" filter="url(#steam)"/>
    </g>
    <g transform="translate(1110 610) rotate(-18)">
      <rect x="0" y="0" width="260" height="52" rx="24" fill="#5a6670" stroke="#d1a85f" stroke-width="5"/>
      <circle cx="25" cy="26" r="34" fill="none" stroke="#8e9aa2" stroke-width="18"/>
    </g>
  `);
}

function navigationCockpitSvg() {
  return svg(`
    <defs>
      <linearGradient id="console" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#263845"/>
        <stop offset="100%" stop-color="#0a1118"/>
      </linearGradient>
      <radialGradient id="screen" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#0e5f88"/>
        <stop offset="100%" stop-color="#061c2a"/>
      </radialGradient>
      <filter id="screenGlow"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>

    <path d="M0 0 H1600 V440 H1470 L1310 210 H290 L130 440 H0 Z" fill="#0a1118" opacity=".60"/>
    <path d="M0 0 H1600 V86 H0 Z" fill="#101820"/>
    <path d="M0 0 L250 0 L380 425 L255 455 Z" fill="#131d25"/>
    <path d="M1600 0 L1350 0 L1220 425 L1345 455 Z" fill="#131d25"/>

    <path d="M0 505 L250 410 H1350 L1600 505 V900 H0 Z" fill="url(#console)" stroke="#6c5738" stroke-width="8"/>

    <rect x="210" y="520" width="315" height="205" rx="18" fill="#06131e" stroke="#50718a" stroke-width="6"/>
    <rect x="1075" y="520" width="315" height="205" rx="18" fill="#06131e" stroke="#50718a" stroke-width="6"/>
    <rect x="555" y="460" width="490" height="310" rx="24" fill="#06131e" stroke="#6e8797" stroke-width="7"/>

    <rect x="575" y="480" width="450" height="270" rx="16" fill="#31bff5" opacity=".18" filter="url(#screenGlow)"/>
    <rect x="585" y="490" width="430" height="250" rx="14" fill="url(#screen)"/>

    <circle cx="800" cy="615" r="74" fill="#2f83bd" opacity=".65"/>
    <circle cx="800" cy="615" r="104" fill="none" stroke="#6cd9ff" stroke-width="3" opacity=".70"/>
    <circle cx="800" cy="615" r="155" fill="none" stroke="#6cd9ff" stroke-width="2" opacity=".55"/>
    <ellipse cx="800" cy="615" rx="190" ry="90" fill="none" stroke="#9be9ff" stroke-width="2" opacity=".55"/>
    <circle cx="661" cy="580" r="10" fill="#ffcb65"/>
    <circle cx="930" cy="652" r="8" fill="#ffffff"/>
    <circle cx="748" cy="520" r="7" fill="#ffffff"/>
    <path d="M655 580 Q742 545 800 615 T932 653" fill="none" stroke="#ffcf6b" stroke-width="5" stroke-dasharray="14 12"/>

    <g fill="#48caff" opacity=".85">
      <rect x="235" y="545" width="112" height="12" rx="6"/>
      <rect x="235" y="575" width="208" height="9" rx="5"/>
      <rect x="235" y="607" width="164" height="9" rx="5"/>
      <rect x="235" y="650" width="245" height="34" rx="8" opacity=".55"/>
      <rect x="1100" y="545" width="178" height="12" rx="6"/>
      <rect x="1100" y="575" width="235" height="9" rx="5"/>
      <rect x="1100" y="607" width="150" height="9" rx="5"/>
      <rect x="1100" y="650" width="245" height="34" rx="8" opacity=".55"/>
    </g>

    <g fill="#f3b75c">
      <circle cx="360" cy="790" r="17"/>
      <circle cx="420" cy="790" r="17"/>
      <circle cx="1180" cy="790" r="17"/>
      <circle cx="1240" cy="790" r="17"/>
    </g>
  `);
}

function systemLightsSvg() {
  return svg(`
    <defs><filter id="g"><feGaussianBlur stdDeviation="16"/></filter></defs>
    <ellipse cx="905" cy="470" rx="340" ry="230" fill="#54e6ff" opacity=".14" filter="url(#g)"/>
    <g fill="#7ef5ff">
      <circle cx="660" cy="470" r="10"/>
      <circle cx="830" cy="390" r="9"/>
      <circle cx="1010" cy="475" r="11"/>
      <circle cx="1110" cy="555" r="8"/>
    </g>
  `);
}

function darkenShipOnOverviewSvg() {
  return svg(`
    <defs>
      <radialGradient id="d" cx="59%" cy="48%" r="37%">
        <stop offset="0%" stop-color="#02070c" stop-opacity=".44"/>
        <stop offset="62%" stop-color="#02070c" stop-opacity=".27"/>
        <stop offset="100%" stop-color="#02070c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#d)"/>
  `);
}

function workbenchGlowSvg() {
  return svg(`
    <defs><radialGradient id="g"><stop offset="0%" stop-color="#ffce79" stop-opacity=".24"/><stop offset="100%" stop-color="#ffce79" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="430" cy="590" rx="430" ry="280" fill="url(#g)"/>
  `);
}

function gateOpenSvg() {
  const stars = Array.from({ length: 65 }, (_, index) => {
    const x = 900 + ((index * 71 + 29) % 620);
    const y = 145 + ((index * 53 + 17) % 570);
    const r = index % 9 === 0 ? 2 : 1;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 8 === 0 ? "#ffe9b9" : "#eef8ff"}" opacity=".88"/>`;
  }).join("");

  return svg(`
    <defs>
      <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#071627"/>
        <stop offset="100%" stop-color="#02050c"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <path d="M875 118 H1555 V760 H875 Z" fill="url(#space)" stroke="#8bd8ff" stroke-width="10"/>
    ${stars}
    <rect x="866" y="108" width="698" height="662" fill="none" stroke="#70ccff" stroke-width="18" opacity=".18" filter="url(#glow)"/>
    <path d="M852 97 H1575 V792 H852" fill="none" stroke="#2b3640" stroke-width="34"/>
  `);
}

async function renderFrom(source, output, {
  brightness = 1,
  saturation = 1,
  contrast = 1,
  position = "centre",
  blur = 0,
  overlays = []
} = {}) {
  let pipeline = sharp(scenePath(source)).resize(W, H, { fit: "cover", position });
  if (blur > 0) pipeline = pipeline.blur(blur);
  pipeline = pipeline.modulate({ brightness, saturation });

  if (contrast !== 1) {
    const slope = contrast;
    const intercept = 128 * (1 - slope);
    pipeline = pipeline.linear(slope, intercept);
  }

  if (overlays.length) {
    pipeline = pipeline.composite(overlays.map((input) => ({ input, blend: "over" })));
  }

  await pipeline.webp({ quality: 91, effort: 5 }).toFile(scenePath(output));
}

await renderFrom(sources.mainClosed, "hangar-main-blackout-v3.webp", {
  brightness: 0.34,
  saturation: 0.62,
  contrast: 0.92
});

await renderFrom(sources.mainClosed, "hangar-main-powered-v3.webp", {
  brightness: 0.74,
  saturation: 0.88,
  overlays: [darkenShipOnOverviewSvg(), workbenchGlowSvg()]
});

await renderFrom(sources.mainClosed, "hangar-main-active-v3.webp", {
  brightness: 0.96,
  saturation: 1.02
});

await renderFrom(sources.energy, "hangar-energy-v3.webp", {
  brightness: 0.54,
  saturation: 0.62,
  position: "left"
});

await renderFrom(sources.workbench, "hangar-workbench-dark-v3.webp", {
  brightness: 0.43,
  saturation: 0.60,
  position: "left"
});

await renderFrom(sources.workbench, "hangar-workbench-v3.webp", {
  brightness: 0.94,
  saturation: 1.02,
  position: "left",
  overlays: [workbenchGlowSvg(), energyCellSvg()]
});

await renderFrom(sources.mainClosed, "hangar-ship-dark-v3.webp", {
  brightness: 0.46,
  saturation: 0.64,
  position: "60% 48%"
});

await renderFrom(sources.mainClosed, "hangar-ship-v3.webp", {
  brightness: 0.95,
  saturation: 1.04,
  position: "60% 48%"
});

await renderFrom(sources.mainClosed, "hangar-cooling-v3.webp", {
  brightness: 0.74,
  saturation: 0.82,
  position: "58% 54%",
  overlays: [coolingRepairSvg()]
});

await renderFrom(sources.mainClosed, "hangar-navigation-v3.webp", {
  brightness: 0.54,
  saturation: 0.76,
  blur: 1.2,
  position: "70% 46%",
  overlays: [navigationCockpitSvg()]
});

await renderFrom(sources.mainClosed, "hangar-systemtest-v3.webp", {
  brightness: 1.0,
  saturation: 1.05,
  position: "60% 48%",
  overlays: [systemLightsSvg()]
});

await renderFrom(sources.mainClosed, "hangar-gate-closed-v3.webp", {
  brightness: 0.90,
  saturation: 0.94,
  position: "right"
});

await renderFrom(sources.mainClosed, "hangar-gate-open-v3.webp", {
  brightness: 0.86,
  saturation: 0.92,
  position: "right",
  overlays: [gateOpenSvg()]
});

await renderFrom(sources.mainClosed, "hangar-crew-v3.webp", {
  brightness: 0.92,
  saturation: 1.0,
  position: "50% 68%"
});

console.log("Generated Hangar V3 story-native scene set.");
