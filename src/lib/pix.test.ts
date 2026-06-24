import { describe, it, expect } from 'vitest';
import { buildPixPayload, crc16, normalizePixKey, inferPixKeyType } from './pix';

describe('pix BR Code', () => {
  const base = { key: 'toca@lobo.com', merchantName: 'TOCA DO LOBO', city: 'SAO PAULO', amount: 65 };

  it('começa com o payload format (000201)', () => {
    expect(buildPixPayload(base).startsWith('000201')).toBe(true);
  });
  it('inclui a chave PIX e o GUI', () => {
    const p = buildPixPayload(base);
    expect(p).toContain('br.gov.bcb.pix');
    expect(p).toContain('toca@lobo.com');
  });
  it('inclui moeda BRL (5303986) e o valor formatado (5405 65.00)', () => {
    const p = buildPixPayload(base);
    expect(p).toContain('5303986');
    expect(p).toContain('540565.00');
  });
  it('termina com CRC16 de 4 hex e o CRC confere', () => {
    const p = buildPixPayload(base);
    const body = p.slice(0, -4);
    const crc = p.slice(-4);
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
    expect(crc16(body)).toBe(crc);
  });
  it('sem valor: não inclui o campo 54', () => {
    const p = buildPixPayload({ ...base, amount: 0 });
    expect(p).not.toContain('5405');
  });
});

describe('normalizePixKey', () => {
  it('telefone: adiciona +55 quando o usuário digita só o número', () => {
    expect(normalizePixKey('11999998888', 'telefone')).toBe('+5511999998888');
  });
  it('telefone: remove formatação ((), -, espaços) e adiciona +55', () => {
    expect(normalizePixKey('(11) 99999-8888', 'telefone')).toBe('+5511999998888');
  });
  it('telefone: não duplica o +55 se já vier com DDI', () => {
    expect(normalizePixKey('+5511999998888', 'telefone')).toBe('+5511999998888');
    expect(normalizePixKey('5511999998888', 'telefone')).toBe('+5511999998888');
  });
  it('telefone: preserva DDD 55 (Santa Maria) sem removê-lo como DDI', () => {
    expect(normalizePixKey('55999998888', 'telefone')).toBe('+5555999998888');
  });
  it('email: apenas minúsculas e trim', () => {
    expect(normalizePixKey('  TOCA@Lobo.COM ', 'email')).toBe('toca@lobo.com');
  });
  it('cpf/cnpj: mantém só os dígitos', () => {
    expect(normalizePixKey('123.456.789-09', 'cpf')).toBe('12345678909');
    expect(normalizePixKey('12.345.678/0001-95', 'cnpj')).toBe('12345678000195');
  });
  it('aleatória: mantém a chave como está (trim)', () => {
    const evp = '123e4567-e89b-12d3-a456-426614174000';
    expect(normalizePixKey(` ${evp} `, 'aleatoria')).toBe(evp);
  });
});

describe('inferPixKeyType', () => {
  it('detecta e-mail, telefone (+), aleatória e CNPJ', () => {
    expect(inferPixKeyType('toca@lobo.com')).toBe('email');
    expect(inferPixKeyType('+5511999998888')).toBe('telefone');
    expect(inferPixKeyType('123e4567-e89b-12d3-a456-426614174000')).toBe('aleatoria');
    expect(inferPixKeyType('12345678000195')).toBe('cnpj');
  });
});
