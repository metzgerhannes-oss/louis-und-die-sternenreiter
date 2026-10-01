begin;

create table if not exists public.adventure_progress (
  family_id uuid primary key references public.families(id) on delete cascade,
  current_world text not null default 'moss',
  step_by_world jsonb not null default '{}'::jsonb,
  completed_worlds text[] not null default '{}'::text[],
  main_story_finished boolean not null default false,
  free_travel_unlocked boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.adventure_progress enable row level security;

create policy "family members can read adventure progress"
on public.adventure_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = adventure_progress.family_id
      and fm.user_id = auth.uid()
  )
);

create policy "family members can insert adventure progress"
on public.adventure_progress
for insert
to authenticated
with check (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = adventure_progress.family_id
      and fm.user_id = auth.uid()
  )
);

create policy "family members can update adventure progress"
on public.adventure_progress
for update
to authenticated
using (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = adventure_progress.family_id
      and fm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.family_members fm
    where fm.family_id = adventure_progress.family_id
      and fm.user_id = auth.uid()
  )
);

commit;
