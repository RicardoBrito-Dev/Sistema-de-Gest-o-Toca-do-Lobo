import { describe, it, expect } from 'vitest';
import { buildPixPayload, crc16 } from './pix';

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
