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
  stardustCost?: number;
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
  stardustCost: 0,
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
    {
      id: "magnetic-rails",
      title: "Magnetische Führungsschienen",
      description:
        "Starke Magnetmodule führen die verklemmten Torsegmente sauber auseinander."
    },
    {
      id: "servo-pair",
      title: "Zwei Zusatzservos",
      description:
        "Zwei alte Schiffsservos helfen dem Torantrieb links und rechts."
    },
    {
      id: "counterweight",
      title: "Gegengewicht-System",
      description:
        "Seilzüge und schwere Metallblöcke nehmen dem alten Motor einen Teil der Last ab."
    }
  ],
  stardustCost: 0,
  resultTitle: "Hangartor geöffnet",
  resultSummary:
    "Die neue Unterstützung greift. Das Tor fährt auf und zum ersten Mal ist das Sternenfeld direkt vor Hangar 3 zu sehen."
};

export const cinderMoistureStarPoint: StarPointDefinition = {
  id: "cinder-moisture-capture",
  locationId: "cinder-condensers",
  title: "Wasser aus Cinders Luft",
  context:
    "Die alten Kondensatoren funktionieren teilweise, aber die Sammelflächen sind beschädigt. Nachts steckt genug Feuchtigkeit in der kalten Luft.",
  louisPrompt:
    "Wir müssen die Feuchtigkeit nur besser einfangen und abkühlen. Was bauen wir aus den alten Teilen?",
  customPrompt:
    "Erzähl mir, wie wir aus Cinders kalter Nachtluft wieder zuverlässig Wasser gewinnen können.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "night-fog-sails",
      title: "Nachtnebel-Fänger",
      description:
        "Große Netze und Kühlsegel sammeln nachts winzige Wassertröpfchen aus der Luft."
    },
    {
      id: "deep-condenser",
      title: "Tiefenkondensator",
      description:
        "Die Anlage nutzt alte Rohre im kühlen Untergrund, um die Luft stärker abzukühlen."
    },
    {
      id: "wind-cooler",
      title: "Windkühler",
      description:
        "Cinders starker Wind treibt einen großen Kühler an, der die Luft durch kalte Lamellen presst."
    }
  ],
  stardustCost: 0,
  resultTitle: "Rohwasser gewonnen",
  resultSummary:
    "Die Kondensatorfelder arbeiten wieder. In den Sammelrinnen läuft erstmals genug Wasser zusammen."
};

export const cinderDistributionStarPoint: StarPointDefinition = {
  id: "cinder-water-distribution",
  locationId: "cinder-staubhafen",
  title: "Der Weg des Wassers",
  context:
    "Das neue Wasser entsteht draußen im Canyon. Staubhafen braucht eine zuverlässige Verbindung zur Siedlung.",
  louisPrompt:
    "Das ist größer als unsere Hangar-Reparaturen. Mein Harness braucht den Sternenstaub, damit die Form stabil bleibt. Wie soll das Wasser nach Staubhafen kommen?",
  customPrompt:
    "Erzähl mir, wie wir das Wasser sicher durch den Canyon bis nach Staubhafen bringen sollen.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "gravity-tank",
      title: "Hochbehälter und Gefälleleitung",
      description:
        "Ein hoher Tank speichert Wasser und schickt es mit natürlichem Gefälle durch robuste Leitungen."
    },
    {
      id: "pressure-line",
      title: "Unterirdische Druckleitung",
      description:
        "Eine geschützte Leitung läuft unter dem heißen Canyonboden direkt bis zur Siedlung."
    },
    {
      id: "tank-crawler",
      title: "Tankläufer",
      description:
        "Ein alter Transportläufer wird zum autonomen Wassertank umgebaut und pendelt zwischen Quelle und Siedlung."
    }
  ],
  stardustCost: 1,
  resultTitle: "Staubhafen bekommt Wasser",
  resultSummary:
    "Die große Formung hält. Wasser erreicht Staubhafen und Louis' Harness wird wieder ruhig."
};
