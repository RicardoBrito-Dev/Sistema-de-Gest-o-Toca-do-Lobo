import type { AuthUser, User } from '../types';

interface LegacyCreds {
  username: string;
  password: string;
}

/**
 * Resolve o login contra a tabela de usuários, com fallback de bootstrap.
 *
 * 1. Procura um usuário ativo com username + senha correspondentes.
 * 2. Se ainda NÃO há usuários cadastrados (tabela vazia ou migração não rodada),
 *    aceita as credenciais legadas do `settings` como admin — assim ninguém fica
 *    trancado fora antes de criar o primeiro usuário.
 *
 * Pura e sem efeitos colaterais → testável.
 */
export function authenticate(
  users: User[],
  legacy: LegacyCreds,
  username: string,
  password: string,
): AuthUser | null {
  const u = username.trim();

  const match = users.find((x) => x.active && x.username === u && x.password === password);
  if (match) {
    return { id: match.id, username: match.username, name: match.name, role: match.role };
  }

  if (users.length === 0 && u === legacy.username && password === legacy.password) {
    return { id: 'legacy-admin', username: legacy.username, role: 'admin' };
  }

  return null;
}
