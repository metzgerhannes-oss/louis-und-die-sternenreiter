# Kapitel 1 – PLAY 0.17 · Sichtbare Konsequenzen

## Ziel

Eine falsche Entscheidung darf nicht nur zu einem grauen Button oder einer Textmeldung führen. Der Spieler soll die Wirkung kurz in der Welt sehen und danach sofort weiterspielen können.

## Grundregel

**Fehlversuch → Zwischenbild → Wirkung → automatische Rückkehr**

Dauer: ca. 0,9 bis 1,3 Sekunden.

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
- die Zwischenbilder blockieren für ihre kurze Laufzeit weitere Eingaben und schließen automatisch

## Audio

Eigene Effektgruppen:
- failure-burst
- coolant-spray
- glitch
- alarm

Die Effekte bleiben kurz und deutlich unter der Sprachlautstärke.

## Release-Blocker

- falsche Entscheidung erzeugt nur Text oder grauen Button
- Zwischenbild bleibt länger als 1,3 Sekunden stehen
- Reaktion verrät direkt den nächsten richtigen Schritt
- Effekt verhindert die Rückkehr in die Aufgabe
- falsche Aktion verändert den Fortschritt dauerhaft
