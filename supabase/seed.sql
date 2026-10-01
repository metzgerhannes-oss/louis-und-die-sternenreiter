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
