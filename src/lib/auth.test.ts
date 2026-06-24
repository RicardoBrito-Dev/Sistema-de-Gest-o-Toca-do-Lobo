import { describe, it, expect } from 'vitest';
import { authenticate } from './auth';
import type { User } from '../types';

const legacy = { username: 'admin', password: 'toca2026' };

const users: User[] = [
  { id: 'u1', username: 'joao', password: '1234', role: 'admin', active: true, name: 'João' },
  { id: 'u2', username: 'maria', password: 'abcd', role: 'operador', active: true },
  { id: 'u3', username: 'inativo', password: 'x', role: 'operador', active: false },
];

describe('authenticate', () => {
  it('autentica usuário ativo e retorna o papel', () => {
    expect(authenticate(users, legacy, 'joao', '1234')).toEqual({
      id: 'u1', username: 'joao', name: 'João', role: 'admin',
    });
    expect(authenticate(users, legacy, 'maria', 'abcd')?.role).toBe('operador');
  });

  it('rejeita senha errada', () => {
    expect(authenticate(users, legacy, 'joao', 'errada')).toBeNull();
  });

  it('rejeita usuário inativo', () => {
    expect(authenticate(users, legacy, 'inativo', 'x')).toBeNull();
  });

  it('ignora espaços ao redor do username', () => {
    expect(authenticate(users, legacy, '  joao  ', '1234')?.id).toBe('u1');
  });

  it('NÃO aceita credenciais legadas quando já há usuários cadastrados', () => {
    expect(authenticate(users, legacy, 'admin', 'toca2026')).toBeNull();
  });

  it('aceita credenciais legadas (bootstrap) quando não há usuários', () => {
    const r = authenticate([], legacy, 'admin', 'toca2026');
    expect(r).toEqual({ id: 'legacy-admin', username: 'admin', role: 'admin' });
  });

  it('rejeita login inexistente', () => {
    expect(authenticate(users, legacy, 'ninguem', 'nada')).toBeNull();
  });
});
