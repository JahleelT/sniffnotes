-- Peer-reviewed descriptions: people suggest rewrites, others vote, and a suggestion with enough
-- net votes becomes the description shown on the fragrance page (threshold lives in lib/descriptions.ts).

create table public.description_suggestions (
    id uuid primary key default gen_random_uuid(),
    fragrance_id text not null check (char_length(fragrance_id) between 1 and 100),
    user_id uuid not null references auth.users (id) on delete cascade,
    body text not null check (char_length(btrim(body)) between 40 and 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, fragrance_id)
);

create index description_suggestions_fragrance_idx on public.description_suggestions (fragrance_id);

create trigger description_suggestions_set_updated_at
    before update on public.description_suggestions
    for each row execute function public.set_updated_at();

create table public.description_votes (
    suggestion_id uuid not null references public.description_suggestions (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    value smallint not null check (value in (-1, 1)),
    created_at timestamptz not null default now(),
    primary key (suggestion_id, user_id)
);

alter table public.description_suggestions enable row level security;
alter table public.description_votes enable row level security;

create policy "Anyone can read description suggestions"
    on public.description_suggestions for select
    to anon, authenticated
    using (true);

create policy "Users can suggest descriptions"
    on public.description_suggestions for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can edit their suggestions"
    on public.description_suggestions for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can delete their suggestions"
    on public.description_suggestions for delete
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Anyone can read description votes"
    on public.description_votes for select
    to anon, authenticated
    using (true);

-- People vote as themselves, and never on their own suggestion.
create policy "Users can vote on others' suggestions"
    on public.description_votes for insert
    to authenticated
    with check (
        (select auth.uid()) = user_id
        and not exists (
            select 1 from public.description_suggestions s
            where s.id = suggestion_id and s.user_id = (select auth.uid())
        )
    );

create policy "Users can change their vote"
    on public.description_votes for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can remove their vote"
    on public.description_votes for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Editing a suggestion's text clears its votes: they were cast on the old wording.
-- Security definer because the editor can't otherwise delete other people's votes.
create function public.reset_description_votes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.body is distinct from old.body then
        delete from public.description_votes where suggestion_id = new.id;
    end if;
    return new;
end;
$$;

create trigger description_suggestions_reset_votes
    after update of body on public.description_suggestions
    for each row execute function public.reset_description_votes();
