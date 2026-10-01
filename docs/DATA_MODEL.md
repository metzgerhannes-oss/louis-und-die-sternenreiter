# Datenmodell V1

## Identität

### families
Eltern-/Familiencontainer.

### player_profiles
Spielprofile für Charly, Philipp und Olli sowie spätere Profile.

Wichtige Felder:
- id
- family_id
- display_name
- avatar_id
- level
- xp
- active_chapter
- speech_settings

## Welt / Canon

### world_rules
Maschinenlesbare Regeln mit Scope, Kategorie und Schweregrad.

### world_locations
Planeten, Stationen und Unterorte.

### world_characters
NPCs und wiederkehrende Figuren.

### story_chapters
Kapitel 1–6 inklusive Freischaltbedingungen.

### quests
Missionen.

### quest_steps
Einzelne Missionsschritte.

### canon_revisions
Versionierte offizielle Weltänderungen.

## Progression

### player_progress
Kapitel, XP, Freischaltungen.

### player_quests
Queststatus pro Profil.

### travel_log
Besuchte Orte und Reiseereignisse.

### ships
Schiffzustand pro Profil bzw. nach späterer Produktentscheidung als gemeinsames oder persönliches Schiff.

### ship_modules
Katalog möglicher Module.

### player_ship_modules
Installierte Module.

### hangars
Ausbauzustand des Hangars.

### companions
Louis-Zustand/optionale kosmetische Progression.

## Creator

### ideas
Originalidee, Status, Typ, Profilbezug.

### idea_answers
Antworten auf Louis-Rückfragen.

### idea_reviews
Erwachsenenreview, Änderungen und Entscheidung.

### idea_links
Verknüpfung zu GitHub-Issue, PR und Canon-Revision.

## Datenschutz

Roh-Audio ist kein Bestandteil des V1-Datenmodells.
