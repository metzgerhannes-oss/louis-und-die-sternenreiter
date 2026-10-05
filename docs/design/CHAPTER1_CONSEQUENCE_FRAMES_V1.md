# Kapitel 1 – PLAY 0.17 · Sichtbare Konsequenzen

## Ziel

Eine falsche Entscheidung darf nicht nur zu einem grauen Button oder einer Textmeldung führen. Der Spieler soll die Wirkung kurz in der Welt sehen und danach sofort weiterspielen können.

## Grundregel

**Fehlversuch → Zwischenbild → Wirkung verstehen → Kind entscheidet selbst, wann es weitergeht**

Mindestanzeige: ca. 1,8 bis 2,0 Sekunden. Danach erscheint „Weiter versuchen“. Das Zwischenbild bleibt unbegrenzt stehen, bis das Kind selbst weitergeht.

Es gibt kein Game Over und keinen dauerhaften Verlust. Die Reaktion soll erklären, warum etwas nicht funktioniert hat, ohne die Lösung direkt vorzugeben.

## Reaktionen

### Energiezelle
- zu schwache Zelle: Anzeigen flackern und gehen wieder aus
- überhitzte Zelle: Funkenstoß, Rauch, Warnblitz
- Verriegelungsversuch ohne passende Kontakte: Halterung stößt die Zelle zurück

### Kühlleitung
- Drucktest zu früh: Kühlmittel schießt sichtbar aus der Leitung
- Dichtung zu früh: Dichtung rutscht weg
- Klemme unter Druck: Klemme springt sichtbar ab
- falscher Ventilzustand: Druckstoß

### Navigation
- instabiles Signal: Sternenkarte glitcht, Bild springt und Route bricht auseinander

### Systemtest
- falsche Hochfahrreihenfolge: roter Alarm, sichtbarer Systemabbruch, kurzer Ruck/Funkeneffekt

### Start
- Start ohne alle Freigaben: sichtbarer Startabbruch, Warnlicht und Triebwerksabbruch

## Bedienung

- falsche Aktionen bleiben nach dem Zwischenbild erneut anwählbar
- riskante Hauptaktionen werden nicht mehr einfach grau deaktiviert
- erledigte Schritte bleiben sichtbar abgeschlossen und verlieren nicht durch Disabled-Opacity ihre Lesbarkeit
- die Zwischenbilder blockieren zunächst weitere Eingaben; nach der Mindestzeit erscheint „Weiter versuchen“
- keine automatische Schließung: Lesen und Verstehen bestimmen die Dauer

## Audio

Eigene Effektgruppen:
- failure-burst
- coolant-spray
- glitch
- alarm

Die Effekte bleiben kurz und deutlich unter der Sprachlautstärke.

## Release-Blocker

- falsche Entscheidung erzeugt nur Text oder grauen Button
- Zwischenbild schließt automatisch oder lässt sich sofort durch einen Doppeltipp überspringen
- Reaktion verrät direkt den nächsten richtigen Schritt
- Effekt verhindert die Rückkehr in die Aufgabe
- falsche Aktion verändert den Fortschritt dauerhaft


## PLAY 0.18 – Lesedauer für Kinder

Die automatische Rückkehr aus PLAY 0.17 ist verworfen. Ein sichtbarer Effekt allein reicht nicht, wenn Text und Ursache verstanden werden sollen.

Ab 0.18:
- Effekt/Text bleiben stehen, bis das Kind selbst weitergeht.
- „Weiter versuchen“ erscheint erst nach 1,8–2,0 Sekunden.
- Vorher steht nur „Kurz anschauen …“.
- Ein Doppeltipp auf die ursprüngliche Aktion kann das Zwischenbild damit nicht sofort wegklicken.
- Es gibt keine maximale Lesedauer.
