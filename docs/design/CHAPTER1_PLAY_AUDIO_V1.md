# Kapitel 1 – PLAY 0.14 · Interaktion & Audio

## Ziel

Kapitel 1 darf nicht nur aus Bild + Dialog + einem Abschlussklick bestehen. Technische Storyaktionen werden vom Spieler tatsächlich ausgeführt. Gleichzeitig gilt für Sprache und Sound: Natürlichkeit vor künstlicher Charaktertrennung.

## Interaktive Storyaktionen

Nach dem Dialog folgt bei allen technischen Hauptaktionen eine kurze Aufgabe:

1. **Energiezelle**
   - passende Zelle anhand Spannung/Zustand auswählen
   - Plus- und Massekontakt anschließen
   - Zelle verriegeln

2. **Kühlleitung**
   - Kühlmittelventil schließen
   - Reparaturklemme setzen
   - Riss abdichten
   - Drucktest starten
   - Reihenfolge ist verbindlich

3. **Navigation**
   - drei Signalbänder kalibrieren
   - Zielwerte in Toleranz bringen
   - Kurs Cinder speichern

4. **Systemtest**
   - Energiefluss prüfen
   - Kühlkreislauf prüfen
   - Navigation prüfen
   - Antrieb anschließend auf 10 % testen

5. **Start**
   - Crew sichern
   - Kabine verriegeln
   - Kurs Cinder bestätigen
   - Startsequenz auslösen

Der Intro-Dialog bleibt ohne Minispiel. „Dialog überspringen“ überspringt nur den Dialog und niemals die eigentliche technische Aufgabe.

## Stimmen

Die bisher starken Pitch-Manipulationen sind verworfen. Insbesondere Louis mit 0,72 und Olli mit 1,30 klangen auf iOS/Safari künstlich.

Ab PLAY 0.14:
- Kerncrew bleibt im Bereich 0,97–1,04 Pitch.
- Rollen unterscheiden sich primär durch native Systemstimme und leichtes Tempo.
- Die App erzwingt nicht mehr vier unterschiedliche Stimmen, wenn dadurch schlechtere/kompakte Stimmen gewählt werden.
- Eine gute Stimme darf von mehreren Rollen verwendet werden.
- Premium/Enhanced/Natural/Neural-Systemstimmen werden höher priorisiert.
- Compact/eSpeak/Festival-Stimmen werden abgewertet.

## Sound

- Hangar-Grundton deutlich leiser und weicher.
- keine lauten periodischen Beeps im Vordergrund.
- neue subtile Interaktionssounds für Schalter, Reparaturschritt, Fehler und System-bereit.
- separate Regler für Gesamtlautstärke, Hintergrund und Effekte.

## Abnahme

Release-Blocker:
- technische Hauptaktion kann weiterhin mit einem einzelnen Abschlussklick erledigt werden
- „Dialog überspringen“ überspringt die Aufgabe
- Kerncrew-Pitch außerhalb 0,95–1,05
- Interaktionsdialog passt im Querformat nicht in ein kleines iPhone
- eine Aufgabe ist ohne Drag-Geste nicht bedienbar
- Audio überdeckt Sprache
