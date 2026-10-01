# Audio, Vorlesen und Spracheingabe

## Grundsatz

Lesen darf keine zwingende Voraussetzung sein, um die Kernhandlung zu verstehen oder Louis eine kreative Idee mitzuteilen.

## Vorlesen

V1:
- zentrale SpeechService-Abstraktion
- Browser Speech Synthesis als kostenloser Fallback
- wichtige Story- und Charakterzeilen können später als vorproduzierte Audiodateien hinterlegt werden
- jeder relevante Text erhält eine Wiederholen-/Vorlesen-Funktion
- pro Profil: Auto-Vorlesen, Tempo und Lautstärke

## Louis

Louis ist die primäre Sprachschnittstelle:
- spricht Dialoge
- liest Missionshinweise vor
- wiederholt Aufgaben
- nimmt Ideen entgegen
- stellt strukturierende Rückfragen

## Spracheingabe

Der Nutzer kann bei Louis zwischen Schreiben und Sprechen wählen.

Ablauf:
1. Mikrofon aktivieren
2. Sprache erkennen
3. erkannten Text anzeigen
4. Kind bestätigt oder korrigiert
5. nur bestätigten Text weiterverwenden

## Datenschutzprinzip

Standardmäßig wird keine Roh-Audioaufnahme dauerhaft gespeichert.

Gespeichert werden nur:
- bestätigtes Transkript
- Eingabemethode
- nötige Metadaten für den Ideenvorgang

## Fallback

Wenn direkte Browser-Spracherkennung nicht verfügbar ist:
- normales Texteingabefeld
- System-Diktierfunktion der Gerätetastatur

## Spätere Option

Lokale/on-device Spracherkennung kann als getrennte Implementierung ergänzt werden. Die Domänenlogik darf nicht von einem einzelnen Speech-Anbieter abhängen.
