export interface PixParams {
  key: string;
  merchantName: string;
  city: string;
  amount?: number;
  txid?: string;
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
