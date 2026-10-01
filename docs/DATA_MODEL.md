# Datenmodell V1

## Identität

### families
Eltern-/Familiencontainer.

### player_profiles
Spielprofile für Charly, Philipp und Olli.

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
Maschinenlesbare Weltregeln.

### world_locations
Planeten, Stationen, Hangarbereiche und Unterorte.

### world_characters
NPCs und wiederkehrende Figuren.

### story_chapters
Kapitel 1–6.

### quests
Missionen.

### quest_steps
Einzelne Missionsschritte.

### canon_revisions
Versionierte offizielle Weltänderungen.

## Louis / Sternenformer

### star_points
Definierte Stellen, an denen Louis Veränderungen vornehmen darf.

Felder:
- id
- location_id
- key
- title
- context_text
- creation_tier_max
- allowed_categories
- blocked_categories
- material_requirements
- stardust_cost
- canon_constraints
- prepared_options
- state

### creation_blueprints
Vorbereitete, wiederverwendbare Baulösungen.

Felder:
- id
- key
- category
- title
- description
- creation_tier
- required_materials
- stardust_cost
- runtime_payload

### creations
Tatsächlich gebaute / geformte Änderungen.

Felder:
- id
- star_point_id
- profile_id
- source_idea_id
- blueprint_id
- creation_tier
- title
- configuration
- status
- created_at

### companion_state
Louis' Fortschritt.

Felder:
- unlocked_creation_tier
- harness_level
- known_world_rules
- story_memory
- cosmetic_state

## Ressourcen

### materials
Materialkatalog.

### player_materials
Gesammelte Materialien pro Profil/Familie nach späterer Progressionsentscheidung.

### stardust_balance
Verfügbare Sternenenergie / Sternenstaub.

Sternenstaub ist reine Spielressource ohne Echtgeldbezug.

## Progression

### player_progress
Kapitel, XP, Freischaltungen.

### player_quests
Queststatus.

### travel_log
Besuchte Orte und Reiseereignisse.

### ships
Gemeinsames Crew-Schiff mit Ausbauzustand.

### ship_modules
Modulkatalog.

### player_ship_modules
Installierte Module.

### hangars
Hangar-Ausbauzustand.

## Creator / große Ideen

### ideas
Originalidee, Status, Typ, Profilbezug und vorgeschlagene Umsetzungsstufe.

### idea_answers
Louis-Rückfragen und bestätigte Antworten.

### idea_reviews
Erwachsenenreview.

### idea_links
Verknüpfung zu GitHub-Issue, PR und Canon-Revision.

## Trennung

- `star_points` definieren **wo** verändert werden darf.
- `creation_blueprints` definieren **was vorbereitet verfügbar** ist.
- `creations` dokumentieren **was tatsächlich gebaut wurde**.
- `ideas` halten freie Vorschläge fest.
- `canon_revisions` dokumentieren freigegebene dauerhafte Weltänderungen.

## Datenschutz

Roh-Audio ist kein Bestandteil des V1-Datenmodells.
