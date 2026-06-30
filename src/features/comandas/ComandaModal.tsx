import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { lineItems } from '../../lib/calc';
import { brl, fmtDate } from '../../lib/format';
import type { AttendanceRecord } from '../../types';

interface Props { open: boolean; label: string; records: AttendanceRecord[]; onClose: () => void; }

export function ComandaModal({ open, label, records, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const products = useStore((s) => s.products);
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const totalGeral = sorted.reduce((s, p) => s + lineItems(p, settings, products).total, 0);
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
      table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#e8e8e8}tbody tr:nth-child(even){background:#f9f9f9}
      .tc{text-align:center}.tr{text-align:right}
      .total{margin:20px 0;text-align:right;border-top:2px solid #333;padding-top:15px;font-weight:bold;font-size:16px}
      .footer{margin-top:30px;text-align:center;font-size:11px;color:#666}
      </style></head><body>${node.innerHTML}<script>window.print();window.onafterprint=()=>window.close();</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Modal open={open} title={`Comanda · ${label}`} onClose={onClose} size="large">
      <div id="comanda-print-area" className="rounded-xl bg-white p-6 text-slate-800">
        <div className="invoice-header mb-5 flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div className="invoice-title">
            <h2 className="font-highlight text-2xl font-bold">TOCA DO LOBO</h2>
            <p className="text-xs text-slate-500">Clube de Airsoft</p>
          </div>
          <div className="invoice-info text-right text-sm font-bold">
            <div>COMANDA</div>
            <div>{label}</div>
          </div>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-200 p-2">Jogador</th>
              <th className="border border-slate-200 p-2">Data</th>
              <th className="border border-slate-200 p-2">Armamento</th>
              <th className="border border-slate-200 p-2 tc text-center">Carreg.</th>
              <th className="border border-slate-200 p-2 tc text-center">Consumo</th>
              <th className="border border-slate-200 p-2 tr text-right">Arm.</th>
              <th className="border border-slate-200 p-2 tr text-right">Carreg.</th>
              <th className="border border-slate-200 p-2 tr text-right">Consumo</th>
              <th className="border border-slate-200 p-2 tr text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const li = lineItems(p, settings, products);
              const arma = p.isTeam ? 'Membro do Time' : (p.hasWeapon ? 'Arma Própria' : 'Arma Alugada');
              const consumptionQty = (p.cerveja || 0) + (p.agua || 0) + (p.refrigerante || 0) + (p.salgado || 0) || (p.drinks || 0);

              const breakdownParts: string[] = [];
              if (p.cerveja && p.cerveja > 0) breakdownParts.push(`Cerveja: ${p.cerveja}`);
              if (p.agua && p.agua > 0) breakdownParts.push(`Água: ${p.agua}`);
              if (p.refrigerante && p.refrigerante > 0) breakdownParts.push(`Refri: ${p.refrigerante}`);
              if (p.salgado && p.salgado > 0) breakdownParts.push(`Salgado: ${p.salgado}`);
              if (breakdownParts.length === 0 && p.drinks && p.drinks > 0) breakdownParts.push(`Bebidas: ${p.drinks}`);
              const breakdown = breakdownParts.join(' · ');

              return (
                <tr key={p.id} className="even:bg-slate-50">
                  <td className="border border-slate-200 p-2">
                    <div className="font-semibold">{p.name}</div>
                    {breakdown && <div className="text-[10px] text-slate-500 mt-0.5">{breakdown}</div>}
                  </td>
                  <td className="border border-slate-200 p-2">{fmtDate(p.date)}</td>
                  <td className="border border-slate-200 p-2">{arma}</td>
                  <td className="border border-slate-200 p-2 tc text-center">{p.magazines || 0}</td>
                  <td className="border border-slate-200 p-2 tc text-center">{consumptionQty}</td>
                  <td className="border border-slate-200 p-2 tr text-right">{brl(li.field)}</td>
                  <td className="border border-slate-200 p-2 tr text-right">{brl(li.mags)}</td>
                  <td className="border border-slate-200 p-2 tr text-right">{brl(li.drinks)}</td>
                  <td className="border border-slate-200 p-2 tr text-right font-bold">{brl(li.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="total mt-5 border-t-2 border-slate-800 pt-3 text-right text-base font-bold">
          TOTAL GERAL: {brl(totalGeral)}
        </div>
        <div className="footer mt-6 text-center text-[11px] text-slate-500">
          <p>Emitido em {now.toLocaleDateString('pt-BR')} às {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          <p>Obrigado pela visita! 🐺</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button onClick={print}><Printer size={16} /> Imprimir</Button>
      </div>
    </Modal>
  );
}
