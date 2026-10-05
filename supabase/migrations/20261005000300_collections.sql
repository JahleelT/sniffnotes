-- Saved fragrance collections. Every user gets four presets; they can add custom ones.
-- fragrance_id is the app's fragrance id (data/fragrances.json), not a database foreign key.

create type public.collection_kind as enum ('saved', 'wishlist', 'sampled', 'owned', 'custom');

create table public.collections (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    kind public.collection_kind not null default 'custom',
    name text not null check (char_length(btrim(name)) between 1 and 40),
    created_at timestamptz not null default now()
);

create index collections_user_id_idx on public.collections (user_id);
create unique index collections_one_preset_per_kind on public.collections (user_id, kind) where kind <> 'custom';
create unique index collections_unique_name on public.collections (user_id, lower(btrim(name)));

create table public.collection_items (
    collection_id uuid not null references public.collections (id) on delete cascade,
    fragrance_id text not null check (char_length(fragrance_id) between 1 and 100),
    added_at timestamptz not null default now(),
    primary key (collection_id, fragrance_id)
);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "Users can read their own collections"
    on public.collections for select
    to authenticated
    using ((select auth.uid()) = user_id);

-- Presets are created by the sign-up trigger, so users can only create, rename, or delete custom ones.
create policy "Users can create custom collections"
    on public.collections for insert
    to authenticated
    with check ((select auth.uid()) = user_id and kind = 'custom');

create policy "Users can rename their custom collections"
    on public.collections for update
    to authenticated
    using ((select auth.uid()) = user_id and kind = 'custom')
    with check ((select auth.uid()) = user_id and kind = 'custom');

create policy "Users can delete their custom collections"
    on public.collections for delete
    to authenticated
    using ((select auth.uid()) = user_id and kind = 'custom');

create policy "Users can read items in their collections"
    on public.collection_items for select
    to authenticated
    using (exists (
        select 1 from public.collections c
        where c.id = collection_id and c.user_id = (select auth.uid())
    ));

create policy "Users can add items to their collections"
    on public.collection_items for insert
    to authenticated
    with check (exists (
        select 1 from public.collections c
        where c.id = collection_id and c.user_id = (select auth.uid())
    ));

create policy "Users can remove items from their collections"
    on public.collection_items for delete
    to authenticated
    using (exists (
        select 1 from public.collections c
        where c.id = collection_id and c.user_id = (select auth.uid())
    ));

create function public.create_default_collections(target_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
    insert into public.collections (user_id, kind, name)
    values
        (target_user, 'saved', 'Sniff List'),
        (target_user, 'wishlist', 'Wishlist'),
        (target_user, 'sampled', 'Sampled'),
        (target_user, 'owned', 'Owned')
    on conflict do nothing;
$$;

-- Only the sign-up trigger should call this.
revoke execute on function public.create_default_collections(uuid) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name)
    values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 50));

    perform public.create_default_collections(new.id);
    return new;
end;
$$;

-- Give existing accounts their presets.
select public.create_default_collections(id) from auth.users;
