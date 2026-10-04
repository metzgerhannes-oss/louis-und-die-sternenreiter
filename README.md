# Louis & die Sternenreiter

Kindgerechtes Sci-Fi-Point-and-Click-Abenteuer über Entdecken, Reparieren, Rätsel und kreative Ideen.

## Aktuelles Spielprinzip

Das Projekt verwendet ab der Fixed-Scene-Neuausrichtung **keine freie Laufsteuerung mehr**.

Die Kernschleife ist:

1. feste, hochwertig komponierte Szene ansehen
2. Gegenstände oder Figuren anklicken
3. Dialog, Hinweis oder Nahansicht öffnen
4. kleine Aufgabe / Rätsel lösen
5. sichtbare Veränderung in der Szene auslösen
6. nächste Szene oder Story-Stufe freischalten

Philipp, Charly und Olli reisen immer gemeinsam mit Louis. Die Profilwahl personalisiert Ansprache und Fortschritt, nicht die Anwesenheit der Crew.

## Technischer Stack

- React + TypeScript + Vite
- PWA für iPhone/iPad, Android und Desktop
- Supabase / PostgreSQL für persistente Daten und spätere Cloud-Synchronisierung
- Web Speech API als kostenlose Basis für Vorlesen und Spracheingabe
- CSS-/DOM-Hotspots für responsive Point-and-Click-Szenen

**Nicht mehr Teil der Runtime:** Phaser, D-Pad, freie Bewegung, Kamera-Follow, Character-Rigs und Sprite-Walk-Cycles.

## Grundsätze

- hochwertige feste Szenen statt technisch erzwungener freier Bewegung
- Fokus auf Entdecken, Helfen, Rätsel, Reparieren und Gestalten
- alle spielrelevanten Texte vorlesbar
- Kinderideen verändern Canon nie ungeprüft
- Louis bleibt Begleiter, Vorlese-Helfer und Creator-Schnittstelle

Weitere verbindliche Entscheidungen liegen unter `docs/`.
