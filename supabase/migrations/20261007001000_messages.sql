-- Direct messages. Friends can message freely; anyone else starts a message request, which the
-- recipient accepts or declines. Until accepted, a sender can send at most 3 messages.

create table public.messages (
    id uuid primary key default gen_random_uuid(),
    sender_id uuid not null references auth.users (id) on delete cascade,
    recipient_id uuid not null references auth.users (id) on delete cascade,
    body text not null check (char_length(btrim(body)) between 1 and 2000),
    created_at timestamptz not null default now(),
    read_at timestamptz,
    check (sender_id <> recipient_id)
);

create index messages_recipient_idx on public.messages (recipient_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id, created_at desc);

create table public.message_requests (
    sender_id uuid not null references auth.users (id) on delete cascade,
    recipient_id uuid not null references auth.users (id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
    created_at timestamptz not null default now(),
    responded_at timestamptz,
    primary key (sender_id, recipient_id)
);

create unique index message_requests_one_per_pair on public.message_requests (least(sender_id, recipient_id), greatest(sender_id, recipient_id));

-- The rule for whether `sender` may message `recipient` right now.
create function public.can_message(sender uuid, recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select case
        when sender = recipient then false
        when public.are_friends(sender, recipient) then true
        when exists (
            select 1 from public.message_requests r
            where r.status = 'accepted'
              and ((r.sender_id = sender and r.recipient_id = recipient) or (r.sender_id = recipient and r.recipient_id = sender))
        ) then true
        -- Replying to a request someone sent you is allowed (and accepts it, see the trigger below).
        when exists (
            select 1 from public.message_requests r
            where r.sender_id = recipient and r.recipient_id = sender and r.status = 'pending'
        ) then true
        when exists (
            select 1 from public.message_requests r
            where r.sender_id = sender and r.recipient_id = recipient and r.status = 'declined'
        ) then false
        else (select count(*) from public.messages m where m.sender_id = sender and m.recipient_id = recipient) < 3
    end;
$$;

alter table public.messages enable row level security;
alter table public.message_requests enable row level security;

create policy "People can read their own conversations"
    on public.messages for select
    to authenticated
    using ((select auth.uid()) in (sender_id, recipient_id));

create policy "People can send messages they're allowed to"
    on public.messages for insert
    to authenticated
    with check ((select auth.uid()) = sender_id and public.can_message(sender_id, recipient_id));

-- Recipients can mark messages read, and that's the only column anyone can change.
create policy "Recipients can mark messages read"
    on public.messages for update
    to authenticated
    using ((select auth.uid()) = recipient_id)
    with check ((select auth.uid()) = recipient_id);

revoke update on public.messages from authenticated;
grant update (read_at) on public.messages to authenticated;

create policy "People can see requests they sent or received"
    on public.message_requests for select
    to authenticated
    using ((select auth.uid()) in (sender_id, recipient_id));

create policy "Recipients can accept or decline requests"
    on public.message_requests for update
    to authenticated
    using ((select auth.uid()) = recipient_id)
    with check ((select auth.uid()) = recipient_id and status in ('accepted', 'declined'));

-- Keeps requests in step with messages: a first message to a non-friend opens a request,
-- and replying to a pending request accepts it.
create function public.track_message_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if public.are_friends(new.sender_id, new.recipient_id) then
        return new;
    end if;

    update public.message_requests
    set status = 'accepted', responded_at = now()
    where sender_id = new.recipient_id and recipient_id = new.sender_id and status = 'pending';

    insert into public.message_requests (sender_id, recipient_id)
    values (new.sender_id, new.recipient_id)
    on conflict do nothing;

    return new;
end;
$$;

create trigger messages_track_request
    after insert on public.messages
    for each row execute function public.track_message_request();

-- Live delivery: Supabase Realtime streams new rows to the people allowed to read them.
alter publication supabase_realtime add table public.messages;
