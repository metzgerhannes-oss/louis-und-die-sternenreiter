export type CreationTier = "A" | "B" | "C" | "D";

export type StarPointOption = {
  id: string;
  title: string;
  description: string;
};

export type StarPointDefinition = {
  id: string;
  locationId: string;
  title: string;
  context: string;
  louisPrompt: string;
  tier: CreationTier;
  customIdeaAllowed: boolean;
  preparedOptions: readonly StarPointOption[];
  resultSummary: string;
};

export const hangarEnergyStarPoint: StarPointDefinition = {
  id: "hangar-energy-distributor",
  locationId: "hangar-3",
  title: "Der tote Energieverteiler",
  context:
    "Die Werkbank bekommt keinen Strom. Ein alter Anschluss ist vorhanden, aber die Verbindung fehlt.",
  louisPrompt:
    "Mein Harness reagiert auf diese Stelle. Hier fehlt etwas zwischen dem alten Verteiler und der Werkbank. Was sollen wir daraus bauen?",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "cable-bridge",
      title: "Kabelbrücke",
      description:
        "Eine robuste, sichtbare Energieleitung mit Schutzbügeln über dem Boden."
    },
    {
      id: "distributor-bot",
      title: "Verteilerroboter",
      description:
        "Ein kleiner rollender Roboter verteilt den Strom flexibel an die Werkbank."
    },
    {
      id: "wall-conduit",
      title: "Wandleitung",
      description:
        "Eine improvisierte Leitung läuft über die Hangarwand und hält den Boden frei."
    }
  ],
  resultSummary:
    "Die Werkbank ist wieder mit Energie versorgt. Louis hat die Idee in eine funktionierende Hangarlösung übersetzt."
};
