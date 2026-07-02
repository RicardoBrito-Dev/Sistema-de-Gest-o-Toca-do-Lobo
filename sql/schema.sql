-- ============================================================================
-- Sistema Toca do Lobo — Schema Completo + Migrações
-- Versão: 2.0 — Totalmente idempotente (seguro rodar mesmo com banco existente).
-- Cole tudo no SQL Editor do Supabase e clique em Run.
-- ============================================================================


-- ============================================================================
-- TABELA: settings
-- ============================================================================
create table if not exists settings (
  id text primary key default 'default',
  weapon_rental numeric not null default 40,
  field_fee_own numeric not null default 10,
  magazine_price numeric not null default 15,
  drink_price numeric not null default 5,
  team_drink_price numeric not null default 3,
  username text not null default 'admin',
  password text not null default 'toca2026'
);

-- Colunas adicionadas em versões posteriores
alter table settings add column if not exists pix_key text;
alter table settings add column if not exists pix_city text;
alter table settings add column if not exists team_discount_percent numeric not null default 40;
alter table settings add column if not exists socio_discount_percent numeric not null default 40;

alter table settings enable row level security;
drop policy if exists "anon all settings" on settings;
create policy "anon all settings" on settings for all using (true) with check (true);


-- ============================================================================
-- TABELA: attendance (presenças / comandas dos jogadores)
-- ============================================================================
create table if not exists attendance (
  id text primary key,
  name text not null,
  date text not null,
  has_weapon boolean not null default false,
  magazines integer not null default 0,
  drinks integer not null default 0,
  is_team boolean not null default false,
  paid boolean not null default false
);

-- Colunas adicionadas em versões posteriores
alter table attendance add column if not exists paid_at bigint;
alter table attendance add column if not exists payment_method text;
alter table attendance add column if not exists extras jsonb default '[]'::jsonb;
alter table attendance add column if not exists is_socio boolean not null default false;
alter table attendance add column if not exists cerveja integer not null default 0;
alter table attendance add column if not exists agua integer not null default 0;
alter table attendance add column if not exists refrigerante integer not null default 0;
alter table attendance add column if not exists salgado integer not null default 0;
alter table attendance add column if not exists rented_weapon varchar;

alter table attendance enable row level security;
drop policy if exists "anon all attendance" on attendance;
create policy "anon all attendance" on attendance for all using (true) with check (true);


-- ============================================================================
-- TABELA: expenses (despesas do clube)
-- ============================================================================
create table if not exists expenses (
  id text primary key,
  date text not null,
  category text not null,
  description text not null,
  amount numeric(10,2) not null
);

-- Colunas adicionadas em versões posteriores
alter table expenses add column if not exists installments integer not null default 1;
alter table expenses add column if not exists total_amount numeric(10,2);

alter table expenses enable row level security;
drop policy if exists "anon all expenses" on expenses;
create policy "anon all expenses" on expenses for all using (true) with check (true);


-- ============================================================================
-- TABELA: socios
-- ============================================================================
create table if not exists socios (
  id text primary key,
  name text not null,
  patente text not null default 'Soldado',
  since text,
  active boolean not null default true
);

alter table socios enable row level security;
drop policy if exists "anon all socios" on socios;
create policy "anon all socios" on socios for all using (true) with check (true);


-- ============================================================================
-- TABELA: time_members (membros do time)
-- ============================================================================
create table if not exists time_members (
  id text primary key,
  name text not null,
  patente text not null default 'Soldado',
  since text,
  active boolean not null default true
);

alter table time_members enable row level security;
drop policy if exists "anon all time" on time_members;
create policy "anon all time" on time_members for all using (true) with check (true);


-- ============================================================================
-- TABELA: products (catálogo de produtos / itens das comandas)
-- ============================================================================
create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  active boolean not null default true
);

alter table products enable row level security;
drop policy if exists "anon all products" on products;
create policy "anon all products" on products for all using (true) with check (true);


-- ============================================================================
-- TABELA: users (login multiusuário)
-- ============================================================================
create table if not exists users (
  id text primary key,
  username text not null unique,
  password text not null,
  name text,
  role text not null default 'operador',
  active boolean not null default true
);

alter table users enable row level security;
drop policy if exists "anon all users" on users;
create policy "anon all users" on users for all using (true) with check (true);

-- Nota: na primeira carga o app cria automaticamente o usuário admin
-- a partir das credenciais salvas em settings.
