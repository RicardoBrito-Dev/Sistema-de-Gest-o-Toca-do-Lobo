import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { brl } from '../../lib/format';
import { normalizePixKey, inferPixKeyType, type PixKeyType } from '../../lib/pix';

const PIX_TYPE_LABELS: Record<PixKeyType, string> = {
  telefone: 'Telefone',
  email: 'E-mail',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  aleatoria: 'Aleatória',
};
const PIX_PLACEHOLDERS: Record<PixKeyType, string> = {
  telefone: '11999998888 (sem o +55)',
  email: 'clube@email.com',
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  aleatoria: 'chave aleatória (UUID)',
};

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const products = useStore((s) => s.products);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const { toast } = useToast();

  const [prices, setPrices] = useState({
    weaponRental: String(settings.weaponRental),
    fieldFeeOwn: String(settings.fieldFeeOwn),
    magazinePrice: String(settings.magazinePrice),
    drinkPrice: String(settings.drinkPrice),
    teamDrinkPrice: String(settings.teamDrinkPrice),
  });
  const [username, setUsername] = useState(settings.username);
  const [password, setPassword] = useState('');
  const [pixKey, setPixKey] = useState(settings.pixKey ?? '');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(() => inferPixKeyType(settings.pixKey ?? ''));
  const [pixCity, setPixCity] = useState(settings.pixCity ?? '');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const savePrices = () => {
    const nums = {
      weaponRental: parseFloat(prices.weaponRental),
      fieldFeeOwn: parseFloat(prices.fieldFeeOwn),
      magazinePrice: parseFloat(prices.magazinePrice),
      drinkPrice: parseFloat(prices.drinkPrice),
      teamDrinkPrice: parseFloat(prices.teamDrinkPrice),
    };
    if (Object.values(nums).some((v) => isNaN(v) || v < 0)) { toast('Valores inválidos!', 'error'); return; }
    updateSettings(nums);
    toast('Preços salvos!');
  };

  const saveCredentials = () => {
    if (!username.trim()) { toast('Nome de usuário inválido!', 'error'); return; }
    updateSettings({ username: username.trim(), ...(password ? { password } : {}) });
    setPassword('');
    toast('Credenciais atualizadas!');
  };

  const savePix = () => {
    const normalized = normalizePixKey(pixKey, pixKeyType);
    updateSettings({ pixKey: normalized, pixCity: pixCity.trim() });
    setPixKey(normalized); // reflete a chave já formatada no campo
    toast('PIX salvo!');
  };

  const addProductHandler = () => {
    const name = productName.trim();
    const price = parseFloat(productPrice);
    if (!name) { toast('Informe o nome do produto!', 'error'); return; }
    if (isNaN(price) || price < 0) { toast('Preço inválido!', 'error'); return; }
    addProduct({ name, price, active: true });
    setProductName('');
    setProductPrice('');
    toast('Produto adicionado!');
  };

  const priceField = (key: keyof typeof prices, label: string) => (
    <div>
      <label htmlFor={`cfg-${key}`} className={labelCls}>{label}</label>
      <input id={`cfg-${key}`} type="number" min="0" step="0.01" className={inputCls}
        value={prices[key]} onChange={(e) => setPrices((p) => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="flex flex-col gap-4 p-5">
        <h3 className="font-highlight text-base font-bold text-surface-fg">💲 Tabela de Preços</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {priceField('weaponRental', 'Aluguel de Arma (R$)')}
          {priceField('fieldFeeOwn', 'Taxa do Campo (R$)')}
          {priceField('magazinePrice', 'Recarga de Carregador (R$)')}
          {priceField('drinkPrice', 'Bebida (R$)')}
          {priceField('teamDrinkPrice', 'Bebida — Time (R$)')}
        </div>
        <Button className="self-start" onClick={savePrices}><Save size={16} /> Salvar Preços</Button>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h3 className="font-highlight text-base font-bold text-surface-fg">🔐 Credenciais de Acesso</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cfg-user" className={labelCls}>Usuário</label>
            <input id="cfg-user" type="text" className={inputCls} autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label htmlFor="cfg-pass" className={labelCls}>Nova Senha</label>
            <input id="cfg-pass" type="password" className={inputCls} autoComplete="new-password" placeholder="Deixe em branco para manter" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <Button className="self-start" onClick={saveCredentials}><Save size={16} /> Salvar Credenciais</Button>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h3 className="font-highlight text-base font-bold text-surface-fg">📱 Configuração do PIX</h3>
        <p className="text-xs text-surface-muted">Usado para gerar o QR Code de pagamento no fechamento da comanda.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cfg-pix-type" className={labelCls}>Tipo de chave</label>
            <select id="cfg-pix-type" className={inputCls} value={pixKeyType}
              onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}>
              {(Object.keys(PIX_TYPE_LABELS) as PixKeyType[]).map((t) => (
                <option key={t} value={t}>{PIX_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cfg-pix-key" className={labelCls}>Chave PIX</label>
            <input id="cfg-pix-key" type="text" className={inputCls} autoComplete="off"
              inputMode={pixKeyType === 'telefone' || pixKeyType === 'cpf' || pixKeyType === 'cnpj' ? 'numeric' : 'text'}
              placeholder={PIX_PLACEHOLDERS[pixKeyType]} value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
            {pixKeyType === 'telefone' && (
              <p className="mt-1 text-xs text-surface-muted">Digite só o DDD + número — o <strong>+55</strong> é adicionado automaticamente.</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cfg-pix-city" className={labelCls}>Cidade (PIX)</label>
            <input id="cfg-pix-city" type="text" className={inputCls} autoComplete="off"
              placeholder="Ex.: SAO PAULO" value={pixCity} onChange={(e) => setPixCity(e.target.value)} />
            <p className="mt-1 text-xs text-surface-muted">Cidade do recebedor (exigida pelo padrão PIX). Não afeta para onde o dinheiro vai.</p>
          </div>
        </div>
        <Button className="self-start" onClick={savePix}><Save size={16} /> Salvar PIX</Button>
      </Card>

      <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
        <h3 className="font-highlight text-base font-bold text-surface-fg">🍺 Produtos</h3>
        <p className="text-xs text-surface-muted">Catálogo de itens avulsos que podem ser lançados nas comandas.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="cfg-product-name" className={labelCls}>Nome</label>
            <input id="cfg-product-name" type="text" className={inputCls} autoComplete="off"
              placeholder="Ex.: Água, Salgado..." value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addProductHandler(); }} />
          </div>
          <div className="sm:w-40">
            <label htmlFor="cfg-product-price" className={labelCls}>Preço (R$)</label>
            <input id="cfg-product-price" type="number" min="0" step="0.01" className={inputCls}
              placeholder="0,00" value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addProductHandler(); }} />
          </div>
          <Button className="sm:self-end" onClick={addProductHandler}><Plus size={16} /> Adicionar</Button>
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-line bg-canvas px-4 py-6 text-center text-sm text-surface-muted">
            Nenhum produto cadastrado.
          </p>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {products.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${p.active ? '' : 'opacity-60'}`}>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-surface-fg">{p.name}</div>
                  <div className="text-xs text-surface-muted">{brl(p.price)}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => updateProduct(p.id, { active: !p.active })}>
                  {p.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="outline" aria-label={`Excluir ${p.name}`} onClick={() => deleteProduct(p.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
