begin;

create table if not exists public.crew_resources (
  family_id uuid primary key references public.families(id) on delete cascade,
  stardust integer not null default 0 check (stardust >= 0),
  scrap_parts integer not null default 0 check (scrap_parts >= 0),
  updated_at timestamptz not null default now()
);

alter table public.crew_resources enable row level security;

create policy "members can read crew resources"
on public.crew_resources for select
to authenticated
using (public.is_family_member(family_id));

create policy "members can update crew resources"
on public.crew_resources for update
to authenticated
using (public.is_family_member(family_id))
with check (public.is_family_member(family_id));

create policy "members can create crew resources"
on public.crew_resources for insert
to authenticated
with check (public.is_family_member(family_id));

commit;
