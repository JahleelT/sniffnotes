-- Following brands. brand_slug is the app's brand slug (lib/brands.ts), not a foreign key.

create table public.brand_follows (
    user_id uuid not null references auth.users (id) on delete cascade,
    brand_slug text not null check (brand_slug ~ '^[a-z0-9-]{1,80}$'),
    created_at timestamptz not null default now(),
    primary key (user_id, brand_slug)
);

alter table public.brand_follows enable row level security;

-- Who follows what stays private; only totals are public (below).
create policy "Users can see the brands they follow"
    on public.brand_follows for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can follow brands"
    on public.brand_follows for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can unfollow brands"
    on public.brand_follows for delete
    to authenticated
    using ((select auth.uid()) = user_id);

create function public.brand_follower_counts()
returns table (brand_slug text, followers int)
language sql
stable
security definer
set search_path = ''
as $$
    select f.brand_slug, count(*)::int from public.brand_follows f group by f.brand_slug;
$$;

grant execute on function public.brand_follower_counts() to anon, authenticated;
