# Toca do Lobo — Sistema de Gestão

App de gestão para campo de Airsoft: controle de **presenças, comandas, financeiro, sócios e time**. Front-end em React com **banco de dados Supabase** (Postgres) e cache local no navegador para uso offline.

## Stack

- **React + TypeScript + Vite**
- **Supabase** (Postgres) — backend/banco de dados
- **Zustand** (estado global + cache offline no `localStorage` via `persist`)
- **React Router** (uma rota por aba)
- **Tailwind CSS** + componentes do **Synvia UI** (`@synvia-dev/ui`, copiados localmente) — tema claro/escuro
- **Vitest** (testes das regras puras)

## Pré-requisitos

- **Node.js 18+** (testado com Node 24)
- **npm**

## Rodar localmente em modo dev

```bash
# 1. instalar dependências
npm install

# 2. subir o servidor de desenvolvimento (Vite + HMR)
npm run dev
```

Acesse **http://localhost:5173**.

> A conexão com o Supabase já vem configurada — as **chaves públicas** (anon key) estão embutidas em `src/lib/supabase.ts` (são seguras para o cliente). Não é necessário criar `.env` para rodar. O `.env.example` serve apenas como referência caso você queira externalizar as chaves no futuro.

**Login padrão:** usuário `admin` · senha `toca2026` (alteráveis em **Configurações → Credenciais**; ficam na tabela `settings` do banco).

## Banco de dados (Supabase)

- Ao abrir, o app conecta no Supabase e carrega os dados (tela "Conectando ao banco…").
- Tabelas: **`attendance`, `expenses`, `socios`, `time_members`, `settings`**.
- Cada operação (criar/editar/excluir) é refletida no banco e no estado local.
- **Falha de conexão:** aparece uma tela com **Tentar novamente** ou **Modo offline** (usa o cache local).

## Tema claro/escuro

Botão **Sol/Lua** no header (ou na tela de login). A preferência é salva no navegador (`localStorage`).

## Responsividade

Layout adaptável: tabelas viram **cards** no mobile/tablet; sidebar no desktop e barra inferior no mobile.

## Scripts disponíveis

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR (porta 5173) |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (sem emitir) |
| `npm run test` | Testes unitários (Vitest) |

## Dados e cache

O **Supabase é a fonte de verdade**. O `localStorage` (chave `tdl_store`) guarda um **cache** do último estado, usado como fallback offline. Há também migração automática de chaves antigas (`tdl_attendance`, etc.) no primeiro carregamento, caso existam.
