-- Local/demo seed data. This file is not production identity provisioning.

insert into public.families (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Sternenreiter-Familie')
on conflict (id) do nothing;

insert into public.player_profiles (
  id, family_id, display_name, slug, avatar_id, level, xp, active_chapter
)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Charly', 'charly', 'charly-default', 1, 0, 1),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Philipp', 'philipp', 'philipp-default', 1, 0, 1),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Olli', 'olli', 'olli-default', 1, 0, 1)
on conflict (id) do nothing;

insert into public.story_chapters (chapter, slug, title, summary)
values
  (1, 'der-alte-hangar', 'Der alte Hangar', 'Louis, der Hangar und das alte Schiff werden entdeckt und flugfähig gemacht.'),
  (2, 'die-ersten-sterne', 'Die ersten Sterne', 'Cinder, Moss und Junction 12 öffnen die ersten Wege.'),
  (3, 'der-rand', 'Der Rand', 'Unkartierte Sternenpfade und eigene Reiseideen werden Teil des Abenteuers.'),
  (4, 'das-verschwundene-signal', 'Das verschwundene Signal', 'Die Wahrheit über die Abschaltung des Herzens der Wege wird sichtbar.'),
  (5, 'die-verlorenen-welten', 'Die verlorenen Welten', 'Glasküste, Wolkenozean und Schrottring führen zum Zentrum.'),
  (6, 'das-herz-der-wege', 'Das Herz der Wege', 'Das Sternenpfad-Netz wird verantwortungsvoll neu gestartet.')
on conflict (chapter) do update
set title = excluded.title,
    summary = excluded.summary;

insert into public.world_rules (rule_key, scope, category, rule_text, severity)
values
  ('violence-core', 'global', 'violence', 'Keine dedizierte realistische Gewalt als Kernmechanik.', 'blocking'),
  ('creator-no-auto-canon', 'creator', 'canon', 'Kinderideen werden niemals automatisch Canon.', 'blocking'),
  ('story-finale-ch6', 'story', 'canon', 'Das Herz der Wege ist vor Kapitel 6 nicht erreichbar.', 'blocking'),
  ('visual-diy', 'global', 'design', 'Technik wirkt sichtbar gebaut, repariert und individualisiert.', 'guideline'),
  ('speech-access', 'global', 'accessibility', 'Spielrelevante Informationen sollen visuell und auditiv zugänglich sein.', 'guideline')
on conflict (rule_key) do update
set rule_text = excluded.rule_text,
    severity = excluded.severity;


-- Sternenformer / Chapter 1
insert into public.world_locations (id, slug, name, kind, chapter_min, canon_data)
values (
  '00000000-0000-0000-0000-000000001001',
  'hangar-3',
  'Hangar 3',
  'hangar',
  1,
  '{"home_base":true,"crew":["philipp","charly","olli","louis"]}'::jsonb
)
on conflict (id) do update
set canon_data = excluded.canon_data;

insert into public.star_points (
  id,
  location_id,
  key,
  title,
  context_text,
  creation_tier_max,
  allowed_categories,
  blocked_categories,
  material_requirements,
  stardust_cost,
  canon_constraints,
  prepared_options,
  state
)
values (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000001001',
  'hangar-energy-distributor',
  'Der tote Energieverteiler',
  'Die Werkbank bekommt keinen Strom. Ein alter Anschluss ist vorhanden, aber die Verbindung fehlt.',
  'B',
  array['energy','repair','utility'],
  array['story_skip','hangar_destruction'],
  '{"scrap_parts":1}'::jsonb,
  0,
  '{"preserve_hangar":true,"must_power_workbench":true}'::jsonb,
  '[
    {"id":"cable-bridge","title":"Kabelbrücke"},
    {"id":"distributor-bot","title":"Verteilerroboter"},
    {"id":"wall-conduit","title":"Wandleitung"}
  ]'::jsonb,
  'active'
)
on conflict (key) do update
set
  title = excluded.title,
  context_text = excluded.context_text,
  prepared_options = excluded.prepared_options,
  canon_constraints = excluded.canon_constraints;


insert into public.star_points (
  id,
  location_id,
  key,
  title,
  context_text,
  creation_tier_max,
  allowed_categories,
  blocked_categories,
  material_requirements,
  stardust_cost,
  canon_constraints,
  prepared_options,
  state
)
values (
  '00000000-0000-0000-0000-000000002002',
  '00000000-0000-0000-0000-000000001001',
  'hangar-gate-assist',
  'Das schwere Hangartor',
  'Der alte Torantrieb funktioniert, ist aber zu schwach für die verklemmten Segmente.',
  'B',
  array['mechanical','utility','hangar'],
  array['hangar_destruction','story_skip'],
  '{"scrap_parts":2}'::jsonb,
  0,
  '{"preserve_hangar":true,"must_open_gate":true}'::jsonb,
  '[
    {"id":"magnetic-rails","title":"Magnetische Führungsschienen"},
    {"id":"servo-pair","title":"Zwei Zusatzservos"},
    {"id":"counterweight","title":"Gegengewicht-System"}
  ]'::jsonb,
  'active'
)
on conflict (key) do update
set
  title = excluded.title,
  context_text = excluded.context_text,
  prepared_options = excluded.prepared_options,
  canon_constraints = excluded.canon_constraints;


-- Chapter 2A / Cinder
insert into public.world_locations (id, slug, name, kind, chapter_min, canon_data)
values
  (
    '00000000-0000-0000-0000-000000001010',
    'cinder',
    'Cinder',
    'planet',
    2,
    '{"biome":"rust_desert","settlement":"Staubhafen","next_route":"Moss"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000001011',
    'cinder-condensers',
    'Alte Kondensatorfelder',
    'site',
    2,
    '{"planet":"cinder","purpose":"water_capture"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000001012',
    'cinder-staubhafen',
    'Staubhafen',
    'settlement',
    2,
    '{"planet":"cinder","water_system":"damaged"}'::jsonb
  )
on conflict (id) do update
set canon_data = excluded.canon_data;

insert into public.star_points (
  id, location_id, key, title, context_text, creation_tier_max,
  allowed_categories, blocked_categories, material_requirements,
  stardust_cost, canon_constraints, prepared_options, state
)
values
  (
    '00000000-0000-0000-0000-000000002010',
    '00000000-0000-0000-0000-000000001011',
    'cinder-moisture-capture',
    'Wasser aus Cinders Luft',
    'Die alten Kondensatoren brauchen eine neue Methode, um Cinders kalte Nachtluft besser zu nutzen.',
    'B',
    array['water','repair','climate','utility'],
    array['settlement_destruction','story_skip'],
    '{"salvage_mesh":1}'::jsonb,
    0,
    '{"must_produce_water":true,"preserve_cinder_biome":true}'::jsonb,
    '[
      {"id":"night-fog-sails","title":"Nachtnebel-Fänger"},
      {"id":"deep-condenser","title":"Tiefenkondensator"},
      {"id":"wind-cooler","title":"Windkühler"}
    ]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002011',
    '00000000-0000-0000-0000-000000001012',
    'cinder-water-distribution',
    'Der Weg des Wassers',
    'Das gewonnene Wasser muss stabil durch den Canyon bis nach Staubhafen gelangen.',
    'C',
    array['water','infrastructure','transport','utility'],
    array['settlement_destruction','story_skip'],
    '{}'::jsonb,
    1,
    '{"must_reach_staubhafen":true,"preserve_canyon":true}'::jsonb,
    '[
      {"id":"gravity-tank","title":"Hochbehälter und Gefälleleitung"},
      {"id":"pressure-line","title":"Unterirdische Druckleitung"},
      {"id":"tank-crawler","title":"Tankläufer"}
    ]'::jsonb,
    'active'
  )
on conflict (key) do update
set
  title = excluded.title,
  context_text = excluded.context_text,
  stardust_cost = excluded.stardust_cost,
  prepared_options = excluded.prepared_options,
  canon_constraints = excluded.canon_constraints;

insert into public.crew_resources (family_id, stardust, scrap_parts)
values ('00000000-0000-0000-0000-000000000001', 0, 0)
on conflict (family_id) do nothing;


-- Main adventure worlds / Moss to Heart
insert into public.world_locations (id, slug, name, kind, chapter_min, canon_data)
values
  ('00000000-0000-0000-0000-000000001013', 'moss', 'Moss', 'planet', 2, '{"biome":"bioluminescent_swamp","next_route":"junction-12"}'::jsonb),
  ('00000000-0000-0000-0000-000000001014', 'junction-12', 'Junction 12', 'station', 2, '{"type":"market_station","first_starformer_term":true}'::jsonb),
  ('00000000-0000-0000-0000-000000001015', 'empty-path', 'Der leere Pfad', 'unmapped_path', 3, '{"creator_boundary":"provisional_only"}'::jsonb),
  ('00000000-0000-0000-0000-000000001016', 'distortion', 'Störungsknoten', 'route_anomaly', 4, '{"world_overlap":true}'::jsonb),
  ('00000000-0000-0000-0000-000000001017', 'glass-coast', 'Glasküste', 'planet', 5, '{"biome":"crystal_coast","route_fragment":1}'::jsonb),
  ('00000000-0000-0000-0000-000000001018', 'cloud-ocean', 'Wolkenozean', 'planet', 5, '{"biome":"cloud_ocean","route_fragment":2}'::jsonb),
  ('00000000-0000-0000-0000-000000001019', 'scrap-ring', 'Schrottring', 'wreck_field', 5, '{"starformer_archive":true}'::jsonb),
  ('00000000-0000-0000-0000-000000001020', 'heart-of-ways', 'Das Herz der Wege', 'central_station', 6, '{"finale":true,"starformer_07":true}'::jsonb)
on conflict (slug) do update
set
  name = excluded.name,
  kind = excluded.kind,
  chapter_min = excluded.chapter_min,
  canon_data = excluded.canon_data;

insert into public.star_points (
  id, location_id, key, title, context_text, creation_tier_max,
  allowed_categories, blocked_categories, material_requirements,
  stardust_cost, canon_constraints, prepared_options, state
)
values
  (
    '00000000-0000-0000-0000-000000002020',
    (select id from public.world_locations where slug = 'moss'),
    'moss-swamp-path',
    'Ein Weg durch den Leuchtsumpf',
    'Ein sicherer Weg muss die empfindliche Pflanzenwelt schützen.',
    'B',
    array['path','nature','utility'],
    array['biome_destruction','story_skip'],
    '{}'::jsonb,
    0,
    '{"preserve_biome":true}'::jsonb,
    '[{"id":"root-bridge","title":"Wurzelbrücke"},{"id":"floating-pads","title":"Schwimmende Trittinseln"},{"id":"cable-walk","title":"Seilpfad"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002021',
    (select id from public.world_locations where slug = 'moss'),
    'moss-robot-recovery',
    'Der versunkene Forschungsroboter',
    'M-4 muss geborgen werden, ohne die leuchtenden Wurzeln zu beschädigen.',
    'C',
    array['rescue','robot','nature'],
    array['biome_destruction','story_skip'],
    '{}'::jsonb,
    1,
    '{"preserve_roots":true,"recover_robot":true}'::jsonb,
    '[{"id":"soft-crane","title":"Weicher Rankenkran"},{"id":"air-cushions","title":"Luftkissen"},{"id":"magnetic-boom","title":"Magnetarm"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002022',
    (select id from public.world_locations where slug = 'junction-12'),
    'junction-signal-mast',
    'Der stumme Signalmast',
    'Junction 12 braucht ein klares Signal aus vorhandener Technik.',
    'B',
    array['signal','communication','repair'],
    array['story_skip'],
    '{}'::jsonb,
    0,
    '{"restore_signal":true}'::jsonb,
    '[{"id":"dish-array","title":"Antennenfächer"},{"id":"relay-kites","title":"Relais-Drachen"},{"id":"market-relay","title":"Markt-Relais"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002023',
    (select id from public.world_locations where slug = 'empty-path'),
    'empty-path-anchor',
    'Ein Anker im leeren Pfad',
    'Nur eine provisorische Probe darf direkt geformt werden; ganze neue Welten bleiben große Ideen.',
    'C',
    array['prototype','exploration'],
    array['auto_canon_world','story_skip'],
    '{}'::jsonb,
    1,
    '{"provisional_only":true,"no_auto_canon":true}'::jsonb,
    '[{"id":"ice-resonance","title":"Singendes Eis"},{"id":"cloud-island","title":"Wolkeninsel"},{"id":"giant-tree","title":"Riesenbaum-Probe"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002024',
    (select id from public.world_locations where slug = 'distortion'),
    'distortion-boundaries',
    'Vermischte Welten trennen',
    'Louis muss erkennen lernen, welche Formung zu welcher Welt gehört.',
    'C',
    array['world_rule','stability'],
    array['story_skip'],
    '{}'::jsonb,
    1,
    '{"separate_worlds":true}'::jsonb,
    '[{"id":"world-signatures","title":"Welten-Signaturen"},{"id":"anchor-beacons","title":"Ankerbaken"},{"id":"memory-map","title":"Erinnerungskarte"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002025',
    (select id from public.world_locations where slug = 'distortion'),
    'distortion-route-separation',
    'Überlagerte Sternenpfade',
    'Mehrere Routen müssen denselben Raum sicher teilen.',
    'C',
    array['route_rule','navigation','stability'],
    array['story_skip'],
    '{}'::jsonb,
    1,
    '{"separate_routes":true}'::jsonb,
    '[{"id":"one-active","title":"Ein aktiver Weg"},{"id":"layered-routes","title":"Wegeschichten"},{"id":"priority-gates","title":"Prioritätstore"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002026',
    (select id from public.world_locations where slug = 'glass-coast'),
    'glass-coast-bridge',
    'Die gebrochene Glasküste',
    'Die Kristallplatten bewegen sich und brauchen einen flexiblen Übergang.',
    'B',
    array['bridge','mobility','crystal'],
    array['crystal_destruction','story_skip'],
    '{}'::jsonb,
    0,
    '{"preserve_crystal_coast":true}'::jsonb,
    '[{"id":"flex-bridge","title":"Federbrücke"},{"id":"light-rails","title":"Lichtschienen"},{"id":"hover-sled","title":"Gleitschlitten"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002027',
    (select id from public.world_locations where slug = 'cloud-ocean'),
    'cloud-ocean-storm-sail',
    'Durch den Wolkensturm',
    'Die Crew muss die Sturmströmung nutzen statt sie zu bekämpfen.',
    'C',
    array['wind','travel','mobility'],
    array['storm_destruction','story_skip'],
    '{}'::jsonb,
    1,
    '{"use_storm_flow":true}'::jsonb,
    '[{"id":"storm-sail","title":"Sturmsegel"},{"id":"pressure-glider","title":"Druckgleiter"},{"id":"balloon-chain","title":"Ballonkette"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002028',
    (select id from public.world_locations where slug = 'scrap-ring'),
    'scrap-ring-archive',
    'Das versiegelte Archiv',
    'Nur das alte Archiv darf sicher mit Energie versorgt werden.',
    'B',
    array['archive','energy','repair'],
    array['wreck_overload','story_skip'],
    '{}'::jsonb,
    0,
    '{"protect_archive":true}'::jsonb,
    '[{"id":"pulse-cell","title":"Impulszelle"},{"id":"isolated-bus","title":"Isolierter Energiebus"},{"id":"ship-tether","title":"Schiffskabel"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002029',
    (select id from public.world_locations where slug = 'heart-of-ways'),
    'heart-route-isolation',
    'Die instabilen Routen',
    'Stabile und beschädigte Wege müssen getrennt werden.',
    'C',
    array['route_rule','finale','stability'],
    array['unsafe_global_activation'],
    '{}'::jsonb,
    1,
    '{"safe_reactivation":true}'::jsonb,
    '[{"id":"safe-first","title":"Sichere Wege zuerst"},{"id":"sector-gates","title":"Sektor-Tore"},{"id":"return-path","title":"Rückweg-Regel"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002030',
    (select id from public.world_locations where slug = 'heart-of-ways'),
    'heart-energy-balance',
    'Energie für die Galaxie',
    'Die Energie des Netzes muss fair und dynamisch verteilt werden.',
    'C',
    array['energy_rule','finale','stability'],
    array['unsafe_global_activation'],
    '{}'::jsonb,
    1,
    '{"protect_small_outposts":true}'::jsonb,
    '[{"id":"minimum-for-all","title":"Grundversorgung für alle"},{"id":"need-based","title":"Nach Bedarf"},{"id":"rotating-reserve","title":"Wandernde Reserve"}]'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000002031',
    (select id from public.world_locations where slug = 'heart-of-ways'),
    'heart-world-rules',
    'Was soll diese Galaxie sein?',
    'Die letzte Leitlinie muss bestehende Welten schützen und neue Ideen weiter erlauben.',
    'C',
    array['world_rule','finale','creator'],
    array['auto_canon_world','unsafe_global_activation'],
    '{}'::jsonb,
    1,
    '{"protect_existing_worlds":true,"allow_reviewed_new_ideas":true}'::jsonb,
    '[{"id":"protect-before-change","title":"Erst schützen, dann verändern"},{"id":"ask-before-big-change","title":"Bei großen Änderungen nachfragen"},{"id":"room-for-new","title":"Platz für Neues lassen"}]'::jsonb,
    'active'
  )
on conflict (key) do update
set
  title = excluded.title,
  context_text = excluded.context_text,
  creation_tier_max = excluded.creation_tier_max,
  stardust_cost = excluded.stardust_cost,
  canon_constraints = excluded.canon_constraints,
  prepared_options = excluded.prepared_options;

insert into public.adventure_progress (
  family_id,
  current_world,
  step_by_world,
  completed_worlds,
  main_story_finished,
  free_travel_unlocked
)
values (
  '00000000-0000-0000-0000-000000000001',
  'moss',
  '{}'::jsonb,
  '{}'::text[],
  false,
  false
)
on conflict (family_id) do nothing;
