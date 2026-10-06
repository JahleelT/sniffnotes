-- Friends: public usernames, friend requests, and collections shared with friends.

-- Usernames are public handles (lowercase letters, numbers, underscores) used to find people.
alter table public.profiles
    add column username text unique
    check (username ~ '^[a-z0-9_]{3,20}$');

-- Requests go requester → addressee; accepting flips status. One row per pair, either direction.
create table public.friendships (
    requester_id uuid not null references auth.users (id) on delete cascade,
    addressee_id uuid not null references auth.users (id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    created_at timestamptz not null default now(),
    responded_at timestamptz,
    primary key (requester_id, addressee_id),
    check (requester_id <> addressee_id)
);

create unique index friendships_one_per_pair on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

create policy "People can see their own friendships and requests"
    on public.friendships for select
    to authenticated
    using ((select auth.uid()) in (requester_id, addressee_id));

create policy "People can send friend requests"
    on public.friendships for insert
    to authenticated
    with check ((select auth.uid()) = requester_id and status = 'pending');

create policy "People can accept requests sent to them"
    on public.friendships for update
    to authenticated
    using ((select auth.uid()) = addressee_id)
    with check ((select auth.uid()) = addressee_id and status = 'accepted');

-- Declining, cancelling, and unfriending all delete the row.
create policy "Either person can end a friendship or request"
    on public.friendships for delete
    to authenticated
    using ((select auth.uid()) in (requester_id, addressee_id));

create function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and ((f.requester_id = a and f.addressee_id = b) or (f.requester_id = b and f.addressee_id = a))
    );
$$;

-- Collections: owners choose which ones friends can see.
alter table public.collections
    add column shared_with_friends boolean not null default true;

create policy "Friends can read shared collections"
    on public.collections for select
    to authenticated
    using (shared_with_friends and public.are_friends((select auth.uid()), user_id));

create policy "Friends can read items in shared collections"
    on public.collection_items for select
    to authenticated
    using (exists (
        select 1 from public.collections c
        where c.id = collection_id
          and c.shared_with_friends
          and public.are_friends((select auth.uid()), c.user_id)
    ));

-- Owners can now update any of their collections (to toggle sharing); a trigger keeps presets'
-- names and every collection's kind fixed, replacing the old custom-only update policy.
drop policy "Users can rename their custom collections" on public.collections;

create policy "Users can update their own collections"
    on public.collections for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create function public.protect_collection_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.kind <> old.kind or new.user_id <> old.user_id then
        raise exception 'A collection''s kind and owner can''t change';
    end if;
    if old.kind <> 'custom' and new.name <> old.name then
        raise exception 'Preset collections can''t be renamed';
    end if;
    return new;
end;
$$;

create trigger collections_protect_identity
    before update on public.collections
    for each row execute function public.protect_collection_identity();

-- Public profile info (no preferences): for review bylines and profile pages.
drop function public.display_names(uuid[]);

create function public.public_profiles(user_ids uuid[])
returns table (id uuid, username text, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
    select p.id, p.username, p.display_name from public.profiles p where p.id = any (user_ids);
$$;

create function public.profile_by_username(handle text)
returns table (id uuid, username text, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
    select p.id, p.username, p.display_name from public.profiles p where p.username = lower(handle);
$$;

-- Finding people to befriend: signed-in only, by username prefix or display name, people with usernames only.
create function public.find_profiles(search text)
returns table (id uuid, username text, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
    select p.id, p.username, p.display_name
    from public.profiles p
    where p.username is not null
      and p.id <> (select auth.uid())
      and char_length(btrim(search)) >= 2
      and (p.username like lower(btrim(search)) || '%' or p.display_name ilike '%' || btrim(search) || '%')
    order by p.username
    limit 10;
$$;

grant execute on function public.public_profiles(uuid[]) to anon, authenticated;
grant execute on function public.profile_by_username(text) to anon, authenticated;
revoke execute on function public.find_profiles(text) from public, anon;
grant execute on function public.find_profiles(text) to authenticated;
