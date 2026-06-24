export interface PixParams {
  key: string;
  merchantName: string;
  city: string;
  amount?: number;
  txid?: string;
}

export type PixKeyType = 'telefone' | 'email' | 'cpf' | 'cnpj' | 'aleatoria';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Deduz o tipo a partir de uma chave já salva (para pré-selecionar no formulário).
export function inferPixKeyType(key: string): PixKeyType {
  const k = (key || '').trim();
  if (k.includes('@')) return 'email';
  if (UUID_RE.test(k)) return 'aleatoria';
  if (k.startsWith('+')) return 'telefone';
  const digits = k.replace(/\D/g, '');
  if (digits.length === 14) return 'cnpj';
  if (digits.length === 11) return 'cpf';
  return 'telefone';
}

// Normaliza a chave para o formato que o PIX exige, conforme o tipo escolhido.
// Telefone → +55 + DDD + número (o usuário não precisa digitar o +55).
export function normalizePixKey(key: string, type: PixKeyType): string {
  const k = (key || '').trim();
  switch (type) {
    case 'email':
      return k.toLowerCase();
    case 'aleatoria':
      return k;
    case 'cpf':
    case 'cnpj':
      return k.replace(/\D/g, '');
    case 'telefone': {
      let digits = k.replace(/\D/g, '');
      // Remove o DDI 55 se o usuário já o incluiu (guard de tamanho protege DDD 55).
      if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
      return digits ? '+55' + digits : '';
    }
  }
}

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

// Remove acentos e limita tamanho (campos PIX são ASCII).
function clean(s: string, max: number): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove marcas diacríticas combinantes
    .replace(/[^\x20-\x7E]/g, '')
    .toUpperCase()
    .slice(0, max);
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload({ key, merchantName, city, amount, txid = '***' }: PixParams): string {
  const mai = tlv('00', 'br.gov.bcb.pix') + tlv('01', key);
  let payload =
    tlv('00', '01') +
    tlv('26', mai) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount && amount > 0 ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', clean(merchantName, 25)) +
    tlv('60', clean(city || 'BRASIL', 15)) +
    tlv('62', tlv('05', txid));
  payload += '6304';
  return payload + crc16(payload);
}
