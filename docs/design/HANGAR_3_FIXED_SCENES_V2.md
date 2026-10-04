# Hangar 3 – Fixed Scenes V2

## Verbindliches Prinzip

Kapitel 1 verwendet ausschließlich native Querformat-Szenenbilder als sichtbaren Weltzustand. Tor, Dunkelheit, Aktivierung und Sternenfeld werden nicht mehr per CSS über das Szenenbild gelegt.

**Fachlicher Guardrail:** Vor erfolgreicher Torlösung darf in keiner Kapitel-1-Szene ein offenes Hangartor oder freier Außenraum sichtbar sein.

Die V1-Dateien bleiben ausschließlich als Build-Quellen für bereits freigegebene Bildausschnitte erhalten. Sie werden nicht mehr direkt von der Runtime verwendet.

## Runtime-Szenen

| Scene-ID | Zustand vor Torlösung | Zustand nach Torlösung | Storyfunktion |
| --- | --- | --- | --- |
| overview | hangar-main-blackout-v2.webp / hangar-main-powered-v2.webp / hangar-main-active-v2.webp | hangar-main-open-v2.webp | Gesamtansicht, abhängig vom Fortschritt |
| energy | hangar-energy-v2.webp | hangar-energy-open-v2.webp | defekter Energieverteiler / erster Sternenpunkt |
| workbench | hangar-workbench-dark-v2.webp / hangar-workbench-v2.webp | hangar-workbench-open-v2.webp | stromlos bzw. nach Sternenpunkt sichtbar belebt |
| ship | hangar-ship-dark-v2.webp / hangar-ship-v2.webp | hangar-ship-open-v2.webp | Schiff dunkel bzw. aktiviert, aber noch nicht startbereit |
| cooling | hangar-cooling-v2.webp | hangar-cooling-open-v2.webp | echte Wartungs-/Reparaturszene an der beschädigten Kühlleitung |
| navigation | hangar-navigation-v2.webp | hangar-navigation-open-v2.webp | Cockpit-/Navigationsszene |
| system-test | hangar-systemtest-v2.webp | hangar-systemtest-open-v2.webp | deutlich aktives Schiff; Tor bleibt bis zur Lösung geschlossen |
| gate | hangar-gate-closed-v2.webp | hangar-gate-open-v2.webp | massives Hangartor vor bzw. nach Lösung |
| crew | hangar-crew-v2.webp | hangar-crew-open-v2.webp | Louis und Crew in derselben Bildwelt |

## Native Bildzustände

1. **Übersicht / Blackout**  
   Hangar dunkel, Werkbank und Schiff noch ohne reguläre Energie, Hangartor im Bild geschlossen.

2. **Energieverteiler**  
   Fokus auf den Verteiler. Er wirkt defekt und stromlos. Ein sichtbares Tor bleibt geschlossen.

3. **Werkbank**  
   Vor dem ersten Sternenpunkt dunkel. Danach als eigener nativer WebP-Zustand sichtbar lebendiger und wärmer beleuchtet. Kein CSS-Lichtkegel.

4. **Schiff**  
   Vor Energiezelle dunkel. Nach Einbau nativ aktiviert, jedoch nicht startbereit. Das Tor bleibt geschlossen.

5. **Kühlleitung**  
   Wartungs-/Reparaturszene am Schiff, nicht bloß eine allgemeine Hangaransicht.

6. **Navigation**  
   Cockpit/Konsolenfokus; Navigation wird reaktiviert.

7. **Systemtest**  
   Schiff deutlich aktiver. Das geschlossene Tor bleibt direkt im Bild sichtbar.

8. **Hangartor**  
   Vor Lösung: groß, massiv, geschlossen. Nach Lösung: eigenes offenes V2-Bild mit Sternenfeld.

9. **Crew/Louis**  
   Dieselbe Welt, dieselbe Crew und dieselbe Bildsprache.

## Technische Umsetzung

- Generator: `scripts/generate-scene-assets-v2.mjs`
- Runtime-Mapping: `src/features/scenes/HangarFixedScene.tsx`
- Asset-Check: `scripts/verify-scene-assets.mjs`
- Fachliche Tests: `tests/hangarScenes.test.ts`
- Die freigegebene geschlossene Toroptik aus `hangar-main-v2.webp` dient als native Bildquelle für die geschlossenen V2-Zustände.
- Sternenfeld und Beleuchtungszustände werden beim Build direkt in WebP-Dateien gerendert.
- `.story-gate-shutter`, `.story-open-gate-space` und `.story-blackout-haze` existieren nicht mehr.
- `npm run dev`, `npm run test` und `npm run build` erzeugen bzw. prüfen die V2-Assets automatisch.

## Storyfolge

1. stromlose Übersicht
2. Energieverteiler
3. erster Sternenpunkt
4. Werkbank
5. Energiezelle einsetzen
6. Schiff wacht auf
7. Kühlleitung reparieren
8. Navigation reaktivieren
9. Systemtest
10. geschlossenes Hangartor
11. zweiter Sternenpunkt
12. Hangartor offen / Sternenfeld
13. Start nach **Cinder**

Cinder bleibt das kanonische Ziel. Eine Asteroiden-Umsegelung gehört nicht zu Kapitel 1.
