export type CinderHotspotId =
  | "settlement"
  | "condensers"
  | "stardust"
  | "workshop"
  | "ship";

export type CinderHotspot = {
  area: "cinder";
  id: CinderHotspotId;
  title: string;
  text: string;
};

export const cinderHotspots: Record<CinderHotspotId, CinderHotspot> = {
  settlement: {
    area: "cinder",
    id: "settlement",
    title: "Staubhafen",
    text: "Zwischen alten Tanks, Windrädern und Werkstätten lebt eine kleine Siedlung im roten Staub."
  },
  condensers: {
    area: "cinder",
    id: "condensers",
    title: "Alte Kondensatorfelder",
    text: "Die Anlage ist verschlissen, aber einige Rohre und Kühlflächen funktionieren noch."
  },
  stardust: {
    area: "cinder",
    id: "stardust",
    title: "Das Leuchten im Staub",
    text: "Zwischen den reparierten Leitungen glitzert etwas, das auf Louis' Harness reagiert."
  },
  workshop: {
    area: "cinder",
    id: "workshop",
    title: "Rikas Werkstatt",
    text: "Überall liegen alte Antriebsteile, Spulen und Werkzeuge. Rika hebt offenbar alles auf, was noch einmal nützlich werden könnte."
  },
  ship: {
    area: "cinder",
    id: "ship",
    title: "Euer Sternenschiff",
    text: "Der rote Staub hängt bereits an den Landestützen. Die Crew hat jetzt wirklich eine andere Welt erreicht."
  }
};
