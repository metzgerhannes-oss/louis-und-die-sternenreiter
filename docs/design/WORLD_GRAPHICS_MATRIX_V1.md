# WORLD ART MATRIX V1 · alle Kapitel ab Cinder

## Verbindliche Art Direction

Diese Matrix ist die Produktionsgrundlage für alle Welten nach Hangar 3.

### Unveränderliche Figuren

**Verbindliche Master-Referenzen aus dem aktuellen Spiel:**
- Philipp: `public/assets/crew/philipp-portrait-v4.webp`
- Charlotte/Charly: `public/assets/crew/charly-portrait-v4.webp`
- Olli: `public/assets/crew/olli-portrait-v4.webp`
- Louis: `public/assets/crew/louis.webp`

Diese vier Dateien sind die Identitätsreferenz. Für neue Weltgrafiken dürfen Gesichter, Frisuren, Haarfarben, Alterswirkung, Proportionen und Farbcodes **nicht frei neu erfunden** werden. Neue Bilder müssen aus diesen freigegebenen Charakteren abgeleitet werden; ein stilistisch passendes, aber anders aussehendes Kind gilt als Grafikfehler.


In jeder Szene bleibt die Kerncrew konsistent:
- **Charlotte/Charly**: leicht größer als Philipp, subtil weiblicher, lange braune Haare, Berry/Magenta als Akzentfarbe
- **Philipp**: braunes Haar, Türkis/Blau als Akzentfarbe, normale kindliche Proportionen
- **Olli**: sichtbar kleiner/jünger wirkend, blondes Haar, Amber/Orange als Akzentfarbe, normale Körperproportionen
- **Louis**: schlanker, eher brauner **Golden Retriever**, klar als Hund erkennbar; niemals klein, beagleartig oder mit anderer Rassewirkung

Zusätzliche Erwachsene/NPCs erscheinen **nur**, wenn die Story sie ausdrücklich verlangt.

### Harte Identitätsprüfung vor jeder Freigabe

Ein Bild darf erst übernommen werden, wenn alle Punkte mit **ja** beantwortet sind:
- exakt **drei Kinder**: Charlotte/Charly, Philipp und Olli
- keine vierte Kinderfigur und keine zusätzliche Person ohne Storygrund
- Charly nicht blond und nicht durch ein beliebiges Mädchen ersetzt
- Philipp und Olli nicht vertauscht
- Olli sichtbar kleiner als Charly/Philipp und mit Orange/Amber erkennbar
- Philipp mit Blau/Türkis erkennbar
- Charly mit Berry/Magenta erkennbar
- Gesichter/Frisuren an den V4-Portraits orientiert, nicht neu erfunden
- Louis eindeutig derselbe schlanke braune Golden Retriever
- wiederkehrendes Schiff bleibt dasselbe Modell
- erst danach Prüfung von Welt, Licht, Storyzustand und Bildqualität

### Bildsprache

- hochwertiger illustrativer 2.5D/3D-Kinder-Adventure-Stil wie freigegebene Hangar-Szenen
- Querformat 16:9
- Personen deutlich größer im Vordergrund als bisher
- Crew soll in wichtigen Storybildern ca. 35–55 % der Bildhöhe erreichen
- starke Tiefenwirkung, klare Lichtführung, lesbare Interaktionsobjekte
- keine UI, Texte, Beschriftungen oder Buttons im Bild
- keine eingebrannten Hotspot-Markierungen
- Schiff und Crew behalten ihre Form/Farbgebung weltübergreifend
- jede Welt bekommt eine klar eigene Farb- und Materialidentität
- falsche Zustände werden als eigene native Bildvariante gedacht, nicht als CSS-Kaschierung

## Produktionssatz pro Welt

Jede Welt erhält mindestens:
1. **overview** – charaktergetragene Gesamtansicht
2. **story-focus** – Hauptbegegnung mit Crew/NPC groß im Vordergrund
3. **interaction-a** – erstes zentrales Rätsel/Objekt
4. **interaction-b** – zweites zentrales Rätsel/Objekt
5. **success** – sichtbar veränderter erfolgreicher Weltzustand
6. **failure** – exemplarischer Fehlzustand für Zwischenbilder

Dateinamen:
`world-<id>-<scene>-v1.webp`

---

## Kapitel 2A · Cinder

### Identität
Rostrote Wüstenwelt, staubige Mesas, alte Kondensatoranlagen, Windrotoren, Staubhafen. Hartes warmes Sonnenlicht, kühlere türkisfarbene Techniklichter.

### Personen
Rika als erwachsene lokale Mechanikerin/Technikerin. Crew bleibt deutlich im Vordergrund.

### Bilder
- `world-cinder-overview-v1.webp` – Crew nach Landung, Staubhafen und Kondensatoren im Hintergrund
- `world-cinder-rika-v1.webp` – Crew + Rika im direkten Gespräch
- `world-cinder-condensers-v1.webp` – Messung an alter Wassertechnik
- `world-cinder-canyon-v1.webp` – Crew am Canyonrand, drei mögliche Wasserwege visuell erkennbar
- `world-cinder-water-success-v1.webp` – Wasser erreicht Staubhafen, Rika + Crew
- `world-cinder-failure-v1.webp` – Staubwalze/Bodenriss als Fehlzustand

## Kapitel 2B · Moss

### Identität
Biolumineszenter Leuchtsumpf, riesige Blätter, feuchte Luft, grün/türkis leuchtende Wurzeln, kleine Forschungsstation.

### Personen/NPC
Dr. Niva, Forschungsroboter M-4.

### Bilder
- `world-moss-overview-v1.webp` – Crew groß vor Leuchtsumpf und Station
- `world-moss-niva-v1.webp` – Crew + Dr. Niva
- `world-moss-path-v1.webp` – unterbrochener Steg, lebende Wurzeln, Wegfindung
- `world-moss-m4-rescue-v1.webp` – M-4 zwischen leuchtenden Wurzeln
- `world-moss-success-v1.webp` – geborgener M-4 mit Scanner-Modul
- `world-moss-failure-v1.webp` – Wurzeln verspannen sich / instabiler Bergungsversuch

## Kapitel 2C · Junction 12

### Identität
Dicht gebaute Marktstation im All, Neonmarkt, Werkstätten, Garküchen, Kabel, tausend Antennen, violett/cyan/pink.

### Personen/NPC
Bram, älterer Mechaniker.

### Easter Egg „67“
Junction 12 enthält den verbindlichen optionalen 67-/Hitchhiker-Easter-Egg-Moment. Detailablauf: `docs/design/JUNCTION12_EASTER_EGG_67.md`.

### Bilder
- `world-junction12-overview-v1.webp` – Crew im Neonmarkt, Antennenlandschaft
- `world-junction12-bram-v1.webp` – Bram und Louis/Harness im Fokus
- `world-junction12-signal-v1.webp` – Signalmast/Antennen-Netz
- `world-junction12-workshop-v1.webp` – Brams Werkstatt, Crew nah
- `world-junction12-success-v1.webp` – stabiler Signalmast, Stadtlichter reagieren
- `world-junction12-failure-v1.webp` – Signalübersteuerung/Neon-Glitch

## Kapitel 3 · Der leere Pfad

### Identität
Unkartierter Raum ohne feste Form. Dunkler Sternenraum, schwebende Fragmente, halb entstehende Landschaft, viel Negativraum. Geheimnisvoll statt bedrohlich.

### Bilder
- `world-empty-path-overview-v1.webp` – Crew und Louis an der Kante eines unfertigen Raums
- `world-empty-path-focus-v1.webp` – Louis/Harness groß, leere Formungsfläche
- `world-empty-path-form-v1.webp` – erste kontrollierte Form entsteht
- `world-empty-path-boundary-v1.webp` – sichtbare Grenze zwischen leer und geformt
- `world-empty-path-success-v1.webp` – stabiler neuer Pfad mit bewusst leerem Raum
- `world-empty-path-failure-v1.webp` – zu viel Formung kollabiert/verwischt

## Kapitel 4 · Störungsknoten

### Identität
Mehrere Welten liegen sichtbar übereinander: Cinder-Staub, Moss-Pflanzen, Junction-Technik. Instabile Sternenpfade und flackernde Raumgrenzen.

### Bilder
- `world-distortion-overview-v1.webp` – Crew mitten in überlagerter Welt
- `world-distortion-overlap-v1.webp` – drei Weltmaterialien konkurrieren im selben Raum
- `world-distortion-routes-v1.webp` – flackernde Routenknoten
- `world-distortion-rules-v1.webp` – Crew/Louis setzt klare Grenzen
- `world-distortion-success-v1.webp` – Welten sauber getrennt, Pfade geordnet
- `world-distortion-failure-v1.webp` – chaotische Überlagerung mit sichtbarer Reaktion

## Kapitel 5A · Glasküste

### Identität
Kristallmeer, klingende Glasplatten, türkis/hellblau, spiegelnde Bruchzonen, alte Navigationsfragmente.

### Bilder
- `world-glass-coast-overview-v1.webp` – Crew groß vor Kristallküste
- `world-glass-coast-fracture-v1.webp` – bewegliche Bruchzone
- `world-glass-coast-bridge-v1.webp` – flexible Übergangslösung
- `world-glass-coast-fragment-v1.webp` – Wegfragment als Fokusobjekt
- `world-glass-coast-success-v1.webp` – stabiler flexibler Übergang
- `world-glass-coast-failure-v1.webp` – starre Verbindung reißt/Glas schwingt sichtbar

## Kapitel 5B · Wolkenozean

### Identität
Gewaltige violett-graue Wolken, permanente Windströmungen, Blitzlicht in großer Höhe, schwebende Insel-/Ankertechnik.

### Bilder
- `world-cloud-ocean-overview-v1.webp` – Crew im Schiff/Cockpit vor Wolkenmeer
- `world-cloud-ocean-current-v1.webp` – sichtbare Windströmung und Sturmanker
- `world-cloud-ocean-sailing-v1.webp` – Crew nutzt Strömung statt Gegenschub
- `world-cloud-ocean-anchor-v1.webp` – zweites Wegfragment/Sturmanker
- `world-cloud-ocean-success-v1.webp` – stabiler Flugkorridor
- `world-cloud-ocean-failure-v1.webp` – direkter Schub gegen Sturm, sichtbare Turbulenz

## Kapitel 5C · Schrottring

### Identität
Riesiges Wrackfeld in einem Ring aus Schiffsresten, alte Sternenformer-Technologie, kaltes Metall, warme Archivlichter.

### Personen/NPC
Archiv als alte Systemintelligenz.

### Bilder
- `world-scrap-ring-overview-v1.webp` – Crew vor gigantischem Wrackfeld
- `world-scrap-ring-wreck-v1.webp` – altes Sternenformer-Schiff mit Harness-Symbol
- `world-scrap-ring-archive-v1.webp` – versiegeltes Archiv, Crew nah
- `world-scrap-ring-core-v1.webp` – alter Kartentisch/Zentralkern
- `world-scrap-ring-success-v1.webp` – Archiv geöffnet, Wegdaten sichtbar
- `world-scrap-ring-failure-v1.webp` – instabiles Wrack/Fehlzugriff/Abschottung

## Kapitel 6 · Das Herz der Wege

### Identität
Monumentale zentrale Sternenstation, riesiger Kartentisch, Sternenpfade wie leuchtende Adern im Raum. Dunkel, edel, Gold/Türkis.

### Personen/NPC
Herz als zentrale Systemintelligenz – keine menschliche Figur nötig; Präsenz über Licht/Architektur.

### Bilder
- `world-heart-overview-v1.webp` – Crew klein genug für Monumentalität, aber noch klar im Vordergrund
- `world-heart-routes-v1.webp` – stabile vs. beschädigte Pfade
- `world-heart-energy-v1.webp` – Energieverteilung am Zentralkern
- `world-heart-rule-v1.webp` – letzte Regel, Crew und Louis im Fokus
- `world-heart-success-v1.webp` – Netz aktiviert, einige Räume bewusst leer
- `world-heart-failure-v1.webp` – Überlastung/zu viele Pfade gleichzeitig

## Reihenfolge der Bildproduktion

1. Cinder
2. Moss
3. Junction 12
4. Der leere Pfad
5. Störungsknoten
6. Glasküste
7. Wolkenozean
8. Schrottring
9. Herz der Wege

Erst nach Konsistenzprüfung der jeweiligen Overview-Szene werden die fünf weiteren Zustände derselben Welt produziert.
