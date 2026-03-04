# Shared Prototype Registry (Supabase)

## 1) Create table in Supabase

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.prototypes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  folder text not null,
  href text not null,
  notes text not null default '',
  created_by text not null default 'dashboard',
  created_at timestamptz not null default now()
);
```

## 2) Add Vercel Environment Variables

In Vercel project settings add:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key
- `PROTOTYPES_TABLE` = `prototypes` (optional, default is `prototypes`)

Redeploy after adding env vars.

## 3) How it works

- Dashboard reads shared data from `GET /api/prototypes`.
- `Новий прототип` modal sends data to `POST /api/prototypes`.
- If API/env is not available, dashboard falls back to `/prototypes.json` in read-only mode.

## 4) Optional seed data

If you want to migrate existing local data from `prototypes.json`, insert rows manually once, for example:

```sql
insert into public.prototypes (name, slug, status, folder, href, notes)
values ('Usecase selector', 'prototype', 'active', 'prototype/', '/prototype/', 'Variant 1 + Variant 2');
```
