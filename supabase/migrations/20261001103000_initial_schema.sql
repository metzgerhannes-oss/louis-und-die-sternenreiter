begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'idea_status') then
    create type public.idea_status as enum (
      'draft',
      'needs_details',
      'submitted',
      'under_review',
      'changes_requested',
      'approved',
      'rejected',
      'implemented',
      'canon'
    );
  end if;
end
$$;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Sternenreiter-Familie',
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('parent', 'guardian')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null,
  slug text not null,
  avatar_id text,
  level integer not null default 1 check (level between 1 and 10),
  xp integer not null default 0 check (xp >= 0),
  active_chapter integer not null default 1 check (active_chapter between 1 and 6),
  speech_settings jsonb not null default '{"auto_read":true,"rate":1}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, slug)
);

create table if not exists public.world_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  scope text not null,
  category text not null,
  rule_text text not null,
  severity text not null check (severity in ('guideline', 'blocking')),
  created_at timestamptz not null default now()
);

create table if not exists public.world_locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text not null,
  chapter_min integer not null default 1,
  canon_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.story_chapters (
  chapter integer primary key check (chapter between 1 and 6),
  slug text not null unique,
  title text not null,
  summary text not null,
  unlock_data jsonb not null default '{}'::jsonb
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location_id uuid references public.world_locations(id) on delete set null,
  chapter integer not null check (chapter between 1 and 6),
  quest_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  profile_id uuid primary key references public.player_profiles(id) on delete cascade,
  completed_chapters integer[] not null default '{}'::integer[],
  unlocked_location_ids uuid[] not null default '{}'::uuid[],
  flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.player_profiles(id) on delete cascade,
  location_id uuid references public.world_locations(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.player_profiles(id) on delete cascade,
  idea_type text not null default 'free_world_idea',
  original_text text not null,
  structured_idea jsonb not null default '{}'::jsonb,
  status public.idea_status not null default 'draft',
  input_method text not null default 'text' check (input_method in ('text', 'voice')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idea_answers (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  question_key text not null,
  question_text text not null,
  answer_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.idea_reviews (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  decision text check (decision in ('approved', 'changes_requested', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.canon_revisions (
  id uuid primary key default gen_random_uuid(),
  source_idea_id uuid references public.ideas(id) on delete set null,
  revision_key text not null unique,
  summary text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_family_member(uuid) from public;
grant execute on function public.is_family_member(uuid) to authenticated;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.player_profiles enable row level security;
alter table public.world_rules enable row level security;
alter table public.world_locations enable row level security;
alter table public.story_chapters enable row level security;
alter table public.quests enable row level security;
alter table public.player_progress enable row level security;
alter table public.travel_log enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_answers enable row level security;
alter table public.idea_reviews enable row level security;
alter table public.canon_revisions enable row level security;

create policy "members can read their family"
on public.families for select
to authenticated
using (public.is_family_member(id));

create policy "members can read family membership"
on public.family_members for select
to authenticated
using (public.is_family_member(family_id));

create policy "members can read profiles"
on public.player_profiles for select
to authenticated
using (public.is_family_member(family_id));

create policy "members can update profiles"
on public.player_profiles for update
to authenticated
using (public.is_family_member(family_id))
with check (public.is_family_member(family_id));

create policy "authenticated can read world rules"
on public.world_rules for select
to authenticated
using (true);

create policy "authenticated can read world locations"
on public.world_locations for select
to authenticated
using (true);

create policy "authenticated can read story chapters"
on public.story_chapters for select
to authenticated
using (true);

create policy "authenticated can read quests"
on public.quests for select
to authenticated
using (true);

create policy "members can read progress"
on public.player_progress for select
to authenticated
using (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can update progress"
on public.player_progress for all
to authenticated
using (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
)
with check (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can manage travel log"
on public.travel_log for all
to authenticated
using (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
)
with check (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can read ideas"
on public.ideas for select
to authenticated
using (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can create ideas"
on public.ideas for insert
to authenticated
with check (
  exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can update unreviewed ideas"
on public.ideas for update
to authenticated
using (
  status in ('draft', 'needs_details', 'submitted')
  and exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
)
with check (
  status in ('draft', 'needs_details', 'submitted')
  and exists (
    select 1 from public.player_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "members can manage idea answers"
on public.idea_answers for all
to authenticated
using (
  exists (
    select 1
    from public.ideas i
    join public.player_profiles p on p.id = i.profile_id
    where i.id = idea_id
      and i.status in ('draft', 'needs_details', 'submitted')
      and public.is_family_member(p.family_id)
  )
)
with check (
  exists (
    select 1
    from public.ideas i
    join public.player_profiles p on p.id = i.profile_id
    where i.id = idea_id
      and i.status in ('draft', 'needs_details', 'submitted')
      and public.is_family_member(p.family_id)
  )
);

create policy "members can read idea reviews"
on public.idea_reviews for select
to authenticated
using (
  exists (
    select 1
    from public.ideas i
    join public.player_profiles p on p.id = i.profile_id
    where i.id = idea_id
      and public.is_family_member(p.family_id)
  )
);

create policy "authenticated can read canon revisions"
on public.canon_revisions for select
to authenticated
using (true);

commit;
