import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '../../components/Modal';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { brl } from '../../lib/format';

export function AddItemModal({ open, playerId, onClose }: { open: boolean; playerId: string | null; onClose: () => void }) {
  // Selecionar o array cru (referência estável) e derivar o filtro com useMemo.
  // Filtrar dentro do selector retorna um array novo a cada render → loop infinito no Zustand v5.
  const allProducts = useStore((s) => s.products);
  const products = useMemo(() => allProducts.filter((p) => p.active), [allProducts]);
  const addExtra = useStore((s) => s.addExtra);
  const { toast } = useToast();
  const [sel, setSel] = useState<string>('');
  const [qty, setQty] = useState(1);
  const product = products.find((p) => p.id === sel);

  const confirm = () => {
    if (!playerId || !product) { toast('Selecione um produto!', 'error'); return; }
    addExtra(playerId, { name: product.name, price: product.price, qty: Math.max(1, qty) });
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
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {brl(p.price)}</option>)}
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
                Subtotal: <strong className="text-secondary">{brl(product.price * Math.max(1, qty))}</strong>
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
