import type { CrewSpeaker } from "./chapter1";
import {
  cloudOceanStarPoint,
  distortionBoundaryStarPoint,
  distortionRouteStarPoint,
  emptyAnchorStarPoint,
  glassCoastStarPoint,
  heartEnergyStarPoint,
  heartRoutesStarPoint,
  heartRulesStarPoint,
  junctionSignalStarPoint,
  mossPathStarPoint,
  mossRobotStarPoint,
  scrapArchiveStarPoint
} from "./adventureStarPoints";
import type { StarPointDefinition } from "./starPoints";

export type AdventureWorldId =
  | "moss"
  | "junction-12"
  | "empty-path"
  | "distortion"
  | "glass-coast"
  | "cloud-ocean"
  | "scrap-ring"
  | "heart-of-ways";

export type AdventureSpeaker =
  | CrewSpeaker
  | "Dr. Niva"
  | "M-4"
  | "Bram"
  | "Archiv"
  | "Herz";

export type AdventureLine = {
  speaker: AdventureSpeaker;
  text: string;
};

export type AdventureBeat = {
  id: string;
  eyebrow: string;
  title: string;
  lines: readonly AdventureLine[];
  actionLabel: string;
  rewardStardust?: number;
};

export type AdventureHotspot = {
  id: string;
  title: string;
  text: string;
  x: number;
  y: number;
};

export type AdventureStep =
  | {
      kind: "story";
      objective: string;
      beat: AdventureBeat;
      hotspotId?: string;
    }
  | {
      kind: "starpoint";
      objective: string;
      point: StarPointDefinition;
      x: number;
      y: number;
    }
  | {
      kind: "travel";
      objective: string;
      nextWorld?: AdventureWorldId;
      ending?: boolean;
    };

export type WorldTheme = {
  sky: number;
  horizon: number;
  ground: number;
  accent: number;
  glow: number;
  labelColor: string;
};

export type AdventureWorld = {
  id: AdventureWorldId;
  chapter: string;
  title: string;
  subtitle: string;
  theme: WorldTheme;
  hotspots: readonly AdventureHotspot[];
  steps: readonly AdventureStep[];
};

const allCrew = (
  louis: string,
  philipp: string,
  charly: string,
  olli: string,
  extra: AdventureLine[] = []
): AdventureLine[] => [
  { speaker: "Louis", text: louis },
  { speaker: "Philipp", text: philipp },
  { speaker: "Charly", text: charly },
  { speaker: "Olli", text: olli },
  ...extra
];

export const adventureWorlds: Record<AdventureWorldId, AdventureWorld> = {
  moss: {
    id: "moss",
    chapter: "Kapitel 2B",
    title: "Moss",
    subtitle: "Leuchtsumpf · Forschungsstation",
    theme: {
      sky: 0x102824,
      horizon: 0x1d5145,
      ground: 0x17352f,
      accent: 0x6fce9a,
      glow: 0x9ff6be,
      labelColor: "#9ff6be"
    },
    hotspots: [
      {
        id: "station",
        title: "Forschungsstation",
        text: "Eine kleine Station steht zwischen riesigen Blättern. Ein Notsignal blinkt.",
        x: 0.76,
        y: 0.58
      },
      {
        id: "beacon",
        title: "M-4s Peilsignal",
        text: "Zwischen den Pflanzen pulst ein schwaches Robotersignal.",
        x: 0.55,
        y: 0.62
      },
      {
        id: "robot",
        title: "M-4",
        text: "Der Forschungsroboter steckt zwischen leuchtenden Wurzeln fest.",
        x: 0.34,
        y: 0.66
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Seht euch gemeinsam auf Moss um.",
        beat: {
          id: "moss-arrival",
          eyebrow: "Kapitel 2 · Moss",
          title: "Eine Welt, die leuchtet",
          lines: allCrew(
            "So viel Leben. Mein Scanner kommt kaum hinterher.",
            "Die Luft ist feucht. Ganz anders als Cinder.",
            "Und überall diese riesigen Blätter. Wir sollten nichts zertrampeln.",
            "Da vorne blinkt eine Station. Und irgendwas piept zurück."
          ),
          actionLabel: "Forschungsstation suchen"
        }
      },
      {
        kind: "story",
        objective: "Sprecht mit der Forschungsstation.",
        hotspotId: "station",
        beat: {
          id: "moss-missing-robot",
          eyebrow: "Moss · Forschungsstation",
          title: "M-4 ist verschwunden",
          lines: allCrew(
            "Ich empfange den Roboter. Sehr schwach, tief im Sumpf.",
            "Dann suchen wir erst den Weg, nicht gleich den Roboter.",
            "Der alte Steg hört einfach mitten im Wasser auf.",
            "Also bauen wir einen besseren. Einen, der Moss nicht kaputtmacht.",
            [
              {
                speaker: "Dr. Niva",
                text: "M-4 trägt unser einziges intaktes Langstrecken-Scanner-Modul. Bringt ihn heil zurück."
              }
            ]
          ),
          actionLabel: "Zum Sumpf"
        }
      },
      {
        kind: "starpoint",
        objective: "Findet mit Louis einen sicheren Weg durch den Leuchtsumpf.",
        point: mossPathStarPoint,
        x: 0.48,
        y: 0.63
      },
      {
        kind: "story",
        objective: "Folgt M-4s Peilsignal.",
        hotspotId: "beacon",
        beat: {
          id: "moss-beacon",
          eyebrow: "Moss · Tiefer Sumpf",
          title: "Das Signal ist direkt unter uns",
          lines: allCrew(
            "M-4 steckt in den Wurzeln. Wenn wir ziehen, reißen wir ihn auseinander.",
            "Der Metallrahmen ist noch stabil. Wir brauchen eine kontrollierte Bergung.",
            "Und die Wurzeln bleiben heil.",
            "Louis, diesmal darf es ruhig etwas spektakulärer werden."
          ),
          actionLabel: "Bergung planen"
        }
      },
      {
        kind: "starpoint",
        objective: "Bergt M-4, ohne die Wurzeln zu beschädigen.",
        point: mossRobotStarPoint,
        x: 0.34,
        y: 0.66
      },
      {
        kind: "story",
        objective: "Sprecht mit dem geborgenen M-4.",
        hotspotId: "robot",
        beat: {
          id: "moss-rescue",
          eyebrow: "Moss · M-4 geborgen",
          title: "Ein Scanner für die Crew",
          lines: allCrew(
            "M-4s Scanner funktioniert. Er zeigt einen stark bevölkerten Knotenpunkt: Junction 12.",
            "Das Modul passt in unseren Kartentisch.",
            "Dann sehen wir künftig mehr als nur den nächsten schwachen Punkt.",
            "M-4 sagt übrigens danke. Also glaube ich. Es klang wie eine Kaffeemaschine.",
            [
              {
                speaker: "M-4",
                text: "Bergung erfolgreich. Scanner-Modul freigegeben. Empfehlung: weniger Sumpf."
              }
            ]
          ),
          actionLabel: "Scanner einbauen",
          rewardStardust: 2
        }
      },
      {
        kind: "travel",
        objective: "Scanner eingebaut · Kurs Junction 12.",
        nextWorld: "junction-12"
      }
    ]
  },

  "junction-12": {
    id: "junction-12",
    chapter: "Kapitel 2C",
    title: "Junction 12",
    subtitle: "Marktstation · tausend Antennen",
    theme: {
      sky: 0x17162b,
      horizon: 0x3b2352,
      ground: 0x28263a,
      accent: 0xe27ac5,
      glow: 0x67dbe0,
      labelColor: "#e7a6df"
    },
    hotspots: [
      {
        id: "market",
        title: "Neonmarkt",
        text: "Werkstätten, Garküchen, Händler und Antennen wurden direkt übereinander gebaut.",
        x: 0.72,
        y: 0.59
      },
      {
        id: "mechanic",
        title: "Brams Werkstatt",
        text: "Ein alter Mechaniker hat Louis' Harness erkannt.",
        x: 0.34,
        y: 0.64
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Betretet gemeinsam Junction 12.",
        beat: {
          id: "junction-arrival",
          eyebrow: "Kapitel 2 · Junction 12",
          title: "Endlich wieder Stimmen",
          lines: allCrew(
            "So viele Funksignale. Ich verstehe ungefähr jedes siebte.",
            "Das ist kein Außenposten. Das ist eine ganze Stadt im All.",
            "Und offenbar wurde hier wirklich nichts weggeworfen.",
            "Ich habe gerade drei Läden für gebrauchte Antennen gesehen."
          ),
          actionLabel: "Zum Neonmarkt"
        }
      },
      {
        kind: "story",
        objective: "Findet heraus, warum Junction 12 nur Rauschen empfängt.",
        hotspotId: "market",
        beat: {
          id: "junction-market",
          eyebrow: "Junction 12 · Neonmarkt",
          title: "Der nächste Weg ist nur Rauschen",
          lines: allCrew(
            "Der große Signalmast sendet, aber er hört fast nichts.",
            "Die Verstärker sind überall verteilt. Das könnte sogar helfen.",
            "Dann machen wir aus dem Chaos ein Netz.",
            "Ich wusste, dass tausend alte Antennen irgendwann nützlich werden."
          ),
          actionLabel: "Signalmast ansehen"
        }
      },
      {
        kind: "starpoint",
        objective: "Bringt den Signalmast von Junction 12 wieder zum Hören.",
        point: junctionSignalStarPoint,
        x: 0.55,
        y: 0.54
      },
      {
        kind: "story",
        objective: "Sprecht mit dem Mechaniker, der Louis erkannt hat.",
        hotspotId: "mechanic",
        beat: {
          id: "junction-starformer",
          eyebrow: "Junction 12 · Brams Werkstatt",
          title: "Sternenformer",
          lines: allCrew(
            "Sternenformer. Das Wort fühlt sich an, als müsste ich es kennen.",
            "Bram meint nicht nur dein Harness. Er meint dich.",
            "Dann finden wir heraus, was ein Sternenformer wirklich ist.",
            "Und warum der neue Pfad auf der Karte zu gar nichts führt.",
            [
              {
                speaker: "Bram",
                text: "Das Zeichen kenne ich aus alten Reparaturbüchern. Begleiter wie ihn nannte man Sternenformer."
              }
            ]
          ),
          actionLabel: "Das fremde Signal öffnen",
          rewardStardust: 1
        }
      },
      {
        kind: "travel",
        objective: "Ein unkartierter Sternenpfad ist erschienen.",
        nextWorld: "empty-path"
      }
    ]
  },

  "empty-path": {
    id: "empty-path",
    chapter: "Kapitel 3",
    title: "Der leere Pfad",
    subtitle: "Unkartierter Raum · kein Ziel",
    theme: {
      sky: 0x050914,
      horizon: 0x0d1630,
      ground: 0x101827,
      accent: 0x79bfe9,
      glow: 0xd7e9ff,
      labelColor: "#b9ddff"
    },
    hotspots: [
      {
        id: "void",
        title: "Leerer Raum",
        text: "Der Pfad endet an einem Ort, der noch keine feste Form besitzt.",
        x: 0.52,
        y: 0.58
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Untersucht den Ort, an dem der Sternenpfad endet.",
        beat: {
          id: "empty-arrival",
          eyebrow: "Kapitel 3 · Der leere Pfad",
          title: "Hier fehlt nicht nur ein Teil",
          lines: allCrew(
            "Da ist etwas. Aber irgendwie ist dort noch nichts festgelegt.",
            "Keine Oberfläche. Keine Station. Nur ein stabiler Raumanker.",
            "Dann sollten wir hier auch nicht einfach eine ganze Welt hinbauen.",
            "Aber vielleicht eine kleine Probe. Nur um zu sehen, was möglich wäre."
          ),
          actionLabel: "Raumanker prüfen"
        }
      },
      {
        kind: "story",
        objective: "Sprecht am leeren Raumanker mit Louis.",
        hotspotId: "void",
        beat: {
          id: "empty-rules",
          eyebrow: "Unkartierter Pfad",
          title: "Eine Idee ist noch keine Welt",
          lines: allCrew(
            "Ich kann hier eine kleine Probe formen. Eine vollständige Welt wäre etwas anderes.",
            "Große Ideen gehören erst in dein Ideenbuch und müssen geprüft werden.",
            "Dann bleibt die Hauptgeschichte stabil, auch wenn wir verrückte Ideen haben.",
            "Und verrückte Ideen haben wir definitiv."
          ),
          actionLabel: "Erkundungsanker formen"
        }
      },
      {
        kind: "starpoint",
        objective: "Formt einen provisorischen Weltenanker. Große Ideen könnt ihr Louis jederzeit zusätzlich erzählen.",
        point: emptyAnchorStarPoint,
        x: 0.5,
        y: 0.58
      },
      {
        kind: "story",
        objective: "Untersucht, was der Weltenanker ausgelöst hat.",
        beat: {
          id: "empty-after",
          eyebrow: "Unkartierter Pfad",
          title: "Zu viele Möglichkeiten",
          lines: allCrew(
            "Der Anker ist stabil. Aber auf meiner Karte springen plötzlich alte Formungen durcheinander.",
            "Moss-Signaturen liegen über Cinder-Daten.",
            "Dann haben wir gerade nicht nur etwas Neues entdeckt. Wir haben ein altes Problem geweckt.",
            "Die Karte zeigt einen Knoten, an dem alles zusammenläuft."
          ),
          actionLabel: "Zum Störungsknoten"
        }
      },
      {
        kind: "travel",
        objective: "Folgt der Störung im Sternenpfad.",
        nextWorld: "distortion"
      }
    ]
  },

  distortion: {
    id: "distortion",
    chapter: "Kapitel 4",
    title: "Zu viele Möglichkeiten",
    subtitle: "Störungsknoten · vermischte Welten",
    theme: {
      sky: 0x261729,
      horizon: 0x334936,
      ground: 0x613b2f,
      accent: 0xf0c55c,
      glow: 0x9be4c2,
      labelColor: "#f2d58a"
    },
    hotspots: [
      {
        id: "overlap",
        title: "Überlagerung",
        text: "Cinder-Staub, Moss-Pflanzen und Junction-Technik beanspruchen denselben Raum.",
        x: 0.39,
        y: 0.6
      },
      {
        id: "routes",
        title: "Routenknoten",
        text: "Mehrere Sternenpfade liegen übereinander und flackern instabil.",
        x: 0.68,
        y: 0.57
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Findet heraus, warum die Welten ineinanderlaufen.",
        beat: {
          id: "distortion-arrival",
          eyebrow: "Kapitel 4 · Zu viele Möglichkeiten",
          title: "Louis kann zu viel",
          lines: allCrew(
            "Ich erkenne jede einzelne Formung. Das Problem bin nicht ihr. Das Problem ist, dass ich sie nicht sauber auseinanderhalte.",
            "Du weißt, wie man etwas baut. Aber nicht automatisch, wohin es gehört.",
            "Dann brauchen Ideen nicht nur Material. Sie brauchen Regeln.",
            "Eine Regel klingt weniger cool als ein Raketenantrieb. Aber gerade brauchen wir sie."
          ),
          actionLabel: "Überlagerung untersuchen"
        }
      },
      {
        kind: "starpoint",
        objective: "Gebt Louis eine Regel, die Welten voneinander trennt.",
        point: distortionBoundaryStarPoint,
        x: 0.39,
        y: 0.6
      },
      {
        kind: "story",
        objective: "Prüft den Routenknoten.",
        hotspotId: "routes",
        beat: {
          id: "distortion-routes",
          eyebrow: "Störungsknoten",
          title: "Auch Wege brauchen Regeln",
          lines: allCrew(
            "Die Welten sind getrennt, aber die Wege kämpfen noch um denselben Raum.",
            "Das ist genau das gleiche Problem, nur größer.",
            "Dann gilt dieselbe Idee: Erst wissen, was schon da ist. Dann verändern.",
            "Und vielleicht nicht zwölf Wege gleichzeitig anschalten."
          ),
          actionLabel: "Routen ordnen"
        }
      },
      {
        kind: "starpoint",
        objective: "Ordnet die überlagerten Sternenpfade.",
        point: distortionRouteStarPoint,
        x: 0.68,
        y: 0.57
      },
      {
        kind: "story",
        objective: "Seht euch die nun lesbare Karte an.",
        beat: {
          id: "distortion-map",
          eyebrow: "Kapitel 4 · Karte stabil",
          title: "Drei verlorene Welten",
          lines: allCrew(
            "Drei alte Knoten sind wieder sichtbar. Glasküste, Wolkenozean und Schrottring.",
            "Und alle drei zeigen Fragmente derselben alten Route.",
            "Dann sammeln wir sie zusammen.",
            "Bitte zuerst die Welt mit dem harmlosesten Namen. Wolkenozean klingt harmlos.",
            [{ speaker: "Louis", text: "Glasküste ist näher. Und Olli: Namen sind im All kein Sicherheitsversprechen." }]
          ),
          actionLabel: "Kurs Glasküste",
          rewardStardust: 2
        }
      },
      {
        kind: "travel",
        objective: "Die verlorenen Welten warten.",
        nextWorld: "glass-coast"
      }
    ]
  },

  "glass-coast": {
    id: "glass-coast",
    chapter: "Kapitel 5A",
    title: "Glasküste",
    subtitle: "Kristallmeer · erstes Wegfragment",
    theme: {
      sky: 0x153145,
      horizon: 0x256b76,
      ground: 0x457f88,
      accent: 0xa5f2ef,
      glow: 0xe2ffff,
      labelColor: "#c8ffff"
    },
    hotspots: [
      {
        id: "fragment",
        title: "Wegfragment",
        text: "Auf einer abgetrennten Kristallinsel leuchtet ein alter Navigationssplitter.",
        x: 0.72,
        y: 0.58
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Erreicht das alte Wegfragment an der Glasküste.",
        beat: {
          id: "glass-arrival",
          eyebrow: "Kapitel 5 · Glasküste",
          title: "Ein Meer aus klingendem Glas",
          lines: allCrew(
            "Die Kristalle schwingen mit dem Sternenwind. Bitte nichts unnötig zerbrechen.",
            "Der Kartenanker liegt auf der anderen Seite der Bruchzone.",
            "Die Platten bewegen sich gegeneinander. Eine starre Brücke würde reißen.",
            "Also bauen wir etwas, das mitwackelt. Ich kann mitwackeln."
          ),
          actionLabel: "Bruchzone ansehen"
        }
      },
      {
        kind: "starpoint",
        objective: "Baut einen flexiblen Übergang über die Glasküste.",
        point: glassCoastStarPoint,
        x: 0.54,
        y: 0.61
      },
      {
        kind: "story",
        objective: "Nehmt das erste Wegfragment auf.",
        hotspotId: "fragment",
        beat: {
          id: "glass-fragment",
          eyebrow: "Glasküste · Kartenanker",
          title: "Fragment eins",
          lines: allCrew(
            "Das Fragment nennt einen zweiten Anker im Wolkenozean.",
            "Zwei Teile derselben Route.",
            "Dann führt uns die Spur wirklich irgendwohin.",
            "Zum Wolkenozean. Ich bleibe bei meiner Theorie: harmloser Name."
          ),
          actionLabel: "Zum Wolkenozean",
          rewardStardust: 1
        }
      },
      {
        kind: "travel",
        objective: "Kurs Wolkenozean.",
        nextWorld: "cloud-ocean"
      }
    ]
  },

  "cloud-ocean": {
    id: "cloud-ocean",
    chapter: "Kapitel 5B",
    title: "Wolkenozean",
    subtitle: "Sturmwelt · zweites Wegfragment",
    theme: {
      sky: 0x302c55,
      horizon: 0x665f91,
      ground: 0x807fa8,
      accent: 0xf0d6ff,
      glow: 0xffffff,
      labelColor: "#efe2ff"
    },
    hotspots: [
      {
        id: "anchor",
        title: "Sturmanker",
        text: "Der zweite Kartenanker liegt mitten in einer dauerhaften Windströmung.",
        x: 0.7,
        y: 0.55
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Findet den Kartenanker im Wolkensturm.",
        beat: {
          id: "cloud-arrival",
          eyebrow: "Kapitel 5 · Wolkenozean",
          title: "Nicht gegen den Sturm",
          lines: allCrew(
            "Der Wind ist zu stark für direkten Schub. Wir würden nur Energie verbrennen.",
            "Dann nutzen wir die Strömung.",
            "Wie beim Segeln. Nur ohne Meer.",
            "Es heißt Wolkenozean. Ich finde, das zählt."
          ),
          actionLabel: "Sturmströmung lesen"
        }
      },
      {
        kind: "starpoint",
        objective: "Nutzt den Sturm, statt gegen ihn anzukämpfen.",
        point: cloudOceanStarPoint,
        x: 0.52,
        y: 0.6
      },
      {
        kind: "story",
        objective: "Lest den zweiten Kartenanker.",
        hotspotId: "anchor",
        beat: {
          id: "cloud-fragment",
          eyebrow: "Wolkenozean · Kartenanker",
          title: "Der Schrottring",
          lines: allCrew(
            "Beide Fragmente zeigen denselben letzten Zwischenstopp: Schrottring.",
            "Dort liegt ein altes Schiffssignal.",
            "Mit demselben Symbol wie auf Louis' Harness.",
            "Okay. Jetzt wird es wirklich interessant."
          ),
          actionLabel: "Zum Schrottring",
          rewardStardust: 1
        }
      },
      {
        kind: "travel",
        objective: "Folgt dem alten Schiffssignal.",
        nextWorld: "scrap-ring"
      }
    ]
  },

  "scrap-ring": {
    id: "scrap-ring",
    chapter: "Kapitel 5C",
    title: "Schrottring",
    subtitle: "Wrackfeld · Sternenformer-Archiv",
    theme: {
      sky: 0x101318,
      horizon: 0x2a3033,
      ground: 0x4a4039,
      accent: 0xd49a52,
      glow: 0x9ccfd1,
      labelColor: "#e5bc83"
    },
    hotspots: [
      {
        id: "wreck",
        title: "Altes Sternenformer-Schiff",
        text: "Das Wrack trägt dasselbe Symbol wie Louis' Harness.",
        x: 0.57,
        y: 0.58
      },
      {
        id: "archive",
        title: "Versiegeltes Archiv",
        text: "Ein abgeschotteter Datenspeicher sitzt tief im Wrack.",
        x: 0.68,
        y: 0.64
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Untersucht das Wrack mit Louis.",
        beat: {
          id: "scrap-arrival",
          eyebrow: "Kapitel 5 · Schrottring",
          title: "Das gleiche Zeichen",
          lines: allCrew(
            "Ich kenne dieses Schiff. Nicht bewusst. Eher wie einen Geruch, den man lange nicht mehr hatte.",
            "Das Symbol ist exakt deins.",
            "Dann liegt hier vielleicht endlich deine Geschichte.",
            "Oder wenigstens das Benutzerhandbuch."
          ),
          actionLabel: "Wrack betreten"
        }
      },
      {
        kind: "story",
        objective: "Findet das versiegelte Archiv.",
        hotspotId: "wreck",
        beat: {
          id: "scrap-archive",
          eyebrow: "Schrottring · Wrack",
          title: "Nur das Archiv darf Strom bekommen",
          lines: allCrew(
            "Das Hauptnetz ist verbrannt. Wenn wir es komplett einschalten, verlieren wir die Speicher.",
            "Dann isolieren wir nur das Archiv.",
            "Keine große Wiederbelebung. Nur genug Energie zum Lesen.",
            "Sehr vernünftig. Fast verdächtig vernünftig."
          ),
          actionLabel: "Archiv versorgen"
        }
      },
      {
        kind: "starpoint",
        objective: "Versorgt nur das Sternenformer-Archiv sicher mit Energie.",
        point: scrapArchiveStarPoint,
        x: 0.68,
        y: 0.64
      },
      {
        kind: "story",
        objective: "Hört euch die Sternenformer-Aufzeichnung an.",
        hotspotId: "archive",
        beat: {
          id: "scrap-reveal",
          eyebrow: "Schrottring · Archiv",
          title: "STERNENFORMER 07",
          lines: allCrew(
            "Sternenformer 07. Das bin ich.",
            "Und die Sternenformer haben früher mit Reisenden neue Regionen aufgebaut.",
            "Bis das Netz zu viele widersprüchliche Formungen gleichzeitig umgesetzt hat.",
            "Darum wurde das Herz der Wege abgeschaltet.",
            [
              {
                speaker: "Archiv",
                text: "STERNENFORMER 07. Letzter bestätigter Begleiter. Zentrale Formungsinstanz: HERZ DER WEGE."
              }
            ]
          ),
          actionLabel: "Koordinaten des Herzens laden",
          rewardStardust: 1
        }
      },
      {
        kind: "travel",
        objective: "Das Herz der Wege ist erreichbar.",
        nextWorld: "heart-of-ways"
      }
    ]
  },

  "heart-of-ways": {
    id: "heart-of-ways",
    chapter: "Kapitel 6",
    title: "Das Herz der Wege",
    subtitle: "Zentrale Sternenstation · Finale",
    theme: {
      sky: 0x070d15,
      horizon: 0x102733,
      ground: 0x18252c,
      accent: 0xd9ad5c,
      glow: 0x78d9d4,
      labelColor: "#f0ca7b"
    },
    hotspots: [
      {
        id: "core",
        title: "Zentralkern",
        text: "Ein riesiger ruhender Kartentisch verbindet alle Sternenpfade.",
        x: 0.52,
        y: 0.57
      }
    ],
    steps: [
      {
        kind: "story",
        objective: "Betretet gemeinsam das Herz der Wege.",
        beat: {
          id: "heart-arrival",
          eyebrow: "Kapitel 6 · Das Herz der Wege",
          title: "Die Galaxie wartet",
          lines: allCrew(
            "Verbindung erkannt. Das Herz spricht direkt mit meinem Harness.",
            "Dann reparieren wir nicht einfach alles auf einmal.",
            "Wir machen genau das, was wir gelernt haben: verstehen, ordnen, schützen.",
            "Und danach dürfen wir hoffentlich wieder etwas bauen."
          ),
          actionLabel: "Zentralkern öffnen"
        }
      },
      {
        kind: "starpoint",
        objective: "Trennt stabile und beschädigte Sternenpfade.",
        point: heartRoutesStarPoint,
        x: 0.38,
        y: 0.59
      },
      {
        kind: "story",
        objective: "Prüft die Energieverteilung des Herzens.",
        hotspotId: "core",
        beat: {
          id: "heart-energy",
          eyebrow: "Herz der Wege · Energie",
          title: "Nicht alles gleichzeitig",
          lines: allCrew(
            "Die Routen sind getrennt. Jetzt fehlt eine faire Energieverteilung.",
            "Die Außenposten dürfen nicht wieder die ersten sein, die ausfallen.",
            "Und Reserven brauchen wir für Rettungen und Reparaturen.",
            "Also bekommt niemand alles. Aber niemand bekommt nichts."
          ),
          actionLabel: "Energie neu verteilen"
        }
      },
      {
        kind: "starpoint",
        objective: "Gebt dem Netz eine faire Energieordnung.",
        point: heartEnergyStarPoint,
        x: 0.52,
        y: 0.57
      },
      {
        kind: "story",
        objective: "Beantwortet die letzte Frage des Herzens.",
        beat: {
          id: "heart-question",
          eyebrow: "Herz der Wege · Letzte Frage",
          title: "Was soll diese Galaxie sein?",
          lines: allCrew(
            "Das Herz fragt nicht nach Technik. Es fragt nach unserer Regel für neue Ideen.",
            "Dann muss die Regel schützen, was schon da ist.",
            "Aber sie darf neue Ideen nicht einfach verbieten.",
            "Und ein bisschen Platz sollte leer bleiben. Sonst gibt es nichts mehr zu entdecken.",
            [
              {
                speaker: "Herz",
                text: "DEFINIERE LEITLINIE FÜR ZUKÜNFTIGE FORMUNGEN."
              }
            ]
          ),
          actionLabel: "Letzte Regel festlegen"
        }
      },
      {
        kind: "starpoint",
        objective: "Legt die letzte Sternenformer-Regel fest.",
        point: heartRulesStarPoint,
        x: 0.66,
        y: 0.59
      },
      {
        kind: "story",
        objective: "Aktiviert das Herz der Wege gemeinsam.",
        beat: {
          id: "heart-ready",
          eyebrow: "Herz der Wege · Bereit",
          title: "Kein perfektes Netz",
          lines: allCrew(
            "Alle Systeme stabil. Aber die Karte bleibt an einigen Stellen bewusst leer.",
            "Gut. Dann entscheidet nicht das System allein, wie die Galaxie aussehen soll.",
            "Und wir können weiter entdecken, ohne alles sofort zu füllen.",
            "Dann drücken wir jetzt endlich den großen Knopf."
          ),
          actionLabel: "Herz der Wege starten"
        }
      },
      {
        kind: "travel",
        objective: "Das Herz ist bereit. Aktiviert das neue Sternenpfad-Netz.",
        ending: true
      }
    ]
  }
};

export const adventureWorldOrder: readonly AdventureWorldId[] = [
  "moss",
  "junction-12",
  "empty-path",
  "distortion",
  "glass-coast",
  "cloud-ocean",
  "scrap-ring",
  "heart-of-ways"
];

export const adventureSpeakerColor: Record<AdventureSpeaker, string> = {
  Philipp: "#54a5c5",
  Charly: "#d66f8f",
  Olli: "#d49a52",
  Louis: "#d2a35f",
  "Dr. Niva": "#78c79b",
  "M-4": "#9ccfd1",
  Bram: "#c4906b",
  Archiv: "#9bb7c9",
  Herz: "#e3bf68"
};
