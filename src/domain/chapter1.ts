export type Chapter1Action =
  | "intro-seen"
  | "energy-cell-installed"
  | "cooling-repaired"
  | "navigation-restored"
  | "ship-tested"
  | "launched";

export type CrewSpeaker = "Philipp" | "Charly" | "Olli" | "Louis";

export type StoryLine = {
  speaker: CrewSpeaker;
  text: string;
};

export type Chapter1StoryBeatId =
  | "intro"
  | "energy-cell"
  | "cooling"
  | "navigation"
  | "ship-test"
  | "launch";

export type Chapter1StoryBeat = {
  id: Chapter1StoryBeatId;
  eyebrow: string;
  title: string;
  lines: readonly StoryLine[];
  action?: Chapter1Action;
  actionLabel: string;
};

export const chapter1StoryBeats: Record<Chapter1StoryBeatId, Chapter1StoryBeat> = {
  intro: {
    id: "intro",
    eyebrow: "Kapitel 1 · Hangar 3",
    title: "Ein ziemlich stiller Hangar",
    lines: [
      { speaker: "Louis", text: "Ich weiß nicht warum, aber dieser Ort fühlt sich vertraut an." },
      { speaker: "Philipp", text: "Dann finden wir zuerst heraus, was hier noch funktioniert." },
      { speaker: "Charly", text: "Und was nicht funktioniert, bauen wir eben wieder." },
      { speaker: "Olli", text: "Oder besser." },
      { speaker: "Louis", text: "Bleibt zusammen. Mein Harness zeigt irgendwas an." }
    ],
    action: "intro-seen",
    actionLabel: "Hangar erkunden"
  },
  "energy-cell": {
    id: "energy-cell",
    eyebrow: "Crew · Ersatzteilregal",
    title: "Die Energiezelle",
    lines: [
      { speaker: "Philipp", text: "Die Werkbank hat wieder Strom." },
      { speaker: "Charly", text: "Dann brauchen wir etwas, das das Schiff überhaupt wach bekommt." },
      { speaker: "Olli", text: "Da hinten blinkt was." },
      { speaker: "Louis", text: "Energiezelle. Schwer, aber brauchbar. Die nehmen wir." }
    ],
    action: "energy-cell-installed",
    actionLabel: "Energiezelle einsetzen"
  },
  cooling: {
    id: "cooling",
    eyebrow: "Crew · Wartungsbereich",
    title: "Die gerissene Kühlleitung",
    lines: [
      { speaker: "Charly", text: "Wenn wir damit starten, kocht uns der Antrieb weg." },
      { speaker: "Philipp", text: "Die Kühlleitung ist gerissen." },
      { speaker: "Olli", text: "Kann Louis nicht einfach eine neue machen?" },
      { speaker: "Louis", text: "Nicht nötig. Das hier können wir selbst reparieren. Reicht mir die Klemme." }
    ],
    action: "cooling-repaired",
    actionLabel: "Kühlleitung reparieren"
  },
  navigation: {
    id: "navigation",
    eyebrow: "Crew · Cockpit",
    title: "Nur ein schwacher Weg",
    lines: [
      { speaker: "Olli", text: "Das Ding zeigt drei Punkte und einen Fleck." },
      { speaker: "Philipp", text: "Die Navigation ist fast komplett tot." },
      { speaker: "Charly", text: "Fast reicht. Wir brauchen nur einen sicheren Kurs." },
      { speaker: "Louis", text: "Ich sehe eine Route. Cinder. Sehr schwach." }
    ],
    action: "navigation-restored",
    actionLabel: "Navigation reaktivieren"
  },
  "ship-test": {
    id: "ship-test",
    eyebrow: "Crew · Systemtest",
    title: "Das Schiff wacht auf",
    lines: [
      { speaker: "Philipp", text: "Energie stabil." },
      { speaker: "Charly", text: "Kühlung?" },
      { speaker: "Olli", text: "Grün! Alles grün!" },
      { speaker: "Louis", text: "Navigation reagiert. Das Schiff will los. Nur das Hangartor hält uns noch auf." }
    ],
    action: "ship-tested",
    actionLabel: "Systemtest abschließen"
  },
  launch: {
    id: "launch",
    eyebrow: "Crew · Erster Start",
    title: "Der erste Weg",
    lines: [
      { speaker: "Charly", text: "Alle drin?" },
      { speaker: "Philipp", text: "Systeme laufen." },
      { speaker: "Olli", text: "Louis?" },
      { speaker: "Louis", text: "Ich komme. Kurs Cinder." }
    ],
    action: "launched",
    actionLabel: "Starten"
  }
};

export const crewSpeakerColor: Record<CrewSpeaker, string> = {
  Philipp: "#54a5c5",
  Charly: "#d66f8f",
  Olli: "#d49a52",
  Louis: "#d2a35f"
};
