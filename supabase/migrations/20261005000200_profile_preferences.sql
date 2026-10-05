-- Display and accessibility preferences. The app validates the shape (lib/preferences.ts),
-- so unknown or missing keys fall back to defaults.

alter table public.profiles
    add column preferences jsonb not null default '{}'::jsonb
    check (jsonb_typeof(preferences) = 'object');
