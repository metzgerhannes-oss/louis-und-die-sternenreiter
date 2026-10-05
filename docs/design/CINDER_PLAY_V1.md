# CINDER 0.21 · Kapitel 2 als echtes Spielkapitel

## Ziel

Cinder soll nicht nur aus Orts-Hotspots und Dialogen bestehen. Kapitel 2 verbindet Erkundung, Figuren, technische Beobachtung, Entscheidungen und sichtbare Konsequenzen.

## Personenfokus

- Charly, Philipp, Olli und Louis sind in der Cinder-Weltansicht direkt anklickbar.
- Jede Figur reagiert abhängig vom aktuellen Kapitelzustand mit eigenen Gedanken.
- Rika ist als eigene anklickbare Figur in Staubhafen verankert.
- Wenn Rika in einem Storybeat beteiligt ist, erscheint sie auch in der Sprecherleiste und als große Fokusfigur im Dialog.
- Die Welt bleibt Kulisse; Figuren tragen die Handlung.

## Interaktive Hauptaktionen

### 1. Landung auf Cinder
Der Spieler wählt selbst einen Landeplatz:
- Rotorfeld: starke Wirbel / Staubwalze
- Leeseite der Mesa: sicher
- Salzfläche: rissiger heißer Untergrund

Falsche Entscheidungen erzeugen ein sichtbares Zwischenbild mit Wirkung und bleiben stehen, bis das Kind selbst weitergeht.

### 2. Kondensator-Diagnose
Die Story verrät die Ursache nicht mehr vorab.

Der Spieler kann selbst Messpunkte prüfen:
- Ansaugluft
- Tiefenrohr
- Kondensatorlamellen

Erst nach mindestens zwei Messungen kann eine Diagnose versucht werden.
Richtig ist: Wärme wird nicht ausreichend aus den Lamellen abgeführt.

Falsche Diagnosen erzeugen konkrete Gegenbeobachtungen statt „falsch“-Text:
- Wasserfilm am kalten Tiefenrohr widerlegt „keine Feuchtigkeit“
- hochgedrehter Lüfter erzeugt nur mehr roten Staub und widerlegt „zu wenig Wind“

### 3. Wasserweg durch den Canyon
Nach dem Fund von Sternenstaub folgt nicht sofort die große Formung.

Zuerst muss ein geeigneter Korridor gefunden werden:
- direkte Oberfläche: zu heiß / Boden arbeitet
- alter Wartungsgraben: erhöht, schattig, befestigt
- Canyonboden: Spuren seltener Sturzfluten

Erst nach dieser Erkundung wird der Sternenpunkt für die eigentliche Wasserverteilung freigegeben.

### 4. Impulsspule
Der Einbau ist keine einzelne Schaltfläche mehr.

Technisch richtige Reihenfolge:
1. Hauptstrom trennen
2. Haltering öffnen
3. Impulsspule einsetzen
4. Leistungskabel koppeln

Sichtbare Reihenfolge in der UI ist absichtlich anders.
Fehlversuche erzeugen Lichtbogen, Rückstoß oder Systemverriegelung.

## Konsequenzprinzip

Wie in Kapitel 1 gilt:

**Entscheidung → sichtbare Wirkung → lesen/verstehen → selbst „Weiter versuchen“ wählen**

Keine automatische Rückkehr, kein Game Over und kein dauerhafter Fortschrittsverlust.

## Weniger Führung

Nicht erlaubt:
- Lösung im Dialog vorwegnehmen
- richtige Reihenfolge sichtbar nummerieren
- richtigen Hotspot zusätzlich markieren
- Fehlermeldung, die direkt den nächsten richtigen Schritt nennt

## Testbarkeit

Die dauerhafte Kapitelauswahl aus TEST 0.20 bleibt bestehen. Cinder kann damit direkt am Kapitelanfang gestartet werden.

## Sichtbare Kennung

**H3 · CINDER 0.21**
