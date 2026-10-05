-- One fragrance of the day per user per (local) date. `cycle` counts passes through the
-- whole dataset: a fragrance isn't picked twice in the same cycle (see lib/daily.ts).

create table public.daily_picks (
    user_id uuid not null references auth.users (id) on delete cascade,
    pick_date date not null,
    fragrance_id text not null check (char_length(fragrance_id) between 1 and 100),
    cycle integer not null default 1 check (cycle >= 1),
    created_at timestamptz not null default now(),
    primary key (user_id, pick_date)
);

alter table public.daily_picks enable row level security;

create policy "Users can read their own daily picks"
    on public.daily_picks for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can add their own daily picks"
    on public.daily_picks for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
