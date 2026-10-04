# Product Layouts V1

Status: **verbindliche Layoutfamilien**

Ziel: Nicht für jeden Screen ein neues Layout erfinden.

## L01 – Profile Select

Verwendung:
- Spielstart
- Profil wechseln

Struktur Desktop:
- Titel/Intro oben
- drei gleichwertige Avatar-Karten
- keine zusätzlichen Nebenmenüs

Mobile:
- Avatar-Karten untereinander
- Portrait links, Name/Status rechts

Hauptaktion:
- Profil auswählen

## L02 – Feste Spielszene / HUD

Verwendung:
- Hangar
- Planeten
- Stationen

Struktur:
- sehr schmale Kopfzeile
- große ungestörte Szenenillustration
- minimale Statusinformationen
- klickbare Hotspots direkt in der Illustration
- Interaktionshinweise nur dort, wo sie wirklich benötigt werden

Keine D-Pad-Steuerung und keine permanente große Menüleiste über der Szene.

## L03 – Louis Dialog

Verwendung:
- Storydialog
- Hilfe
- Vorlesen
- Creator-Einstieg

Struktur:
- Louis-Kennung
- kurze Überschrift
- Text
- Audioaktion
- maximal 1–2 primäre Antworten
- sekundäre Aktion „Zurück/Weiter“

Mobile:
- Bottom-Sheet oder nahezu vollflächiges Panel
- kein winziges Desktop-Modal

## L04 – Creator / Ideenbuch

Verwendung:
- Idee erzählen
- Rückfragen
- Review

Struktur:
- Louis-Prompt
- großes Texteingabefeld
- Mikrofon direkt daneben
- Fortschritt „Frage x von y“
- explizite Review-Seite
- Bestätigung vor Speichern

Keine Entwicklerbegriffe wie GitHub, Issue, JSON, Canon im Kinderbereich.

## L05 – Sternenkarte / Reiseauswahl

Struktur:
- Karte als Hauptfläche
- Zielinformationen als Seiten-/Bottompanel
- erreichte und noch gesperrte Pfade visuell unterscheidbar
- eine primäre Aktion „Reise starten“

Keine Kartenliste zusätzlich zur Karte, solange nicht für Accessibility nötig.

## L06 – Quest / Reisejournal

Struktur:
- aktuelles Ziel oben
- darunter Ereignisse/Entdeckungen
- Vorlesen pro Eintrag
- eigene Ideen/Entdeckungen klar getrennt von offiziellen Missionen

## L07 – Schiff / Upgrade

Struktur:
- Schiff als visuelles Zentrum
- Modulslots um/unter dem Schiff
- rechte Seitenleiste Desktop / Bottom-Sheet Mobile
- Werte nur dort, wo sie Entscheidungen helfen

## L08 – Hangar Ausbau

Struktur:
- Hangaransicht
- anklickbare Bereiche
- Ausbauoptionen in Kontextpanel
- Vorschau vor Bestätigung

## L09 – Ergebnis / Kapitelabschluss

Struktur:
- klare große Aussage
- 3–5 relevante Ergebnisse
- neue Freischaltung
- eine nächste Hauptaktion

Keine lange Statistiktafel für Kinder.

## L10 – Eltern / Review

Verwendung:
- Kinderideen prüfen
- Anpassungen
- Freigabe

Darstellung darf technischer sein als Kinderbereich.

Struktur:
- Originalidee unverändert
- Louis-Rückfragen
- strukturierte Fassung
- Weltregelprüfung
- eigene Anpassung
- Freigeben / Änderung anfordern / Ablehnen

## Responsive-Grundregel

Breakpoint-Logik:
- Compact: < 680 px
- Medium: 680–1024 px
- Wide: > 1024 px

Nicht alle Komponenten brauchen eigene Breakpoints. Die Layoutfamilie entscheidet.

## Screen-Neuanlage

Jeder neue Screen muss im PR angeben:

```
Layout family: Lxx
Primary action:
Secondary actions:
Mobile behavior:
Speech behavior:
```

Wenn keine bestehende Layoutfamilie passt, muss zuerst PRODUCT_LAYOUTS_V1 erweitert werden.
