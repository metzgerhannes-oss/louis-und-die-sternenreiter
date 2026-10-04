# Hangar 3 – Fixed Scenes V1

## Ziel

Kapitel 1 wird als Point-and-Click-Abenteuer aus festen Querformat-Szenen gespielt. Die Bilder tragen die Atmosphäre; Hotspots liegen als unsichtbare bzw. nur bei Relevanz sichtbare Interaktionsflächen darüber.

## Szenen

| Scene-ID | Asset | Storyfunktion |
| --- | --- | --- |
| overview | hangar-main-v1.webp | Gesamtansicht und Auswahl der Bereiche |
| energy | hangar-energy-v1.webp | Energieverteiler / erster Sternenpunkt |
| workbench | hangar-workbench-v1.webp | Energiezelle finden |
| ship / cooling | hangar-cooling-v1.webp | Kühlleitung reparieren |
| ship / navigation | hangar-navigation-v1.webp | Navigation reaktivieren |
| ship / system-test | hangar-systemtest-v1.webp | Schiffssysteme testen |
| gate | hangar-gate-v1.webp | Hangartor / zweiter Sternenpunkt / Start |
| crew | hangar-crew-v1.webp | Louis und Crew ansprechen |

Alle Runtime-Szenen liegen unter `public/assets/scenes/hangar/`.

## Interaktionsprinzip

1. Gesamtansicht zeigt den Hangar.
2. Ein Bereich wird angetippt.
3. Die App wechselt in die passende Nahansicht.
4. In der Nahansicht wird das relevante Objekt angetippt.
5. Storydialog, Sternenpunkt oder Hinweis öffnet sich.
6. Nach Abschluss springt der Flow automatisch in die nächste sinnvolle Szene.
7. Die Übersicht bleibt jederzeit über „Übersicht“ erreichbar.

## Fortschrittsfolge

1. Intro
2. Energieverteiler
3. Sternenpunkt Energie
4. Werkbank
5. Energiezelle
6. Kühlleitung
7. Navigation
8. Systemtest
9. Hangartor
10. Sternenpunkt Tor
11. Start nach Cinder

## UI-Regeln

- Bilder werden nativ im Querformat erstellt.
- Keine Bedienelemente werden in das Bild selbst gerendert.
- Hotspots sind responsive Prozentflächen über dem Bild.
- Nur relevante Hotspots pulsieren.
- Erledigte Hotspots erhalten einen dezenten grünen Status.
- Textauswahl und iOS-Touch-Callout bleiben im Szenenbereich deaktiviert.
- Dialoge und Vorlesefunktion bleiben separate UI-Ebenen.

## Asset-Versionierung

Szenenbilder werden nicht unter derselben URL überschrieben. Neue freigegebene Varianten erhalten neue Dateinamen, z. B. `hangar-main-v2.webp`. Dadurch werden PWA-/Service-Worker-Cache-Probleme vermieden.
