import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { lineItems } from '../../lib/calc';
import { brl, fmtDate } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

interface Props { open: boolean; label: string; records: AttendanceRecord[]; onClose: () => void; }

export function ComandaModal({ open, label, records, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const totalGeral = sorted.reduce((s, p) => s + lineItems(p, settings).total, 0);
  const now = new Date();

  const print = () => {
    const node = document.getElementById('comanda-print-area');
    if (!node) return;
    const w = window.open('', '', 'width=800,height=600');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
      <title>Comanda - Toca do Lobo</title><style>
      *{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#333}
      .invoice-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
      .invoice-title h2{font-size:24px}.invoice-info{text-align:right;font-weight:bold}
      .invoice-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px}
      .invoice-table th,.invoice-table td{border:1px solid #ddd;padding:8px;text-align:left}
      .invoice-table th{background:#e8e8e8}.invoice-table tbody tr:nth-child(even){background:#f9f9f9}
      .text-center{text-align:center}.text-right{text-align:right}
      .invoice-total{margin:20px 0;text-align:right;border-top:2px solid #333;padding-top:15px;font-weight:bold}
      .invoice-footer{margin-top:30px;text-align:center;font-size:11px;color:#666}
      </style></head><body>${node.innerHTML}<script>window.print();window.onafterprint=()=>window.close();</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Modal open={open} title={`📋 Comanda – ${label}`} onClose={onClose} size="large">
      <div id="comanda-print-area" className="comanda-print-area">
        <div className="comanda-invoice">
          <div className="invoice-header">
            <div className="invoice-title"><h2>TOCA DO LOBO</h2><p>Campo de Airsoft</p></div>
            <div className="invoice-info"><div>📋 <strong>COMANDA</strong></div><div>🎯 {label}</div></div>
          </div>
          <table className="invoice-table">
            <thead><tr>
              <th>Jogador</th><th>Data</th><th>Armamento</th><th>Carregadores</th><th>Bebidas</th>
              <th>Arm.</th><th>Carreg.</th><th>Bebida</th><th>Total</th>
            </tr></thead>
            <tbody>
              {sorted.map((p) => {
                const li = lineItems(p, settings);
                const arma = p.isTeam ? '🪖 Membro do Time' : (p.hasWeapon ? '🪖 Arma Própria' : '🔫 Arma Alugada');
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{fmtDate(p.date)}</td><td>{arma}</td>
                    <td className="text-center">{p.magazines || 0}</td>
                    <td className="text-center">{p.drinks || 0}</td>
                    <td className="text-right">{brl(li.field)}</td>
                    <td className="text-right">{brl(li.mags)}</td>
                    <td className="text-right">{brl(li.drinks)}</td>
                    <td className="text-right"><strong>{brl(li.total)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="invoice-total">
            <div className="invoice-total-row">
              <span className="invoice-total-label">TOTAL GERAL:</span>
              <span className="invoice-total-value">{brl(totalGeral)}</span>
            </div>
          </div>
          <div className="invoice-footer">
            <p>Emitido em: {now.toLocaleDateString('pt-BR')} às {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p>Obrigado pela sua visita! 🐺</p>
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Fechar</button>
        <button type="button" className="btn-primary" onClick={print}>🖨️ Imprimir</button>
      </div>
    </Modal>
  );
}
