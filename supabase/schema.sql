create table if not exists public.app_state (
    id text primary key,
    data jsonb not null,
    updated_at timestamptz not null default now()
);

comment on table public.app_state is 'Estado único de la app de lavandería.';
