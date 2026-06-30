import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { memberDiscountPercent, unitPrice } from '../../lib/calc';
import { brl } from '../../lib/format';

export function AddItemModal({ open, playerId, onClose }: { open: boolean; playerId: string | null; onClose: () => void }) {
  const allProducts = useStore((s) => s.products);
  const products = useMemo(() => allProducts.filter((p) => p.active), [allProducts]);
  const player = useStore((s) => s.attendance.find((p) => p.id === playerId) ?? null);
  const settings = useStore((s) => s.settings);
  const addExtra = useStore((s) => s.addExtra);
  const { toast } = useToast();
  const [sel, setSel] = useState<string>('');
  const [qty, setQty] = useState(1);
  const product = products.find((p) => p.id === sel);
  const discount = player ? memberDiscountPercent(player, settings) : 0;
  const unit = product && player ? unitPrice(product.price, player, settings) : 0;
  const safeQty = Math.max(1, qty);

  const confirm = () => {
    if (!playerId || !product || !player) { toast('Selecione um produto!', 'error'); return; }
    const price = unitPrice(product.price, player, settings);
    addExtra(playerId, { name: product.name, price, qty: safeQty });
    toast(`${product.name} adicionado!`);
    setSel(''); setQty(1); onClose();
  };

  const close = () => { setSel(''); setQty(1); onClose(); };

  return (
    <Modal open={open} title="Adicionar item" onClose={close}>
      <div className="flex flex-col gap-4">
        {products.length === 0 ? (
          <p className="rounded-xl border border-line bg-canvas px-4 py-6 text-center text-sm text-surface-muted">
            Nenhum produto ativo. Cadastre produtos em Configurações.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="add-item-product" className="mb-1 block text-sm font-medium text-surface-fg">Produto</label>
              <select id="add-item-product" value={sel} onChange={(e) => setSel(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary">
                <option value="">Selecione um produto…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {brl(player ? unitPrice(p.price, player, settings) : p.price)}
                    {discount > 0 && player ? ` (${discount}% desc.)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-item-qty" className="mb-1 block text-sm font-medium text-surface-fg">Quantidade</label>
              <input id="add-item-qty" type="number" min={1} value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none focus:border-secondary" />
            </div>
            {product && (
              <div className="rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-surface-muted">
                {discount > 0 && (
                  <div className="mb-1 flex justify-between">
                    <span>Preço cadastrado</span>
                    <span className="tabular-nums line-through opacity-60">{brl(product.price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal{discount > 0 ? ` (${discount}% desc.)` : ''}</span>
                  <strong className="text-secondary tabular-nums">{brl(unit * safeQty)}</strong>
                </div>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={confirm} disabled={products.length === 0}>Adicionar</Button>
        </div>
      </div>
    </Modal>
  );
}
