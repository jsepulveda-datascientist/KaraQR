-- =========
-- KARAQR DB
-- =========

-- UUID (en Supabase suele estar activo, pero por si acaso):
create extension if not exists "pgcrypto";

-- 1) Enum de estado de la cola
do $$
begin
  if not exists (select 1 from pg_type where typname = 'queue_status') then
    create type queue_status as enum ('waiting','called','performing','done');
  end if;
end$$;

-- 2) Tenants (boliches)
create table if not exists public.tenants (
  id           text primary key,                 -- ej: 'default', 'boliche_x'
  display_name text not null,
  primary_hex  text default '#00B8FF',
  accent_hex   text default '#FF3FA4',
  logo_url     text,
  created_at   timestamptz not null default now()
);

-- 3) Cola de karaoke
create table if not exists public.queue (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   text not null references public.tenants(id) on delete cascade,
  name        text not null,         -- nombre de la persona
  title_raw   text not null,         -- texto libre: "Artista - Canción" o lo que escriba
  youtube_url text,                  -- opcional (puede venir vacío)
  status      queue_status not null default 'waiting',
  created_at  timestamptz not null default now()
);

-- Índices útiles
create index if not exists idx_queue_tenant_status_created
  on public.queue (tenant_id, status, created_at asc);
create index if not exists idx_queue_tenant_created
  on public.queue (tenant_id, created_at asc);

-- 4) RLS (Row Level Security)
alter table public.tenants enable row level security;
alter table public.queue   enable row level security;

-- *** PROTOTIPO (simple): políticas abiertas para rol 'anon' ***
--    Filtra por tenant_id desde el frontend.
do $$
begin
  -- Tenants
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenants' and policyname='tenants_select_public') then
    create policy "tenants_select_public" on public.tenants
      for select to anon using (true);
  end if;

  -- Queue: leer
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='queue' and policyname='queue_select_public') then
    create policy "queue_select_public" on public.queue
      for select to anon using (true);
  end if;

  -- Queue: insertar (join)
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='queue' and policyname='queue_insert_public') then
    create policy "queue_insert_public" on public.queue
      for insert to anon with check (true);
  end if;

  -- Queue: actualizar estado (admin simple en prototipo)
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='queue' and policyname='queue_update_public') then
    create policy "queue_update_public" on public.queue
      for update to anon using (true) with check (true);
  end if;
end$$;

-- 5) RPC: llamar al siguiente
-- Marca 'performing' actual como 'done' y promueve el primer 'waiting' a 'performing'
create or replace function public.karaqr_call_next(p_tenant text)
returns void
language plpgsql
as $$
begin
  update public.queue
     set status = 'done'
   where tenant_id = p_tenant
     and status = 'performing';

  update public.queue
     set status = 'performing'
   where id = (
     select id
       from public.queue
      where tenant_id = p_tenant
        and status = 'waiting'
      order by created_at asc
      limit 1
   );
end;
$$;

-- 6) Seed básico
insert into public.tenants (id, display_name, primary_hex, accent_hex, logo_url)
values ('default','KaraQR – Demo','#00B8FF','#FF3FA4', null)
on conflict (id) do nothing;

-- ejemplo: un par de filas de prueba
insert into public.queue (tenant_id, name, title_raw, youtube_url, status)
values
('default','Carla','Alanis Morissette - Ironic','https://www.youtube.com/watch?v=Jne9t8sHpUc','performing'),
('default','Diego','Oasis - Wonderwall',null,'waiting'),
('default','Paula','The Cranberries - Zombie',null,'waiting')
on conflict do nothing;


-- Pausar/retomar: performing <-> called
create or replace function karaqr_toggle_pause(p_tenant text)
returns void language plpgsql as $$
begin
  update public.queue
     set status = case when status='performing' then 'called' else 'performing' end
   where id = (
     select id from public.queue
      where tenant_id = p_tenant and status in ('performing','called')
      order by created_at asc limit 1
   );
end$$;


