# Design System V1 – Louis & die Sternenreiter

Status: **verbindliche Designbasis**

## 1. Produktgefühl

Die visuelle Identität ist:

**Space Western + Garage Punk + warme Sci-Fi**

Nicht:
- sterile High-Tech-Sci-Fi
- düsterer Cyberpunk
- Militär-Sci-Fi
- überladene Kinder-App
- generischer Mobile-Game-Look

Die Welt wirkt benutzt, gebaut und persönlich verändert.

Leitsatz:

> Hier wurde nichts einfach gekauft. Jemand hat es gebaut, repariert oder weiterentwickelt.

## 2. Drei Designschichten

### Welt
Metall, Lack, Kabel, Stoff, Patina, Werkstatt, warmes Licht, Sternenstaub.

### UI
Ruhiger als die Welt. Klare Flächen, gute Lesbarkeit, große Touchziele, wenige gleichzeitige Aktionen.

### Charaktere
Warm, sympathisch, eigenständig, leicht punkig. Kein Chibi-Stil und keine überrealistische Darstellung.

## 3. Designregeln

1. Ein Screen hat immer **eine klare Hauptaktion**.
2. Sekundäraktionen sind sichtbar, aber visuell ruhiger.
3. Spielwelt und UI dürfen sich nicht gegenseitig überdecken.
4. Text liegt nie direkt auf unruhigem Artwork ohne eigene Lesefläche.
5. Louis-Dialoge verwenden immer dieselbe Dialogfamilie.
6. Profile verwenden immer dieselbe Avatarfamilie.
7. Karten, Panels und Buttons stammen aus denselben Tokens.
8. Mobile Layouts werden nicht aus Desktop zusammengedrückt, sondern gezielt umgebrochen.
9. Touchziele mindestens 44 × 44 CSS-Pixel.
10. Safe Areas auf iPhone/iPad werden berücksichtigt.

## 4. Formensprache

### Große Flächen
- leicht gerundete Ecken
- keine extrem runden „Kinderkarten“
- robuste, leicht technische Panels
- dünne metallische Konturen
- sparsame diagonale Details

### Buttons
Primär:
- kräftige, warme oder türkisfarbene Fläche
- kurze Beschriftung
- optional Icon links

Sekundär:
- dunkler Hintergrund
- sichtbare Kontur

Gefahr/Abbruch:
- keine aggressive rote Dominanz
- Rot nur für tatsächliche Fehler/Stop

## 5. Farbe

Die exakten Werte liegen in `src/theme/tokens.css`.

### Basis
- Space Black
- Deep Hangar
- Steel Panel
- Warm Metal
- Sand / Canvas

### Akzente
- Signal Turquoise
- Warm Amber
- Rust
- Violet Neon

### Profile
Jedes Profil erhält eine eigene Akzentfarbe, aber keine eigene UI-Welt:
- Charly: warmes Berry/Rosa
- Philipp: Space Blue/Türkis
- Olli: Amber/Orange

Die Profilfarben ersetzen niemals die allgemeinen Produktfarben.

## 6. Typografie

V1 nutzt Systemschrift für Performance und kostenlose Verfügbarkeit.

Hierarchie:
- Display: große Kapitel-/Ortsnamen
- H1: Screenüberschrift
- H2: Dialog-/Panelüberschrift
- Body: Spielinformationen
- Caption: Status/Meta

Keine dekorative Sci-Fi-Schrift für Fließtext.

## 7. Icons

- einfache, kräftige Linien
- keine Mischung aus Emoji und finalen Produkticons
- Emoji sind ausschließlich Entwicklungsplatzhalter
- finales Set muss einheitliche Strichstärke haben

## 8. Bewegung

Animation unterstützt Bedeutung:
- Panels gleiten kurz ein
- Dialoge erscheinen ruhig
- Fortschritt darf lebendiger sein
- keine permanente UI-Bewegung
- keine blinkenden Elemente außer notwendigem Status

## 9. Audio-UI

Jeder vorlesbare Block verwendet dieselbe Audioaktion:
- Vorlesen
- Stop
- Wiederholen

Mikrofon:
- neutral
- hört zu
- Transkript vorhanden
- Fehler

Diese Zustände müssen visuell konsistent sein.

## 10. Source of Truth

Verbindliche Reihenfolge:

1. `docs/design/DESIGN_SYSTEM_V1.md`
2. `docs/design/VISUAL_BIBLE_V1.md`
3. `docs/design/CREW_RULES_V1.md`
4. `docs/design/PRODUCT_LAYOUTS_V1.md`
5. `docs/design/ASSET_STRUCTURE.md`
6. `src/theme/tokens.css`
7. freigegebene Runtime-Szenen unter `public/assets/scenes/`

Ein neues Szenen-Artwork gilt erst als freigegeben, wenn Perspektive, Figuren, Hotspots und Zustandsvarianten fachlich festgelegt sind.
