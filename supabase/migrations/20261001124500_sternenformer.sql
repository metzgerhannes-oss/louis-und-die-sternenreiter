begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'creation_tier') then
    create type public.creation_tier as enum ('A', 'B', 'C', 'D');
  end if;
end
$$;

create table if not exists public.star_points (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.world_locations(id) on delete cascade,
  key text not null unique,
  title text not null,
  context_text text not null,
  creation_tier_max public.creation_tier not null,
  allowed_categories text[] not null default '{}'::text[],
  blocked_categories text[] not null default '{}'::text[],
  material_requirements jsonb not null default '{}'::jsonb,
  stardust_cost integer not null default 0 check (stardust_cost >= 0),
  canon_constraints jsonb not null default '{}'::jsonb,
  prepared_options jsonb not null default '[]'::jsonb,
  state text not null default 'active' check (state in ('locked', 'active', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.creation_blueprints (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null,
  title text not null,
  description text not null,
  creation_tier public.creation_tier not null,
  required_materials jsonb not null default '{}'::jsonb,
  stardust_cost integer not null default 0 check (stardust_cost >= 0),
  runtime_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.creations (
  id uuid primary key default gen_random_uuid(),
  star_point_id uuid not null references public.star_points(id) on delete cascade,
  profile_id uuid not null references public.player_profiles(id) on delete cascade,
  source_idea_id uuid references public.ideas(id) on delete set null,
  blueprint_id uuid references public.creation_blueprints(id) on delete set null,
  creation_tier public.creation_tier not null,
  title text not null,
  idea_text text not null,
  configuration jsonb not null default '{}'::jsonb,
  status text not null default 'built' check (status in ('planned', 'built', 'replaced')),
  created_at timestamptz not null default now()
);

create table if not exists public.companion_state (
  family_id uuid primary key references public.families(id) on delete cascade,
  unlocked_creation_tier public.creation_tier not null default 'A',
  harness_level integer not null default 1 check (harness_level >= 1),
  known_world_rules jsonb not null default '[]'::jsonb,
  story_memory jsonb not null default '{}'::jsonb,
  cosmetic_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.star_points enable row level security;
alter table public.creation_blueprints enable row level security;
alter table public.creations enable row level security;
alter table public.companion_state enable row level security;

create policy "authenticated can read star points"
on public.star_points for select
to authenticated
using (true);

create policy "authenticated can read creation blueprints"
on public.creation_blueprints for select
to authenticated
using (true);

create policy "members can read creations"
on public.creations for select
to authenticated
using (
  exists (
    select 1
    from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can create creations"
on public.creations for insert
to authenticated
with check (
  exists (
    select 1
    from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can read companion state"
on public.companion_state for select
to authenticated
using (public.is_family_member(family_id));

create policy "members can update companion state"
on public.companion_state for update
to authenticated
using (public.is_family_member(family_id))
with check (public.is_family_member(family_id));

commit;
