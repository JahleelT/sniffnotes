-- Fragrance news gathered from publications' RSS feeds (lib/news-core.ts).
-- Rows are written only with the secret key (which bypasses row-level security), so there are no write policies.

create table public.news_items (
    id uuid primary key default gen_random_uuid(),
    url text not null unique check (url ~ '^https?://'),
    title text not null check (char_length(title) between 1 and 300),
    source text not null,
    published_at timestamptz not null,
    -- A short plain-text excerpt; full articles stay on the publisher's site.
    summary text not null default '' check (char_length(summary) <= 600),
    image_url text check (image_url is null or image_url ~ '^https?://'),
    -- Brands (lib/brands.ts slugs) and fragrances (data ids) mentioned in the article.
    brand_slugs text[] not null default '{}',
    fragrance_ids text[] not null default '{}',
    fetched_at timestamptz not null default now()
);

create index news_items_published_idx on public.news_items (published_at desc);
create index news_items_brands_idx on public.news_items using gin (brand_slugs);
create index news_items_fragrances_idx on public.news_items using gin (fragrance_ids);

alter table public.news_items enable row level security;

create policy "Anyone can read news"
    on public.news_items for select
    to anon, authenticated
    using (true);

-- When scheduled jobs last ran, so the news page can show freshness and refresh when stale.
create table public.job_runs (
    name text primary key,
    last_run_at timestamptz not null,
    last_status text not null default ''
);

alter table public.job_runs enable row level security;

create policy "Anyone can see when jobs last ran"
    on public.job_runs for select
    to anon, authenticated
    using (true);
