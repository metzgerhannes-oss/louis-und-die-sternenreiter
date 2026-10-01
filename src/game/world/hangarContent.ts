export type HangarHotspotId = "ship" | "workbench" | "hangar-door";

export type HangarHotspot = {
  id: HangarHotspotId;
  title: string;
  text: string;
};

export const hangarHotspots: Record<HangarHotspotId, HangarHotspot> = {
  ship: {
    id: "ship",
    title: "Das alte Sternenschiff",
    text: "Es sieht mitgenommen aus, aber der Rumpf ist stark. Mit ein paar guten Ideen fliegt es wieder."
  },
  workbench: {
    id: "workbench",
    title: "Werkbank",
    text: "Hier werden später Module repariert, gebaut und verbessert."
  },
  "hangar-door": {
    id: "hangar-door",
    title: "Hangartor",
    text: "Dahinter wartet der erste Sternenpfad. Noch ist das Schiff nicht startklar."
  }
};
