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

## D-20261001-011 – Gewalt / Action
Keine blutige oder realistische Gewaltdarstellung. Kampf ist nicht der einzige Gameplay-Kern. Stilisiertes Action-Gameplay, technische Waffen und die feste Bordwaffe des Schiffes sind zulässig.

## D-20261001-012 – Architektur
Canon, Player State und Ideas sind getrennte Domänen.

## D-20261001-013 – Design-System
Das Produkt verwendet ein verbindliches Design-System unter `docs/design/`. Neue Screens dürfen nicht ohne Zuordnung zu einer bestehenden oder neu beschlossenen Layoutfamilie entstehen.

## D-20261001-014 – Avatar-Familie
Charly, Philipp und Olli verwenden dieselbe hochwertige 2.5D-Illustrationssprache mit klar eigener Silhouette, Frisur, Patch und Profilakzent.

## D-20261001-015 – Avatar-Quelle
Jeder Avatar besitzt einen freigegebenen Master-Look. Portrait, Icon, In-Game-Sprite und Animationen werden daraus abgeleitet und dürfen nicht unabhängig neu interpretiert werden.

## D-20261001-016 – Asset-Freigabe
Freigegebene visuelle Referenzen werden unter `docs/design/reference/` dokumentiert. Spieloptimierte Runtime-Dateien liegen unter `public/assets/`.

## D-20261001-017 – Produktlayouts
V1 verwendet zehn definierte Layoutfamilien L01–L10.

## D-20261001-018 – Kerncrew ist immer vollständig
Philipp, Charly, Olli und Louis reisen immer gemeinsam. Die Profilwahl bestimmt nur die aktive Spielfigur und den persönlichen Fortschrittsfokus.

## D-20261001-019 – Größenrelation / Charly
Charly ist im Ensemble leicht größer als Philipp und deutlich größer als Olli. Ihre Gestaltung ist nur subtil femininer, ohne den robusten Sternenreiter-Look zu verlassen.

## D-20261001-020 – Louis Master
Louis ist ein schlanker, goldbrauner bis brauner Golden Retriever mit natürlicher Kopfform und deutlich sichtbarer modularer Sci-Fi-Explorer-Ausrüstung.

## D-20261001-021 – Starter-Schiff Master
Das Starter-Schiff besitzt überdimensionierte Haupttriebwerke und eine klar erkennbare schwenkbare Bordkanone. Beide Merkmale bleiben Teil der Silhouette und werden durch Upgrades weiterentwickelt.

## D-20261001-022 – Logo
Der Wortmarken-/Logo-Look aus dem freigegebenen Louis-Companion-Sheet ist verbindlich: klare Sans-Wortmarke, dünne Amber-Linie mit vierzackigem Stern, ruhige gesperrte Sekundärzeile.

## D-20261001-023 – Louis als Sternenformer
Louis ist der zentrale Story- und Gameplay-Drehpunkt. Sein Tech-Harness übersetzt Ideen der Kinder in strukturierte, ortsgebundene Weltveränderungen.

## D-20261001-024 – Sternenpunkte
Direkte freie Weltveränderungen erfolgen an definierten Sternenpunkten. Sternenpunkte besitzen Kontext, erlaubte Kategorien, Canon-Grenzen, Ressourcenbedarf und mögliche vorbereitete Lösungen.

## D-20261001-025 – Vier Formungsstufen
Louis unterscheidet: A Sofort formen, B materialgebunden bauen, C mit Sternenstaub sternenformen, D große Idee ins Ideenbuch / Review.

## D-20261001-026 – Louis ist Sternenformer 07
Die Identität „Sternenformer 07“ ist Canon, wird der Crew aber erst im späteren Storyverlauf vollständig erklärt.

## D-20261001-027 – Neue Hauptstory
Die Hauptgeschichte handelt davon, Louis' Formungsfähigkeit zu entdecken, verantwortungsvoll zu lernen und am Herz der Wege eine kontrollierte Ordnung für neue Ideen zu schaffen.

## D-20261001-028 – Sternenstaub
Sternenstaub ist eine reine In-Game-Formungsressource ohne Echtgeldbezug und wird für große ortsgebundene Veränderungen verwendet.

## D-20261001-029 – Gemeinsamer Storyfortschritt
Weil Philipp, Charly, Olli und Louis immer gemeinsam reisen, ist der Hauptstory-Fortschritt crewweit geteilt. Profilbezogen bleiben aktive Steuerung, persönliches XP/Level, Reisejournal und kosmetische Entwicklung. Ein abgeschlossenes Kapitel wird nicht pro Kind separat erneut gespielt.

## D-20261001-030 – Cinder / Staubhafen
Die erste fremde Welt ist Cinder. Die Siedlung Staubhafen und die Mechanikerin Rika führen das Wasserproblem ein. Zwei aufeinander aufbauende Sternenpunkte machen die Welt sichtbar veränderbar.

## D-20261001-031 – Sternenstaub-Lernmoment
Die Crew findet auf Cinder erstmals Sternenstaub. Der erste Cinder-Sternenpunkt kostet keinen Sternenstaub; der zweite ist die erste Stufe-C-Formung und verbraucht genau 1 Einheit. Sternenstaub ist crewweit geteilt.

## D-20261001-032 – Cinder bleibt verändert
Die gewählte Wasserlösung bleibt nach Abschluss sichtbar. Cinder bleibt besuchbar; das Antriebsupgrade öffnet den nächsten Pfad nach Moss.

## D-20261001-033 – Moss
Moss ist die zweite fremde Welt. Die Crew rettet Forschungsroboter M-4 und erhält das Scanner-Modul. Ein Sumpf-Sternenpunkt und eine Stufe-C-Bergung lehren, dass Louis Umwelt und bestehende Strukturen schützen muss.

## D-20261001-034 – Junction 12
Junction 12 ist die erste dicht belebte Station. Bram verwendet dort erstmals den Begriff „Sternenformer“ für Louis. Der reparierte Signalmast öffnet den unkartierten Pfad.

## D-20261001-035 – Leerer Pfad bleibt begrenzt
Am leeren Pfad darf Louis nur eine provisorische lokale Probe formen. Eine vollständige neue Welt darf niemals automatisch aus einer freien Kinderidee zu Canon werden; sie bleibt eine große Idee im Ideenbuch bis zur Freigabe.

## D-20261001-036 – Kapitel 4 ist die Weltregel-Lektion
Die Störung durch überlagerte Formungen wird nicht durch einen Gegner verursacht. Die Crew entwickelt mit Louis Regeln für Weltgrenzen und Sternenpfade.

## D-20261001-037 – Verlorene Welten
Glasküste und Wolkenozean liefern Navigationsfragmente. Der Schrottring enthält das Sternenformer-Archiv und enthüllt Louis als STERNENFORMER 07.

## D-20261001-038 – Finale ohne Boss
Das Herz der Wege ist ein System-/Ordnungsfinale. Die Crew stabilisiert Routen, Energie und die Leitlinie für künftige Formungen. Es gibt keinen klassischen Endgegner.

## D-20261001-039 – Freie Reisen nach echtem Ende
Nach dem Finale ist die Hauptgeschichte abgeschlossen. Freie Reisen schaltet alle besuchten Hauptwelten frei, ohne den Storyfortschritt zurückzusetzen.

## D-20261001-040 – Datengetriebener Rest der Hauptstory
Moss bis Herz der Wege verwenden eine gemeinsame AdventureScene und datengetriebene Story-/Sternenpunktdefinitionen. Neue Hauptwelten sollen nicht durch Kopieren kompletter Szenen implementiert werden.
