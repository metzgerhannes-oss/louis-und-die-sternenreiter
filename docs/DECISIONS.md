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


## D-20261001-030 – Kostenfreie KI für Wünsche
Die freie Wunschinterpretation wird in V1 über Cloudflare Workers AI umgesetzt. Es gibt keinen automatischen kostenpflichtigen KI-Fallback. Wird ein kostenloses Kontingent oder ein technisches Limit erreicht, bleibt der Wunsch als Entwurf erhalten.

## D-20261001-031 – KI ist keine Spielautorität
Die KI darf ausschließlich ein validiertes `WishBlueprint` erzeugen. Canon, Ressourcen, Inventar, Freischaltungen, Formungsstufe und tatsächliche Weltänderungen werden ausschließlich durch deterministische Spielregeln entschieden.
