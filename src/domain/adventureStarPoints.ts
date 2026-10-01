import type { StarPointDefinition } from "./starPoints";

export const mossPathStarPoint: StarPointDefinition = {
  id: "moss-swamp-path",
  locationId: "moss",
  title: "Ein Weg durch den Leuchtsumpf",
  context:
    "Der alte Forschungsweg endet im Sumpf. Der Boden trägt nicht, aber überall wachsen kräftige Ranken und Schwimmpflanzen.",
  louisPrompt:
    "Wir brauchen einen sicheren Weg, ohne den Sumpf plattzumachen. Was bauen wir hier?",
  customPrompt:
    "Erzähl mir, wie wir durch den Sumpf kommen und dabei die Pflanzenwelt schützen.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "root-bridge",
      title: "Wurzelbrücke",
      description: "Lebende Ranken werden nur geführt und bilden einen federnden Weg."
    },
    {
      id: "floating-pads",
      title: "Schwimmende Trittinseln",
      description: "Leichte Plattformen verteilen das Gewicht auf dem Wasser."
    },
    {
      id: "cable-walk",
      title: "Seilpfad",
      description: "Ein gespannter Laufsteg hängt über empfindlichen Pflanzen."
    }
  ],
  stardustCost: 0,
  resultTitle: "Der Sumpf ist passierbar",
  resultSummary:
    "Ein sicherer Pfad führt tiefer nach Moss, ohne die leuchtende Pflanzenwelt zu zerstören."
};

export const mossRobotStarPoint: StarPointDefinition = {
  id: "moss-robot-recovery",
  locationId: "moss",
  title: "Der versunkene Forschungsroboter",
  context:
    "Der kleine Forschungsroboter M-4 hängt tief zwischen leuchtenden Wurzeln. Ziehen allein würde ihn beschädigen.",
  louisPrompt:
    "Wir müssen M-4 anheben, ohne die Wurzeln zu zerreißen. Welche Bergung bauen wir?",
  customPrompt:
    "Erzähl mir, wie wir den Roboter vorsichtig aus den Wurzeln bekommen.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "soft-crane",
      title: "Weicher Rankenkran",
      description: "Breite Gurte und eine leichte Winde heben M-4 langsam heraus."
    },
    {
      id: "air-cushions",
      title: "Luftkissen",
      description: "Kleine Kissen schieben sich unter den Roboter und heben ihn an."
    },
    {
      id: "magnetic-boom",
      title: "Magnetarm",
      description: "Ein langer Arm zieht nur am Metallrahmen und hält Abstand zu den Wurzeln."
    }
  ],
  stardustCost: 1,
  resultTitle: "M-4 ist frei",
  resultSummary:
    "Der Forschungsroboter steht wieder auf festem Boden. In seinem Gehäuse steckt ein intaktes Scanner-Modul."
};

export const junctionSignalStarPoint: StarPointDefinition = {
  id: "junction-signal-mast",
  locationId: "junction-12",
  title: "Der stumme Signalmast",
  context:
    "Junction 12 empfängt den nächsten Sternenpfad nur als Rauschen. Der alte Mast ist voller improvisierter Ersatzteile.",
  louisPrompt:
    "Der Mast braucht kein neues Herz, nur eine bessere Stimme. Wie bringen wir das Signal zurück?",
  customPrompt:
    "Erzähl mir, wie wir aus den vorhandenen Teilen wieder ein klares Signal bekommen.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "dish-array",
      title: "Antennenfächer",
      description: "Mehrere kleine Schüsseln werden zu einem gemeinsamen Empfänger gekoppelt."
    },
    {
      id: "relay-kites",
      title: "Relais-Drachen",
      description: "Leichte Funkmodule schweben oberhalb der Station und umgehen Störungen."
    },
    {
      id: "market-relay",
      title: "Markt-Relais",
      description: "Viele kleine Händlerantennen werden für einen Moment zu einem großen Netz."
    }
  ],
  stardustCost: 0,
  resultTitle: "Das Rauschen wird zu einem Pfad",
  resultSummary:
    "Junction 12 empfängt wieder ein fremdes, unvollständiges Routensignal."
};

export const emptyAnchorStarPoint: StarPointDefinition = {
  id: "empty-path-anchor",
  locationId: "empty-path",
  title: "Ein Anker im leeren Pfad",
  context:
    "Hier gibt es noch keine feste Welt. Louis darf nur einen provisorischen Erkundungsanker formen. Große neue Welten gehören weiterhin ins Ideenbuch.",
  louisPrompt:
    "Was soll unser Erkundungsanker zeigen, damit wir diesen leeren Raum untersuchen können?",
  customPrompt:
    "Beschreibe eine Landschaftsidee. Ich forme nur eine kleine, vorläufige Probe davon – nicht gleich eine ganze neue Welt.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "ice-resonance",
      title: "Singendes Eis",
      description: "Ein kleiner Eisgrat reagiert mit Tönen auf den Sternenwind."
    },
    {
      id: "cloud-island",
      title: "Wolkeninsel",
      description: "Eine schwebende Felsprobe liegt zwischen dichten leuchtenden Wolken."
    },
    {
      id: "giant-tree",
      title: "Riesenbaum-Probe",
      description: "Ein einzelner gewaltiger Stamm zeigt, wie eine Baumwelt wirken könnte."
    }
  ],
  stardustCost: 1,
  resultTitle: "Provisorischer Weltenanker stabil",
  resultSummary:
    "Eine kleine, sichere Probe der Idee ist sichtbar. Eine vollständige neue Welt bleibt eine große Idee für Louis' Ideenbuch."
};

export const distortionBoundaryStarPoint: StarPointDefinition = {
  id: "distortion-boundaries",
  locationId: "distortion",
  title: "Vermischte Welten trennen",
  context:
    "Pflanzen von Moss, Cinder-Staub und Junction-Technik liegen im selben Raum. Louis' frühere Formungen überlagern sich.",
  louisPrompt:
    "Wir müssen festlegen, was zu welchem Ort gehört. Welche Grenze bauen wir zuerst?",
  customPrompt:
    "Erzähl mir eine Regel oder Markierung, mit der Louis erkennt, was zu einer Welt gehört.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "world-signatures",
      title: "Welten-Signaturen",
      description: "Jede Welt bekommt ein eindeutiges Muster, das Louis vor einer Formung prüft."
    },
    {
      id: "anchor-beacons",
      title: "Ankerbaken",
      description: "Jeder Ort sendet eine Kennung, die fremde Formungen zurückweist."
    },
    {
      id: "memory-map",
      title: "Erinnerungskarte",
      description: "Louis vergleicht jede neue Idee zuerst mit dem bestehenden Zustand."
    }
  ],
  stardustCost: 1,
  resultTitle: "Die Welten lösen sich voneinander",
  resultSummary:
    "Moss, Cinder und Junction 12 erhalten wieder klare Grenzen. Louis speichert die erste echte Weltregel."
};

export const distortionRouteStarPoint: StarPointDefinition = {
  id: "distortion-route-separation",
  locationId: "distortion",
  title: "Überlagerte Sternenpfade",
  context:
    "Mehrere Routen versuchen denselben Raum zu benutzen. Eine davon muss priorisiert und die anderen sicher geparkt werden.",
  louisPrompt:
    "Welche Ordnung geben wir den Wegen, damit keiner den anderen überschreibt?",
  customPrompt:
    "Erzähl mir eine einfache Regel dafür, wie mehrere Sternenpfade denselben Raum teilen sollen.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "one-active",
      title: "Ein aktiver Weg",
      description: "Nur die aktuell benutzte Route ist vollständig aktiv; andere warten stabil daneben."
    },
    {
      id: "layered-routes",
      title: "Wegeschichten",
      description: "Routen werden in getrennten Ebenen geführt und nur an Knoten verbunden."
    },
    {
      id: "priority-gates",
      title: "Prioritätstore",
      description: "Jeder Übergang prüft zuerst, welche Route gerade Vorfahrt hat."
    }
  ],
  stardustCost: 1,
  resultTitle: "Die Wege sind wieder lesbar",
  resultSummary:
    "Die Sternenpfade überlagern sich nicht mehr. Ein ferner Verbund aus drei verlorenen Welten wird sichtbar."
};

export const glassCoastStarPoint: StarPointDefinition = {
  id: "glass-coast-bridge",
  locationId: "glass-coast",
  title: "Die gebrochene Glasküste",
  context:
    "Kristallplatten treiben auseinander. Das benötigte Wegfragment liegt auf einer Insel jenseits der Bruchzone.",
  louisPrompt:
    "Wir brauchen einen Übergang, der mit den schwingenden Kristallen mitgeht. Was bauen wir?",
  customPrompt:
    "Erzähl mir einen sicheren Übergang über die bewegliche Glasküste.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "flex-bridge",
      title: "Federbrücke",
      description: "Gelenke zwischen den Segmenten bewegen sich mit dem Kristallboden."
    },
    {
      id: "light-rails",
      title: "Lichtschienen",
      description: "Energie verbindet vorhandene Kristallkanten zu einem schmalen Weg."
    },
    {
      id: "hover-sled",
      title: "Gleitschlitten",
      description: "Ein kleiner Schlitten schwebt knapp über der Bruchzone."
    }
  ],
  stardustCost: 0,
  resultTitle: "Die Glasküste ist überquerbar",
  resultSummary:
    "Die Crew erreicht das erste Fragment der alten Wegkarte."
};

export const cloudOceanStarPoint: StarPointDefinition = {
  id: "cloud-ocean-storm-sail",
  locationId: "cloud-ocean",
  title: "Durch den Wolkensturm",
  context:
    "Ein permanenter Sturm blockiert den zweiten Kartenanker. Gewalt gegen den Sturm wäre sinnlos – die Crew muss seine Strömung nutzen.",
  louisPrompt:
    "Wie lassen wir uns vom Sturm tragen, statt gegen ihn anzukämpfen?",
  customPrompt:
    "Erzähl mir ein Fahrzeug oder Werkzeug, das die Windströmung des Wolkenozeans nutzt.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "storm-sail",
      title: "Sturmsegel",
      description: "Große flexible Segel ziehen eine kleine Plattform durch die Strömung."
    },
    {
      id: "pressure-glider",
      title: "Druckgleiter",
      description: "Flügel verändern ihre Form automatisch mit dem Winddruck."
    },
    {
      id: "balloon-chain",
      title: "Ballonkette",
      description: "Mehrere kleine Auftriebskörper stabilisieren einen Weg durch die Wolken."
    }
  ],
  stardustCost: 1,
  resultTitle: "Der Sturm trägt die Crew",
  resultSummary:
    "Der zweite Kartenanker wird erreicht. Dahinter erscheint der Schrottring."
};

export const scrapArchiveStarPoint: StarPointDefinition = {
  id: "scrap-ring-archive",
  locationId: "scrap-ring",
  title: "Das versiegelte Archiv",
  context:
    "Im Wrack liegt ein Sternenformer-Archiv. Die Energieversorgung ist zerstört, aber die Speichermodule sind noch intakt.",
  louisPrompt:
    "Wir dürfen die Daten nicht beschädigen. Wie geben wir nur dem Archiv genug Energie?",
  customPrompt:
    "Erzähl mir eine sichere Stromversorgung nur für das alte Archiv.",
  tier: "B",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "pulse-cell",
      title: "Impulszelle",
      description: "Kurze, schwache Energiepulse starten nur die benötigten Speichermodule."
    },
    {
      id: "isolated-bus",
      title: "Isolierter Energiebus",
      description: "Eine neue kleine Leitung umgeht das beschädigte Wracknetz."
    },
    {
      id: "ship-tether",
      title: "Schiffskabel",
      description: "Das eigene Schiff speist das Archiv über einen begrenzten Wartungsanschluss."
    }
  ],
  stardustCost: 0,
  resultTitle: "Archiv geöffnet",
  resultSummary:
    "Die Aufzeichnungen identifizieren Louis als STERNENFORMER 07 und nennen das Herz der Wege."
};

export const heartRoutesStarPoint: StarPointDefinition = {
  id: "heart-route-isolation",
  locationId: "heart-of-ways",
  title: "Die instabilen Routen",
  context:
    "Das Herz versucht gleichzeitig zu viele beschädigte Sternenpfade zu aktivieren. Sie müssen getrennt und einzeln stabilisiert werden.",
  louisPrompt:
    "Welche Ordnung geben wir den Wegen, bevor wir das Herz wieder starten?",
  customPrompt:
    "Erzähl mir eine Regel, mit der beschädigte und stabile Wege sicher getrennt bleiben.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "safe-first",
      title: "Sichere Wege zuerst",
      description: "Stabile Routen öffnen zuerst; beschädigte bleiben bis zur Reparatur geschlossen."
    },
    {
      id: "sector-gates",
      title: "Sektor-Tore",
      description: "Jede Region wird einzeln zugeschaltet und geprüft."
    },
    {
      id: "return-path",
      title: "Rückweg-Regel",
      description: "Kein neuer Weg öffnet, wenn kein sicherer Rückweg existiert."
    }
  ],
  stardustCost: 1,
  resultTitle: "Die Routen sind getrennt",
  resultSummary:
    "Das Herz kann wieder einzelne Wege lesen, ohne das gesamte Netz gleichzeitig zu überlasten."
};

export const heartEnergyStarPoint: StarPointDefinition = {
  id: "heart-energy-balance",
  locationId: "heart-of-ways",
  title: "Energie für die Galaxie",
  context:
    "Das Netz besitzt genug Energie, aber nicht genug für alles gleichzeitig. Die Verteilung muss dynamisch werden.",
  louisPrompt:
    "Wie verteilen wir Energie, damit kleine Außenposten nicht wieder abgeschnitten werden?",
  customPrompt:
    "Erzähl mir eine faire Regel dafür, wie das Herz seine Energie verteilt.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "minimum-for-all",
      title: "Grundversorgung für alle",
      description: "Jede verbundene Welt erhält zuerst genug Energie für einen stabilen Grundpfad."
    },
    {
      id: "need-based",
      title: "Nach Bedarf",
      description: "Rettung, Versorgung und Reparatur erhalten zeitweise mehr Energie."
    },
    {
      id: "rotating-reserve",
      title: "Wandernde Reserve",
      description: "Ein Teil der Energie bleibt frei und wandert dorthin, wo gerade Engpässe entstehen."
    }
  ],
  stardustCost: 1,
  resultTitle: "Das Netz atmet wieder",
  resultSummary:
    "Energie fließt kontrolliert durch die Sternenpfade. Nur die letzte Weltregel fehlt."
};

export const heartRulesStarPoint: StarPointDefinition = {
  id: "heart-world-rules",
  locationId: "heart-of-ways",
  title: "Was soll diese Galaxie sein?",
  context:
    "Das Herz braucht eine letzte Leitlinie für neue Formungen. Sie darf bestehende Welten schützen und neue Ideen trotzdem erlauben.",
  louisPrompt:
    "Das ist keine technische Reparatur. Welche Regel soll ich niemals vergessen?",
  customPrompt:
    "Sag mir in deinen Worten, was bei neuen Ideen immer geschützt oder beachtet werden soll.",
  tier: "C",
  customIdeaAllowed: true,
  preparedOptions: [
    {
      id: "protect-before-change",
      title: "Erst schützen, dann verändern",
      description: "Louis prüft zuerst, was bereits da ist und erhalten bleiben muss."
    },
    {
      id: "ask-before-big-change",
      title: "Bei großen Änderungen nachfragen",
      description: "Große Formungen brauchen immer eine bewusste Bestätigung und einen klaren Ort."
    },
    {
      id: "room-for-new",
      title: "Platz für Neues lassen",
      description: "Nicht jeder freie Ort wird sofort gefüllt. Manche Punkte dürfen offen bleiben."
    }
  ],
  stardustCost: 1,
  resultTitle: "Die neue Sternenformer-Regel ist gesetzt",
  resultSummary:
    "Das Herz akzeptiert die Regel. Louis kann erschaffen, ohne bestehende Welten blind zu überschreiben."
};

export const adventureStarPoints: readonly StarPointDefinition[] = [
  mossPathStarPoint,
  mossRobotStarPoint,
  junctionSignalStarPoint,
  emptyAnchorStarPoint,
  distortionBoundaryStarPoint,
  distortionRouteStarPoint,
  glassCoastStarPoint,
  cloudOceanStarPoint,
  scrapArchiveStarPoint,
  heartRoutesStarPoint,
  heartEnergyStarPoint,
  heartRulesStarPoint
];
