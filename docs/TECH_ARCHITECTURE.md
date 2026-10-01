# Technische Architektur

## Ziel

Eine kostenlose bzw. im kleinen privaten Betrieb kostenfreie Web-/PWA-Architektur, die auf iPhone/iPad, Android und Desktop funktioniert und später kontrolliert erweitert werden kann.

## Stack

- **React + TypeScript + Vite**: App-Shell, Menüs, Profile, Journal, Dialogoberflächen
- **Phaser**: 2D/2.5D-Hauptspiel
- **Babylon.js**: nur dort, wo echtes 3D Mehrwert bringt
- **Supabase / PostgreSQL**: Auth, persistenter Zustand, Canon, Ideen, Storage
- **Supabase Edge Functions**: serverseitige Aktionen, insbesondere GitHub-Integration
- **Cloudflare Workers AI**: kostenfreie KI-Interpretation von Kinderwünschen; liefert ausschließlich validierte WishBlueprint-Daten
- **PWA**: installierbare Web-App und Offline-App-Shell
- **Phaser/Web Audio**: Sound und Musik

## Architekturregel

Spielcode und Weltdaten bleiben getrennt.

Phaser rendert und simuliert. Story, Orte, Quests, Dialoge, Regeln und freigegebener Canon werden über Domain-/Content-Schichten geladen und nicht in Szenen verteilt hartcodiert.

## Geplante Struktur

```
src/
  app/
  features/
    profiles/
    journal/
    companion/
    ideas/
    ship/
    hangar/
    inventory/
    map/
    settings/
    parent/
  game/
    bootstrap/
    scenes/
    entities/
    systems/
    world/
  three/
  domain/
  services/
  content/
  shared/

supabase/
  migrations/
  functions/
```

## React ↔ Phaser

Kommunikation über einen zentralen typisierten EventBus.

Beispiele:
- Phaser meldet Interaktion mit Louis → React öffnet Dialog
- React wählt Mission → Phaser lädt Missionszustand

## Babylon.js

Babylon wird lazy geladen und nicht als permanenter Hauptrenderer verwendet.

V1-Einsatz:
- Schiff im Hangar in 3D ansehen
- Schiff drehen
- sichtbare Module
- Lackierung/Abzeichen

## Persistenz

Drei getrennte Bereiche:
1. **Canon** – offiziell freigegebene Welt
2. **Player State** – individueller Fortschritt
3. **Ideas** – Vorschläge des Kindes

Keine Kinderidee verändert direkt den Canon.

## Sicherheitsregel

GitHub-Tokens, Service-Role-Keys und andere privilegierte Secrets dürfen niemals im Client ausgeliefert werden. GitHub-Erstellung erfolgt ausschließlich serverseitig.


## Wunsch-KI

Die Wunschfunktion folgt der Architektur in `docs/WISH_AI.md`.

Wichtigste Grenze:

```
Wunsch -> Workers AI -> WishBlueprint -> Regelengine -> erlaubte Weltänderung
```

Workers AI hat keinen direkten Schreibzugriff auf Canon, Player State oder Game Engine. Die Anwendung validiert und begrenzt jede KI-Ausgabe vor der Verwendung.
