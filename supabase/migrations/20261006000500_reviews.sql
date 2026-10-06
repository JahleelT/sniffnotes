-- Fragrance reviews: a rating plus community performance and season votes.
-- These votes are where SniffNotes' longevity, sillage, and season data comes from.

create type public.season as enum ('spring', 'summer', 'fall', 'winter');

create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    fragrance_id text not null check (char_length(fragrance_id) between 1 and 100),
    rating smallint not null check (rating between 1 and 5),
    -- 1 very weak … 5 eternal
    longevity smallint check (longevity between 1 and 5),
    -- 1 intimate … 4 enormous
    sillage smallint check (sillage between 1 and 4),
    seasons public.season[] not null default '{}',
    body text not null default '' check (char_length(body) <= 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, fragrance_id)
);

create index reviews_fragrance_id_idx on public.reviews (fragrance_id);

create trigger reviews_set_updated_at
    before update on public.reviews
    for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
    on public.reviews for select
    to anon, authenticated
    using (true);

create policy "Users can write their own review"
    on public.reviews for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can edit their own review"
    on public.reviews for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can delete their own review"
    on public.reviews for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Per-fragrance averages and season counts. security_invoker keeps the reviews table's policies.
create view public.fragrance_review_stats
with (security_invoker = true) as
select
    fragrance_id,
    count(*)::int as review_count,
    round(avg(rating), 2)::float8 as avg_rating,
    round(avg(longevity), 2)::float8 as avg_longevity,
    count(longevity)::int as longevity_votes,
    round(avg(sillage), 2)::float8 as avg_sillage,
    count(sillage)::int as sillage_votes,
    count(*) filter (where cardinality(seasons) > 0)::int as season_votes,
    count(*) filter (where 'spring' = any (seasons))::int as spring,
    count(*) filter (where 'summer' = any (seasons))::int as summer,
    count(*) filter (where 'fall' = any (seasons))::int as fall,
    count(*) filter (where 'winter' = any (seasons))::int as winter
from public.reviews
group by fragrance_id;

-- Profiles stay private (they hold preferences); this exposes only display names, for review bylines.
create function public.display_names(user_ids uuid[])
returns table (id uuid, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
    select p.id, p.display_name from public.profiles p where p.id = any (user_ids);
$$;

grant execute on function public.display_names(uuid[]) to anon, authenticated;
