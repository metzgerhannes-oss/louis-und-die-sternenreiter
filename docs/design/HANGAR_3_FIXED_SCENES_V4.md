# Hangar 3 – Fixed Scenes V4 / SCENES 0.10

## Ziel

SCENES 0.10 ersetzt die technisch korrekte, aber visuell nicht ausreichende V3-Fassung. Maßstab ist nicht nur Storylogik, sondern sichtbare Bildqualität und eindeutige Nutzbarkeit.

## Verbindliche Regeln

- keine zusätzlichen Personen; Crew bleibt Charly, Philipp, Olli und Louis
- kein offener Außenraum vor gelöstem Hangartor
- keine künstlichen Torstreifen, keine Feather-Nähte, keine gezeichneten Ersatzobjekte über der freigegebenen Welt
- Energie, Werkbank, Schiff, Kühlung, Navigation, Systemtest und Tor besitzen jeweils ein klar unterscheidbares Storymotiv
- Kühlung zeigt die beschädigte Leitung tatsächlich
- Navigation zeigt eine echte Cockpit-/Konsolenansicht
- Systemtest zeigt das aktivierte Schiff mit Testtechnik
- geschlossenes Tor ist bildfüllend und massiv
- offenes Tor zeigt den freien Weg in den Sternenraum
- Kapitelabschluss verwendet dasselbe offene Torbild
- Hotspots liegen auf dem konkreten Storyobjekt
- Landscape-Handy bleibt ohne unnötige zweite Szenentextkarte spielbar

## Bildquelle

Die Detailmotive stammen aus einer konsistenten, gemeinsam erzeugten Hangar-Storyboard-Art-Direction ohne zusätzliche erwachsene Figur. Die Build-Quelle ist als Base64-Teilmenge unter `scripts/scene-source/` versioniert und wird beim Build ausschließlich in fertige WebP-Szenen zugeschnitten.

Die freigegebene Hangar-Gesamtansicht `hangar-main-v2.webp` bleibt Grundlage für Übersicht und Crew-Nahansicht.

## Runtime-Assets

- hangar-main-blackout-v4.webp
- hangar-main-powered-v4.webp
- hangar-main-active-v4.webp
- hangar-main-open-v4.webp
- hangar-energy-v4.webp
- hangar-workbench-dark-v4.webp
- hangar-workbench-v4.webp
- hangar-ship-dark-v4.webp
- hangar-ship-v4.webp
- hangar-cooling-v4.webp
- hangar-navigation-v4.webp
- hangar-systemtest-v4.webp
- hangar-gate-closed-v4.webp
- hangar-gate-open-v4.webp
- hangar-crew-v4.webp

## Storyfolge

Intro → Energieverteiler → Sternenpunkt 1 → Werkbank/Energiezelle → Schiff aktivieren → Kühlleitung reparieren → Navigation reaktivieren / sicheren Kurs nach Cinder finden → Systemtest → Hangartor → Sternenpunkt 2 → Tor öffnen → Start nach Cinder.

## Abnahme

Release-Blocker sind:
1. sichtbarer Außenraum vor Torlösung
2. zusätzliche oder falsche Crewfigur
3. Storyobjekt im Bild nicht erkennbar
4. Hotspot liegt nicht am Storyobjekt
5. mobile Überlagerungen verhindern die Interaktion
6. Rückfall auf V1/V2/V3-Kompositing in der Runtime


## SCENES 0.11 – Open-Gate-Abnahme

Die visuelle Nachprüfung des tatsächlich gebauten 0.10-Artefakts hat einen einzelnen Restblocker gefunden: Die beiden geöffneten Torbilder stammten aus einem nur 140 px hohen Storyboard-Ausschnitt und wurden auf 1600×900 hochskaliert.

0.11 ersetzt ausschließlich diese beiden Zustände:
- `hangar-main-open-v5.webp`
- `hangar-gate-open-v5.webp`

Der Sternenraum wird nun innerhalb des vorhandenen Torrahmens in voller Szenenauflösung gerendert. Keine Storyboard-Beschriftung, keine zusätzliche Figur und kein CSS-/DOM-Overlay.


## SCENES 0.12 – finale Open-Gate-Korrektur

Die direkte Artefakt-Sichtprüfung von 0.11 zeigte, dass der Storyboard-Hintergrund im geöffneten Tor noch ein verkleinertes Schiff enthielt und wie ein eingefügter Bildschirm wirkte.

0.12 verbietet deshalb Storyboard-Bildausschnitte für den Außenraum vollständig. Die Toröffnung verwendet einen eigenständig gerenderten, reinen Sternenraum/Cinder-Hintergrund. Der bereits vorhandene Hangar-/Torrahmen bleibt Teil des Szenenbilds; es wird kein zusätzlicher sichtbarer Rahmen aufgelegt.

Neue Cache-sichere Assets:
- `hangar-main-open-v6.webp`
- `hangar-gate-open-v6.webp`
