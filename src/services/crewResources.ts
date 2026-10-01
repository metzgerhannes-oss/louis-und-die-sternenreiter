export type CrewResources = {
  stardust: number;
  scrapParts: number;
};

const STORAGE_KEY = "sternenreiter.crew-resources";
const initialResources: CrewResources = {
  stardust: 0,
  scrapParts: 0
};

export function loadCrewResources(): CrewResources {
  if (typeof window === "undefined") return initialResources;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialResources;

  try {
    const parsed = JSON.parse(raw) as Partial<CrewResources>;
    return {
      stardust: Math.max(0, Number(parsed.stardust ?? 0)),
      scrapParts: Math.max(0, Number(parsed.scrapParts ?? 0))
    };
  } catch {
    return initialResources;
  }
}

function save(resources: CrewResources): CrewResources {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  return resources;
}

export function addStardust(amount: number): CrewResources {
  const current = loadCrewResources();
  return save({ ...current, stardust: current.stardust + Math.max(0, amount) });
}

export function canSpendStardust(amount: number): boolean {
  return loadCrewResources().stardust >= Math.max(0, amount);
}

export function spendStardust(amount: number): boolean {
  const cost = Math.max(0, amount);
  const current = loadCrewResources();
  if (current.stardust < cost) return false;
  save({ ...current, stardust: current.stardust - cost });
  return true;
}
