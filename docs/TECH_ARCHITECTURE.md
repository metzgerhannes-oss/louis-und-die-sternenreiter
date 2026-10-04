# Technische Architektur

## Ziel

Robuste, kostenlose bzw. im privaten Betrieb kostenarme Web/PWA-Architektur für iPhone/iPad, Android und Desktop.

## Stack

- **React + TypeScript + Vite** – gesamte Runtime
- **CSS/DOM Hotspots** – klickbare Bereiche über festen Szenenillustrationen
- **Supabase / PostgreSQL** – persistente Daten, Ideen und später Cloud-Sync
- **PWA** – Installation und Offline-App-Shell
- **Web Audio / Web Speech API** – Sound, Vorlesen und Spracheingabe

## Bewusst entfernt

- Phaser
- freie 2D/2.5D-Bewegung
- Character-Rigs
- Kamera-/Follow-Systeme
- D-Pad/WASD als Spielkern
- Sprite-Sheet-Laufanimationen

## Szenenmodell

Eine feste Szene besteht aus:
- eindeutiger Scene-ID
- Hintergrund-/Szenenillustration
- responsiven Hotspot-Koordinaten
- Sichtbarkeitsbedingungen
- Dialog-/Storyaktion pro Hotspot
- optionalen Zustandsvarianten der Illustration
- optionaler Nahansicht

Storyzustand und Szenendarstellung bleiben getrennt.

## Datenbereiche

1. **Canon** – freigegebene Welt
2. **Player State** – Fortschritt
3. **Ideas** – Vorschläge der Kinder

Keine Kinderidee verändert direkt den Canon.

## Sicherheit

GitHub-Tokens, Service-Role-Keys und privilegierte Secrets dürfen niemals im Client ausgeliefert werden.
