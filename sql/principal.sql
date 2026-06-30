-- ============================================================================
-- Multiusuário — Toca do Lobo
-- Rodar no SQL Editor do Supabase. Idempotente (seguro rodar mais de uma vez).
-- ============================================================================

-- Usuários do sistema (login + papel admin/operador)
create table if not exists users (
  id text primary key,
  username text not null unique,
  password text not null,
  name text,
  role text not null default 'operador',
  active boolean not null default true
);

-- RLS: acesso via chave anon (espelha o padrão das outras tabelas do projeto)
alter table users enable row level security;
drop policy if exists "anon all users" on users;
create policy "anon all users" on users for all using (true) with check (true);

-- Observação: na primeira carga após criar a tabela, o app semeia automaticamente
-- um admin a partir das credenciais atuais de `settings` (username/password).
-- Enquanto a tabela não existir ou estiver vazia, o login legado continua válido.