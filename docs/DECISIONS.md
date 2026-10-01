# Entscheidungen

## D-20261001-001 – Spielname
**Louis & die Sternenreiter**

## D-20261001-002 – Spielbare Profile
Charly, Philipp und Olli sind als eigene Profile mit eigenen Avataren vorgesehen.

## D-20261001-003 – Gemeinsamer Begleiter
Louis ist gemeinsamer Haustierbegleiter, Storyfigur, Vorlese-/Sprachschnittstelle und Ideenassistent.

## D-20261001-004 – Spielende
Die Hauptgeschichte besitzt sechs Kapitel und ein verbindliches Ende. Danach wird Freie Reisen freigeschaltet.

## D-20261001-005 – Hauptrenderer
Phaser ist Engine für das 2D/2.5D-Hauptspiel.

## D-20261001-006 – 3D
Babylon.js wird nur gezielt eingesetzt, insbesondere für Schiffskonfiguration und besondere Ansichten.

## D-20261001-007 – UI
React + TypeScript + Vite bilden App-Shell und klassische UI.

## D-20261001-008 – Backend
Supabase/PostgreSQL für Auth, Persistenz, Canon, Ideen und serverseitige Funktionen.

## D-20261001-009 – Creator-Sicherheit
Kinderideen dürfen niemals automatisch Canon werden.

## D-20261001-010 – Sprache
Vorlesen und Spracheingabe sind Kernfunktionen. Roh-Audio wird in V1 standardmäßig nicht dauerhaft gespeichert.

## D-20261001-011 – Gewalt
Keine dedizierte realistische Gewalt als Kernmechanik. Konflikte bevorzugen Entdecken, Helfen, Reparieren, Rätsel, Kommunikation und Ausweichen.

## D-20261001-012 – Architektur
Canon, Player State und Ideas sind getrennte Domänen.

## D-20261001-013 – Design-System
Das Produkt verwendet ein verbindliches Design-System unter `docs/design/`. Neue Screens dürfen nicht ohne Zuordnung zu einer bestehenden oder neu beschlossenen Layoutfamilie entstehen.

## D-20261001-014 – Avatar-Familie
Charly, Philipp und Olli verwenden dieselbe hochwertige 2.5D-Illustrationssprache mit gemeinsamen Grundproportionen, aber klar eigener Silhouette, Frisur, Patch und Profilakzent. Keine Mischung aus Pixelart, Chibi, Anime und Fotorealismus.

## D-20261001-015 – Avatar-Quelle
Jeder Avatar besitzt einen freigegebenen Master-Look. Portrait, Icon, In-Game-Sprite und Animationen werden daraus abgeleitet und dürfen nicht unabhängig neu interpretiert werden.

## D-20261001-016 – Asset-Freigabe
Freigegebene visuelle Referenzen werden unter `docs/design/reference/` dokumentiert. Spieloptimierte Runtime-Dateien liegen unter `public/assets/`. Der Status jedes zentralen Assets wird im `ASSET_MANIFEST.md` geführt.

## D-20261001-017 – Produktlayouts
V1 verwendet zehn definierte Layoutfamilien L01–L10 für Profilwahl, Game-HUD, Louis-Dialog, Creator, Sternenkarte, Journal, Schiff, Hangarausbau, Ergebnisse und Elternreview.
