# Glasküste · native Szenenlogik V1

## Verbindliche Bildwelt

Glasküste ist kein generischer Eisplanet. Die Welt besteht aus einem **türkis/hellblauen Kristallmeer**, klingenden Glasplatten, spiegelnden Bruchzonen und alten Navigationsfragmenten.

Die Crew bleibt in allen Szenen unverändert:
- Philipp – V4-Master, Blau/Türkis
- Charlotte/Charly – V4-Master, Berry/Magenta, ca. 15 cm größer als Philipp
- Olli – V4-Master, Orange/Amber, sichtbar jünger/kleiner
- Louis – schlanker hellbrauner Golden Retriever

Jede sichtbare menschliche Hand: **4 Finger + 1 Daumen**.

## Runtime-Bildsatz

- `world-glass-coast-overview-v1.webp` – neutrale Gesamtansicht
- `world-glass-coast-fracture-v1.webp` – Ankunft: bewegliche Bruchzone sichtbar
- `world-glass-coast-bridge-v1.webp` – Sternenpunkt: flexibler segmentierter Übergang
- `world-glass-coast-fragment-v1.webp` – Wegfragment/Kartenanker im Fokus
- `world-glass-coast-success-v1.webp` – stabiler flexibler Übergang nach Lösung
- `world-glass-coast-failure-v1.webp` – starre Verbindung reißt; als Fehlentscheidungs-Zwischenbild reserviert

## Story-Mapping

1. `glass-arrival` → fracture
2. Glasküste-Starpoint → bridge
3. `glass-fragment` → fragment
4. Travel zum Wolkenozean → success

Die Failure-Grafik ist vorbereitet, damit eine falsche Entscheidung künftig wie bei den Reparaturfolgen als sichtbares Zwischenbild gezeigt werden kann.

## Technische Regel

Die Zustände werden als **echte Build-Artefakte** erzeugt. Keine Runtime-CSS-Kaschierung für Bruch, Brücke oder Fragment. Der Storyzustand wird direkt über das native Szenenbild gewechselt.

## Abnahme

Vor Release:
1. exakt drei Kinder + Louis
2. keine zusätzlichen Personen
3. V4-Identitäten unverändert
4. Charlotte ca. 15 cm größer als Philipp
5. Olli sichtbar kleiner/jünger
6. Louis schlank/hellbraun
7. jede sichtbare Hand anatomisch korrekt
8. keine UI-Texte in der Bilddatei
9. Bruchzone/Brücke/Fragment müssen ohne Erklärung im Bild unterscheidbar sein
