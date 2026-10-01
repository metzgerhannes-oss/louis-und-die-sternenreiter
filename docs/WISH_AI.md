# Wünschen – KI-Architektur

## Entscheidung

Die Wunschinterpretation wird für V1 über **Cloudflare Workers AI** umgesetzt. Ziel ist ein für den privaten Familienbetrieb kostenfreier Betrieb innerhalb des Free-Kontingents.

Die KI ist **Interpretationsschicht**, nicht Spielautorität.

## Datenfluss

```
Kind (Text/Sprache)
  -> React Wunsch-UI
  -> Cloudflare Worker /wish
  -> Workers AI
  -> strikt validiertes WishBlueprint-JSON
  -> lokale/Server-Regelprüfung
  -> Formungsstufe A-D
  -> erlaubte Creation / Ideenbuch
```

## Sicherheitsgrenze

Die KI darf niemals direkt:
- Canon verändern,
- Player State schreiben,
- Inventar/Ressourcen buchen,
- Game-Engine-Kommandos ausführen,
- beliebigen Code erzeugen oder laden.

Die KI liefert ausschließlich Daten im erlaubten `WishBlueprint`-Schema. Unbekannte Felder werden verworfen.

## WishBlueprint V1

```ts
type WishCategory = "ship" | "weapon" | "tool" | "companion_gear" | "world_object" | "cosmetic" | "story_idea";

interface WishBlueprint {
  intent: string;
  category: WishCategory;
  title: string;
  description: string;
  requestedTraits: string[];
  suggestedScale: "small" | "medium" | "large" | "epic";
  louisReply: string;
  needsClarification: boolean;
  clarificationQuestion?: string;
}
```

Explizit **nicht** Teil der KI-Ausgabe sind endgültige Schadenswerte, Preise, Ressourcenabbuchungen, Freischaltungen oder Canon-Flags.

## Regelprüfung

Nach der KI-Ausgabe entscheidet deterministischer Spielcode:
1. Ist die Kategorie am aktuellen Sternenpunkt erlaubt?
2. Ist der Wunsch mit Kinder-/Weltsicherheitsregeln vereinbar?
3. Welche vorhandenen Assets/Module können den Wunsch darstellen?
4. Welche Formungsstufe A-D gilt?
5. Welche Ressourcen sind nötig?
6. Wird direkt geformt, gebaut oder als große Idee gespeichert?

## Sprache

Spracheingabe darf clientseitig per Web Speech API erfolgen, sofern auf dem Gerät verfügbar. An den Worker wird grundsätzlich der bestätigte Text geschickt. Roh-Audio wird in V1 nicht dauerhaft gespeichert.

## Offline-/Fehlerverhalten

Ist Workers AI nicht erreichbar oder das freie Kontingent ausgeschöpft:
- kein kostenpflichtiger Fallback,
- keine automatische Abbuchung,
- Wunsch bleibt lokal als Entwurf gespeichert,
- vorbereitete Wünsche und normale Spielmechanik bleiben nutzbar.

## Datenschutz / Secrets

- Keine KI-Secrets im GitHub-Pages-Frontend.
- Cloudflare-Bindings und Tokens ausschließlich serverseitig.
- Nur für die Interpretation notwendiger Kontext wird übertragen.
- Keine vollständigen Profile oder unnötige personenbezogene Daten im Prompt.

## Kostenregel

V1 darf keine zwingende kostenpflichtige KI-Abhängigkeit besitzen. Wird das kostenlose Kontingent erreicht, degradiert die Funktion kontrolliert statt auf einen bezahlten Anbieter umzuschalten.
