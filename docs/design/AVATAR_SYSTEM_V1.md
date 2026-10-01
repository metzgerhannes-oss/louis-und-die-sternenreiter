# Avatar System V1

Status: **Designvorgabe**

## 1. Ziel

Charly, Philipp und Olli müssen:
- sofort unterscheidbar sein
- zur selben Welt gehören
- dieselbe grafische Qualität haben
- als Portrait und Spielfigur funktionieren
- später Outfits und Ausrüstung aufnehmen können

Louis verwendet dieselbe Illustrationssprache, bleibt aber eine eigene Companion-Familie.

## 2. Stil

### Ziel
Hochwertige 2.5D-Illustration mit klarer Silhouette.

Mischung aus:
- handgemaltem Game-Art-Look
- leicht stilisierten Proportionen
- Space-Western-Kleidung
- Garage-Punk-Details

### Nicht verwenden
- Pixelart
- Chibi
- Anime-Gesichter
- fotorealistische Kinder
- austauschbare Cartoon-Avatare
- unterschiedliche Renderstile pro Kind

## 3. Proportion

Kinderfiguren:
- ca. 4,5–5 Köpfe hoch
- größere Hände/Füße nur leicht stilisiert
- Kopf groß genug für Wiedererkennung
- keine Babyproportionen

## 4. Gemeinsame Basis

Alle drei:
- Sternenreiter-Jacke oder Overall
- Halstuch/Schal als markantes Element
- robuste Boots
- kleiner technischer Gürtel
- persönliches Abzeichen
- sichtbare Reparatur-/Patch-Details

Keine Waffe als Standardausstattung.

## 5. Individuelle Identität

### Charly
- Akzent: Berry / warmes Magenta
- Silhouette etwas dynamischer
- eigener Patch
- Frisur und Gesichtsform klar individuell
- optionale Accessoires später

### Philipp
- Akzent: Space Blue / Türkis
- technischere Details
- eigener Patch
- klar andere Frisur/Silhouette als Charly und Olli

### Olli
- Akzent: Amber / warmes Orange
- robuste, freundliche Silhouette
- eigener Patch
- ebenfalls eigenständige Kopf-/Frisurform

Die Namen werden nicht über stereotype Kleidung oder Farben erklärt.

## 6. Avatar-Ausgaben

Jeder freigegebene Avatar benötigt exakt diese Varianten:

### A. Master Full Body
- transparente Fläche
- komplette Figur
- 3/4-Frontansicht
- neutrale Haltung
- dient als visuelle Referenz

### B. Portrait
- Kopf + Oberkörper
- Profilwahl
- Dialog-/Journalansichten

### C. In-Game Sprite
- vereinfachte, aber erkennbare Spielfigur
- gleiche Kleidung/Farben
- keine neue Interpretation

### D. Icon
- Kopf/Emblem
- kleine UI-Flächen

## 7. In-Game-Animation V1

V1 benötigt:
- idle front
- idle back
- idle left
- idle right
- walk front
- walk back
- walk left
- walk right

Für Walk zunächst 6 Frames pro Richtung.
Idle kann mit 2–4 Frames arbeiten.

Später:
- interact
- inspect
- celebrate
- sit
- ship-console

## 8. Assetgrößen

### Referenz/Master
- Portrait-Master: 1024 × 1024 px
- Full-Body-Master: 1536 × 2048 px
- transparent PNG/WebP

### Runtime
- Portrait: 512 × 512 WebP
- Icon: 128 × 128 WebP
- Spriteframes: Zielgröße 256 × 384 oder kleiner je nach finalem Kamera-Maßstab
- Spriteatlas statt einzelner Dateien

Mastergrafik nie direkt im Game laden.

## 9. Dateinamen

Beispiel:

```
charly_master_full_v1.png
charly_portrait_v1.webp
charly_icon_v1.webp
charly_sprite_v1.webp
charly_sprite_v1.json
```

Analog für Philipp und Olli.

## 10. Louis

Louis erhält:
- Master Full Body
- Portrait
- Icon
- Sprite/Animation
- Sprach-/Mikrofon-Statusreaktionen

Louis muss auch ohne Namensschild sofort erkennbar sein.

Finales Design:
- Haustier-/Aliencharakter
- warme, sympathische Form
- markantes Halsband/Kommunikationsmodul
- keine generische Erd-Katze/Hund-Kopie
- sichtbare Reaktion auf Zuhören, Sprechen, Freude, Nachdenken

## 11. Freigabeprozess

1. Master-Referenz erstellen
2. Charly/Philipp/Olli nebeneinander vergleichen
3. Louis daneben prüfen
4. Stil-/Licht-/Detailgrad freigeben
5. Referenzbild unter `docs/design/reference/avatars/`
6. Eintrag in `docs/design/reference/ASSET_MANIFEST.md`
7. erst danach Runtime-Ableitungen erstellen

Keine Runtime-Variante darf stärker vom Master abweichen als technisch nötig.
