import type { CrewSpeaker } from "./chapter1";

export type CinderAction =
  | "landing-seen"
  | "problem-known"
  | "intake-inspected"
  | "stardust-collected"
  | "water-celebrated"
  | "drive-upgraded"
  | "cinder-complete";

export type CinderSpeaker = CrewSpeaker | "Rika";

export type CinderStoryLine = {
  speaker: CinderSpeaker;
  text: string;
};

export type CinderStoryBeatId =
  | "landing"
  | "settlement"
  | "inspect-intake"
  | "stardust"
  | "water-restored"
  | "drive-upgrade";

export type CinderStoryBeat = {
  id: CinderStoryBeatId;
  eyebrow: string;
  title: string;
  lines: readonly CinderStoryLine[];
  action?: CinderAction;
  actionLabel: string;
};

export const cinderStoryBeats: Record<CinderStoryBeatId, CinderStoryBeat> = {
  landing: {
    id: "landing",
    eyebrow: "Kapitel 2 · Cinder",
    title: "Roter Staub und viel zu viel Himmel",
    lines: [
      { speaker: "Charly", text: "Also das ist Cinder. Sieht aus, als hätte jemand einen ganzen Planeten in Rost getaucht." },
      { speaker: "Philipp", text: "Und ziemlich heiß. Die Kühlsysteme vom Schiff arbeiten schon." },
      { speaker: "Olli", text: "Da hinten drehen sich Windräder. Zumindest manche." },
      { speaker: "Louis", text: "Ich empfange ein schwaches Signal aus der Siedlung. Bleiben wir zusammen." }
    ],
    action: "landing-seen",
    actionLabel: "Staubhafen suchen"
  },
  settlement: {
    id: "settlement",
    eyebrow: "Cinder · Staubhafen",
    title: "Kein Wasser mehr",
    lines: [
      { speaker: "Rika", text: "Ihr seid wirklich durch den Sternenpfad gekommen? Dann funktioniert da draußen wenigstens noch irgendetwas." },
      { speaker: "Philipp", text: "Was ist hier passiert?" },
      { speaker: "Rika", text: "Unsere alten Kondensatoren liefern fast nichts mehr. Die Tanks reichen vielleicht noch ein paar Tage." },
      { speaker: "Charly", text: "Dann zeigen Sie uns die Anlage." },
      { speaker: "Olli", text: "Louis leuchtet schon wieder." },
      { speaker: "Louis", text: "Noch nicht. Erst müssen wir verstehen, was fehlt." }
    ],
    action: "problem-known",
    actionLabel: "Kondensatoren untersuchen"
  },
  "inspect-intake": {
    id: "inspect-intake",
    eyebrow: "Cinder · Alte Kondensatorfelder",
    title: "Die Luft ist nicht leer",
    lines: [
      { speaker: "Rika", text: "Die Anlage läuft, aber fast ohne Ertrag. Wir haben schon Lüfter und Pumpen getauscht. Nichts hat geholfen." },
      { speaker: "Philipp", text: "Dann sollten wir nicht weiter raten. Ich will die Temperaturen an verschiedenen Stellen sehen." },
      { speaker: "Charly", text: "Und vergleichen, was die Anlage tatsächlich macht – nicht, was sie machen sollte." },
      { speaker: "Olli", text: "Also erst messen, dann schrauben. Langweilig vernünftig." },
      { speaker: "Louis", text: "Mein Harness reagiert hier ganz schwach. Finden wir zuerst heraus, warum." }
    ],
    action: "intake-inspected",
    actionLabel: "Anlage untersuchen"
  },
  stardust: {
    id: "stardust",
    eyebrow: "Cinder · Kondensatorfeld",
    title: "Etwas im roten Staub",
    lines: [
      { speaker: "Olli", text: "Da glitzert etwas unter der neuen Leitung." },
      { speaker: "Charly", text: "Das war vorher nicht da." },
      { speaker: "Philipp", text: "Es reagiert auf Louis' Harness." },
      { speaker: "Louis", text: "Ich kenne das Gefühl. Aber nicht den Namen. Ich glaube, ich kann damit größere Dinge formen." }
    ],
    action: "stardust-collected",
    actionLabel: "Sternenstaub aufnehmen"
  },
  "water-restored": {
    id: "water-restored",
    eyebrow: "Cinder · Staubhafen",
    title: "Wasser!",
    lines: [
      { speaker: "Rika", text: "Es läuft. Ihr habt tatsächlich Wasser bis hierher gebracht." },
      { speaker: "Olli", text: "Und Louis hat dabei geleuchtet wie ein kleiner Satellit." },
      { speaker: "Louis", text: "Das war anders als im Hangar. Der Sternenstaub hat die Formung stabil gemacht." },
      { speaker: "Philipp", text: "Dann sollten wir davon nicht einfach alles für irgendeine Idee ausgeben." },
      { speaker: "Charly", text: "Aber für die richtige Idee schon." }
    ],
    action: "water-celebrated",
    actionLabel: "Mit Rika sprechen"
  },
  "drive-upgrade": {
    id: "drive-upgrade",
    eyebrow: "Cinder · Werkstatt",
    title: "Ein Geschenk aus Staubhafen",
    lines: [
      { speaker: "Rika", text: "Das hier lag seit Jahren in meiner Werkstatt. Eine alte Impulsspule. Euer Schiff kann sie besser gebrauchen." },
      { speaker: "Philipp", text: "Die passt an unsere Seitentriebwerke." },
      { speaker: "Charly", text: "Dann kommen wir vielleicht durch den nächsten schwachen Pfad." },
      { speaker: "Olli", text: "Wohin führt der?" },
      { speaker: "Louis", text: "Ein Name kommt durch. Moss." }
    ],
    action: "drive-upgraded",
    actionLabel: "Antriebsupgrade einbauen"
  }
};

export const cinderSpeakerColor: Record<CinderSpeaker, string> = {
  Philipp: "#54a5c5",
  Charly: "#d66f8f",
  Olli: "#d49a52",
  Louis: "#d2a35f",
  Rika: "#b98a68"
};
