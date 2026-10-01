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
  customPrompt?: string;
  tier: CreationTier;
  customIdeaAllowed: boolean;
  preparedOptions: readonly StarPointOption[];
  resultTitle: string;
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
  customPrompt:
    "Erzähl mir genau, wie du die Energie vom alten Verteiler zur Werkbank bringen würdest.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    { id: "cable-bridge", title: "Kabelbrücke", description: "Eine robuste, sichtbare Energieleitung mit Schutzbügeln über dem Boden." },
    { id: "distributor-bot", title: "Verteilerroboter", description: "Ein kleiner rollender Roboter verteilt den Strom flexibel an die Werkbank." },
    { id: "wall-conduit", title: "Wandleitung", description: "Eine improvisierte Leitung läuft über die Hangarwand und hält den Boden frei." }
  ],
  resultTitle: "Werkbank aktiviert",
  resultSummary:
    "Die Werkbank ist wieder mit Energie versorgt. Louis hat die Idee in eine funktionierende Hangarlösung übersetzt."
};

export const hangarGateStarPoint: StarPointDefinition = {
  id: "hangar-gate-assist",
  locationId: "hangar-3",
  title: "Das schwere Hangartor",
  context:
    "Der Torantrieb funktioniert, ist aber zu schwach für die verklemmten Segmente. Das Schiff ist startklar, nur der Weg nach draußen fehlt.",
  louisPrompt:
    "Das Tor ist nicht kaputt. Es ist zu schwer für seinen alten Antrieb. Was bauen wir dazu, damit es sich wieder öffnen kann?",
  customPrompt:
    "Erzähl mir, wie wir dem alten Tor genug Kraft oder Führung geben können, ohne den Hangar zu beschädigen.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    { id: "magnetic-rails", title: "Magnetische Führungsschienen", description: "Starke Magnetmodule führen die verklemmten Torsegmente sauber auseinander." },
    { id: "servo-pair", title: "Zwei Zusatzservos", description: "Zwei alte Schiffsservos helfen dem Torantrieb links und rechts." },
    { id: "counterweight", title: "Gegengewicht-System", description: "Seilzüge und schwere Metallblöcke nehmen dem alten Motor einen Teil der Last ab." }
  ],
  resultTitle: "Hangartor geöffnet",
  resultSummary:
    "Die neue Unterstützung greift. Das Tor fährt auf und zum ersten Mal ist das Sternenfeld direkt vor Hangar 3 zu sehen."
};
