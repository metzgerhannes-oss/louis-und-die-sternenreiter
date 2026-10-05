# CREW ASSET AUDIT V1

## Golden Master

Verbindliche Identitätsreferenzen:
- Philipp: `public/assets/crew/philipp-portrait-v4.webp`
- Charlotte/Charly: `public/assets/crew/charly-portrait-v4.webp`
- Olli: `public/assets/crew/olli-portrait-v4.webp`
- Louis: `public/assets/crew/louis.webp`

## Prüfergebnis

### PASS
- HUD-/Profilportraits: verwenden direkt die vier Golden-Master-Dateien.
- Cinder Overview (freigegebene Rückenansicht): drei Kinder + Louis korrekt in Rollen/Farbcodes; Gesichter nicht sichtbar, daher nur als Rückenansicht freigegeben.
- Moss Overview (freigegebene Rückenansicht): drei Kinder + Louis korrekt in Rollen/Farbcodes; Gesichter nicht sichtbar, daher nur als Rückenansicht freigegeben.

### FAIL / neu erzeugen
- aktuelle Junction-12-Entwürfe: Philipp, Charly und Olli weichen sichtbar von den V4-Mastern ab; teilweise zusätzliche Figur in älteren Varianten.
- bestehende Hangar-Szenenbilder: zwar konsistente Farbcodes, aber Gesichter/Haare sind nicht die V4-Master; Louis wirkt in mehreren Bildern beagleartig/robotisch statt wie der freigegebene Golden Retriever.
- alle älteren Storyboard-/Collage-Entwürfe mit vier Kindern oder frei erfundenen Kinderfiguren.

## Neue Freigaberegel

Für jede neue Szene mit sichtbaren Gesichtern gilt:
1. exakt drei Kinder: Philipp, Charlotte/Charly, Olli
2. Gesicht und Frisur müssen visuell an den V4-Mastern erkennbar bleiben
3. Charly leicht größer als Philipp, Olli klar jünger/kleiner
4. Philipp: kurzes hell-/mittelbraunes Haar, Türkis/Blau
5. Charly: langes hellbraunes Haar, Berry/Magenta
6. Olli: glattes blondes Haar mit seitlichem Pony, Amber/Orange
7. Louis: schlanker hellbrauner Golden Retriever, natürliche Retriever-Kopfform
8. keine zusätzliche Kinderfigur
9. NPCs nur bei Storybedarf und räumlich klar von der Kerncrew getrennt

## Produktionsfolge ab jetzt

1. Junction 12 neu mit Golden-Master-Identitäten
2. Hangar-Bildsatz neu auf Golden-Master-Identitäten
3. Cinder/Moss Detailbilder nur aus den freigegebenen Rückenansichten + Golden-Master-Identitäten ableiten
4. danach Der leere Pfad, Störungsknoten, Glasküste, Wolkenozean, Schrottring, Herz der Wege

Kein neues Bild wird ingame übernommen, bevor diese Identitätsprüfung bestanden ist.


## Hand-/Anatomie-QA – verbindlicher Release-Blocker

Jede sichtbare menschliche Hand hat exakt **5 Fingerstrahlen: 4 Finger + 1 Daumen**.

Nicht zulässig:
- zusätzliche oder fehlende Finger, sofern nicht eindeutig durch Perspektive/Verdeckung erklärt
- doppelte Daumen
- verschmolzene, gegabelte oder unplausibel angeordnete Finger
- zusätzliche Hände oder unplausible Handgelenke
- Gesten, die nur durch anatomisch falsche Fingerzahl funktionieren

Vor jeder Bildfreigabe wird **jede sichtbare Hand einzeln geprüft**.

Aktueller Audit:
- **Cinder Overview:** PASS für Hand-QA; Rückenansicht, Hände nicht relevant sichtbar.
- **Moss Overview:** PASS für Hand-QA; Rückenansicht, Hände nicht relevant sichtbar.
- **V4-Portraits:** N/A; Hände nicht im Bild.
- **Junction-12/67-Bilder mit Handgeste:** FAIL; mehrere Hände sind anatomisch falsch bzw. nicht eindeutig fünfgliedrig. Diese Varianten sind verworfen.
- **ältere Hangar-Generationen:** nicht sicher freigebbar; Hände teils klein/angeschnitten. Da die Crew dort ohnehin nicht mehr den V4-Mastern entspricht, werden sie bei Neuproduktion komplett erneut geprüft.
- **alte Storyboard-/Collage-Entwürfe:** nicht als Runtime-Grafik verwenden.

Abnahmereihenfolge für neue Bilder:
1. exakt Philipp + Charlotte/Charly + Olli, NPC nur bei Storybedarf
2. V4-Identität
3. Größenverhältnis: Charlotte ca. 15 cm größer als Philipp, Olli jünger/kleiner
4. Louis schlanker hellbrauner Golden Retriever
5. **jede sichtbare Hand: 4 Finger + 1 Daumen**
6. erst danach Storyzustand, Licht, Welt und UI
