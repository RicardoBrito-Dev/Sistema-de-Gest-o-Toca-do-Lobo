-- ============================================================================
-- Comandas v2 — Toca do Lobo
-- Rodar no SQL Editor do Supabase. Idempotente (seguro rodar mais de uma vez).
-- ============================================================================

-- Forma de pagamento + itens avulsos (extras) na comanda
alter table attendance add column if not exists payment_method text;
alter table attendance add column if not exists extras jsonb default '[]'::jsonb;

-- Configuração do PIX (na tabela settings)
alter table settings add column if not exists pix_key text;
alter table settings add column if not exists pix_city text;

-- Catálogo de produtos (itens avulsos lançáveis nas comandas)
create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  active boolean not null default true
);

-- RLS: acesso via chave anon (espelha o padrão das outras tabelas do projeto)
alter table products enable row level security;
drop policy if exists "anon all products" on products;
create policy "anon all products" on products for all using (true) with check (true);
