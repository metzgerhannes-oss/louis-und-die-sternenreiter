# Avatar System V1

Status: **freigegebene Designbasis**

## 1. Ziel

Charly, Philipp und Olli müssen:
- sofort unterscheidbar sein
- zur selben Welt gehören
- dieselbe grafische Qualität haben
- als Portrait und Spielfigur funktionieren
- später Outfits und Ausrüstung aufnehmen können

Louis verwendet dieselbe Illustrationssprache, bleibt aber eine eigene Companion-Familie.

## 2. Ensemble-Regel

Die Kerncrew besteht immer aus:
- Philipp
- Charly
- Olli
- Louis

Die Profilwahl ändert nur die aktive Spielfigur. Zentrale Gruppenbilder, Storysequenzen und Crew-Darstellungen zeigen grundsätzlich die vollständige Crew.

## 3. Stil

### Ziel
Hochwertige 2.5D-Illustration mit klarer Silhouette.

Mischung aus:
- handgemaltem Game-Art-Look
- leicht stilisierten Proportionen
- Space-Western-Kleidung
- Garage-Punk-Details
- warmer, leicht filmischer Beleuchtung

### Nicht verwenden
- Pixelart
- Chibi
- Anime-Gesichter
- fotorealistische Kinder
- austauschbare Cartoon-Avatare
- unterschiedliche Renderstile pro Kind

## 4. Proportion

Kinderfiguren:
- ca. 4,5–5 Köpfe hoch
- größere Hände/Füße nur leicht stilisiert
- Kopf groß genug für Wiedererkennung
- keine Babyproportionen

Größenrelation:
- Charly leicht größer als Philipp
- Olli sichtbar jünger / kleiner

## 5. Gemeinsame Basis

Alle drei:
- Sternenreiter-Jacke oder Overall
- Halstuch/Schal als markantes Element
- robuste Boots
- technischer Gürtel / Harness
- persönliches Abzeichen
- sichtbare Reparatur-/Patch-Details

## 6. Individuelle Identität

### Charly
- Akzent: Berry / warmes Magenta
- leicht größere Silhouette als Philipp
- subtil femininere Schnittführung / Haltung
- weichere Gesichtszüge
- eigener Patch
- Frisur und Gesichtsform klar individuell
- robust und abenteuerlich, nicht übertrieben „mädchenhaft“

### Philipp
- Akzent: Space Blue / Türkis
- technischere Details
- sportlich-schlanke Silhouette
- eigener Patch
- klar andere Frisur/Silhouette als Charly und Olli

### Olli
- Akzent: Amber / warmes Orange
- sichtbar jüngere / kleinere Silhouette
- robuste, freundliche Erscheinung
- eigener Patch
- klar eigene Kopf-/Frisurform

## 7. Avatar-Ausgaben

Jeder freigegebene Avatar benötigt:
- Master Full Body
- Portrait
- In-Game Sprite
- Icon

Alle Runtime-Varianten werden aus dem Master-Look abgeleitet.

## 8. In-Game-Animation V1

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
- companion interaction

## 9. Assetgrößen

### Referenz/Master
- Portrait-Master: 1024 × 1024 px
- Full-Body-Master: 1536 × 2048 px
- transparente PNG/WebP

### Runtime
- Portrait: 512 × 512 WebP
- Icon: 128 × 128 WebP
- Spriteframes: Zielgröße 256 × 384 oder kleiner je nach finalem Kamera-Maßstab
- Spriteatlas statt einzelner Dateien

Mastergrafik nie direkt im Game laden.

## 10. Louis

Louis erhält:
- Master Full Body
- Portrait
- Icon
- Sprite/Animation
- Sprach-/Mikrofon-Statusreaktionen
- Travel-Gear-Variante

Verbindliches finales Design:
- schlanker, athletischer Golden Retriever
- Fell goldbraun bis warm braun
- natürliche Retriever-Kopfform
- keine künstlichen Fellhörner / doppelten Büschel auf Stirn oder Krone
- markantes Tech-Halsband / Kommunikationsmodul
- modularer Explorer-Harness
- orange/amber leuchtende Statusmodule
- Planeten-/Sternenreiteremblem
- Reisecontainer, Sensorik und Beacon möglich
- sichtbar spaciger und technischer als ein normaler Haushund
- trotzdem warm, freundlich und eindeutig Haustier

Louis muss auch ohne Namensschild sofort erkennbar sein.

## 11. Freigabeprozess

1. Master-Referenz erstellen
2. Charly/Philipp/Olli nebeneinander vergleichen
3. Größenrelation prüfen
4. Louis daneben prüfen
5. Stil-/Licht-/Detailgrad freigeben
6. Referenz dokumentieren
7. Eintrag im Asset Manifest auf approved
8. erst danach Runtime-Ableitungen erstellen

Keine Runtime-Variante darf stärker vom Master abweichen als technisch nötig.
