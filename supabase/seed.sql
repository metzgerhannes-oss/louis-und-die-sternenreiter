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
