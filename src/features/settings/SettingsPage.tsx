import { useState } from 'react';
import { Save, Plus, Trash2, Pencil, DollarSign, Smartphone, Users as UsersIcon, Package, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { brl } from '../../lib/format';
import { normalizePixKey, inferPixKeyType, type PixKeyType } from '../../lib/pix';
import type { AuthUser, User, UserRole } from '../../types';

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

const PIX_TYPE_LABELS: Record<PixKeyType, string> = {
  telefone: 'Telefone', email: 'E-mail', cpf: 'CPF', cnpj: 'CNPJ', aleatoria: 'Aleatória',
};
const PIX_PLACEHOLDERS: Record<PixKeyType, string> = {
  telefone: '11999998888 (sem o +55)', email: 'clube@email.com',
  cpf: '000.000.000-00', cnpj: '00.000.000/0000-00', aleatoria: 'chave aleatória (UUID)',
};

type Tab = 'geral' | 'pagamento' | 'usuarios' | 'produtos';
const TABS: { id: Tab; label: string; icon: typeof DollarSign }[] = [
  { id: 'geral', label: 'Geral', icon: DollarSign },
  { id: 'pagamento', label: 'Pagamento', icon: Smartphone },
  { id: 'usuarios', label: 'Usuários', icon: UsersIcon },
  { id: 'produtos', label: 'Produtos', icon: Package },
];

export function SettingsPage({ currentUser }: { currentUser: AuthUser | null }) {
  const [tab, setTab] = useState<Tab>('geral');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-secondary text-white shadow-sm' : 'text-surface-muted hover:bg-canvas hover:text-surface-fg'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'geral' && <PricesSection />}
      {tab === 'pagamento' && <PixSection />}
      {tab === 'usuarios' && <UsersSection currentUser={currentUser} />}
      {tab === 'produtos' && <ProductsSection />}
    </div>
  );
}

/* ----------------------------------------------------------------- Preços */

function PricesSection() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const { toast } = useToast();

  const [prices, setPrices] = useState({
    weaponRental: String(settings.weaponRental),
    fieldFeeOwn: String(settings.fieldFeeOwn),
    magazinePrice: String(settings.magazinePrice),
    drinkPrice: String(settings.drinkPrice),
    teamDrinkPrice: String(settings.teamDrinkPrice),
  });

  const save = () => {
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

  const field = (key: keyof typeof prices, label: string) => (
    <div>
      <label htmlFor={`cfg-${key}`} className={labelCls}>{label}</label>
      <input id={`cfg-${key}`} type="number" min="0" step="0.01" className={inputCls}
        value={prices[key]} onChange={(e) => setPrices((p) => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Card className="flex flex-col gap-4 p-5">
      <SectionHeader icon={DollarSign} title="Tabela de Preços" subtitle="Valores usados no cálculo das comandas." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {field('weaponRental', 'Aluguel de Arma (R$)')}
        {field('fieldFeeOwn', 'Taxa do Campo (R$)')}
        {field('magazinePrice', 'Recarga de Carregador (R$)')}
        {field('drinkPrice', 'Bebida (R$)')}
        {field('teamDrinkPrice', 'Bebida — Time (R$)')}
      </div>
      <Button className="self-start" onClick={save}><Save size={16} /> Salvar Preços</Button>
    </Card>
  );
}

/* --------------------------------------------------------------- Pagamento */

function PixSection() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const { toast } = useToast();

  const [pixKey, setPixKey] = useState(settings.pixKey ?? '');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(() => inferPixKeyType(settings.pixKey ?? ''));
  const [pixCity, setPixCity] = useState(settings.pixCity ?? '');

  const save = () => {
    const normalized = normalizePixKey(pixKey, pixKeyType);
    updateSettings({ pixKey: normalized, pixCity: pixCity.trim() });
    setPixKey(normalized);
    toast('PIX salvo!');
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <SectionHeader icon={Smartphone} title="Configuração do PIX"
        subtitle="Usado para gerar o QR Code de pagamento no fechamento da comanda." />
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
      <Button className="self-start" onClick={save}><Save size={16} /> Salvar PIX</Button>
    </Card>
  );
}

/* ---------------------------------------------------------------- Usuários */

const ROLE_LABELS: Record<UserRole, string> = { admin: 'Admin', operador: 'Operador' };

function UsersSection({ currentUser }: { currentUser: AuthUser | null }) {
  const users = useStore((s) => s.users);
  const addUser = useStore((s) => s.addUser);
  const updateUser = useStore((s) => s.updateUser);
  const deleteUser = useStore((s) => s.deleteUser);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operador');
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeAdmins = users.filter((u) => u.active && u.role === 'admin').length;

  const add = () => {
    const u = username.trim();
    if (!u) { toast('Informe o nome de usuário!', 'error'); return; }
    if (!password) { toast('Defina uma senha!', 'error'); return; }
    if (users.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
      toast('Já existe um usuário com esse login!', 'error'); return;
    }
    addUser({ username: u, password, name: name.trim() || undefined, role, active: true });
    setName(''); setUsername(''); setPassword(''); setRole('operador');
    toast('Usuário criado!');
  };

  const confirmDelete = () => {
    if (deleteId) { deleteUser(deleteId); toast('Usuário excluído.'); }
    setDeleteId(null);
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <SectionHeader icon={UsersIcon} title="Usuários"
        subtitle="Quem pode acessar o sistema. Admin gerencia tudo; Operador não vê as Configurações." />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-canvas p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div>
          <label htmlFor="cfg-u-name" className={labelCls}>Nome (opcional)</label>
          <input id="cfg-u-name" type="text" className={inputCls} autoComplete="off" placeholder="Ex.: João"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cfg-u-login" className={labelCls}>Usuário</label>
          <input id="cfg-u-login" type="text" className={inputCls} autoComplete="off" placeholder="login"
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cfg-u-pass" className={labelCls}>Senha</label>
          <input id="cfg-u-pass" type="password" className={inputCls} autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cfg-u-role" className={labelCls}>Papel</label>
          <select id="cfg-u-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button onClick={add}><Plus size={16} /> Adicionar</Button>
      </div>

      {users.length === 0 ? (
        <p className="rounded-xl border border-line bg-canvas px-4 py-6 text-center text-sm text-surface-muted">
          Nenhum usuário cadastrado ainda.
        </p>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {users.map((u) => {
            const isSelf = currentUser?.id === u.id;
            return (
              <div key={u.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${u.active ? '' : 'opacity-50'}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-surface-fg">{u.name?.trim() || u.username}</span>
                    {isSelf && <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">você</span>}
                  </div>
                  <div className="text-xs text-surface-muted">@{u.username}</div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  u.role === 'admin' ? 'bg-secondary/10 text-secondary' : 'bg-canvas text-surface-muted'}`}>
                  {u.role === 'admin' && <ShieldCheck size={12} />}{ROLE_LABELS[u.role]}
                </span>
                {!u.active && <span className="rounded bg-alert-50 px-2 py-0.5 text-[10px] font-semibold text-alert-900">INATIVO</span>}
                <Button size="sm" variant="outline" aria-label={`Editar ${u.username}`} onClick={() => setEditing(u)}>
                  <Pencil size={14} /> Editar
                </Button>
                <Button size="sm" variant="outline" disabled={isSelf || (u.active && u.role === 'admin' && activeAdmins <= 1)}
                  onClick={() => updateUser(u.id, { active: !u.active })}>
                  {u.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="outline" aria-label={`Excluir ${u.username}`}
                  disabled={isSelf || (u.role === 'admin' && activeAdmins <= 1)}
                  onClick={() => setDeleteId(u.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <EditUserModal user={editing} isLastAdmin={!!editing && editing.role === 'admin' && activeAdmins <= 1}
        onClose={() => setEditing(null)}
        onSave={(patch) => { if (editing) { updateUser(editing.id, patch); toast('Usuário atualizado!'); } setEditing(null); }} />

      <ConfirmDialog open={deleteId !== null} message="Excluir este usuário? Ele perderá o acesso ao sistema."
        onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
    </Card>
  );
}

function EditUserModal({ user, isLastAdmin, onClose, onSave }: {
  user: User | null;
  isLastAdmin: boolean;
  onClose: () => void;
  onSave: (patch: Partial<User>) => void;
}) {
  if (!user) return null;
  return (
    <Modal open title={`Editar — ${user.username}`} onClose={onClose}>
      {/* key={user.id} remonta o form e reinicializa os campos a cada usuário aberto */}
      <EditUserForm key={user.id} user={user} isLastAdmin={isLastAdmin} onCancel={onClose} onSave={onSave} />
    </Modal>
  );
}

function EditUserForm({ user, isLastAdmin, onCancel, onSave }: {
  user: User; isLastAdmin: boolean;
  onCancel: () => void; onSave: (patch: Partial<User>) => void;
}) {
  const [name, setName] = useState(user.name ?? '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [newPass, setNewPass] = useState('');

  const save = () => {
    const patch: Partial<User> = { name: name.trim() || undefined, role };
    if (newPass) patch.password = newPass;
    onSave(patch);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="edit-u-name" className={labelCls}>Nome</label>
        <input id="edit-u-name" type="text" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="edit-u-role" className={labelCls}>Papel</label>
        <select id="edit-u-role" className={inputCls} value={role} disabled={isLastAdmin}
          onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
        {isLastAdmin && <p className="mt-1 text-xs text-surface-muted">Não é possível rebaixar o último admin ativo.</p>}
      </div>
      <div>
        <label htmlFor="edit-u-pass" className={labelCls}>Nova senha</label>
        <input id="edit-u-pass" type="password" className={inputCls} autoComplete="new-password"
          placeholder="Deixe em branco para manter" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={save}><Save size={16} /> Salvar</Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Produtos */

function ProductsSection() {
  const products = useStore((s) => s.products);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const { toast } = useToast();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const add = () => {
    const name = productName.trim();
    const price = parseFloat(productPrice);
    if (!name) { toast('Informe o nome do produto!', 'error'); return; }
    if (isNaN(price) || price < 0) { toast('Preço inválido!', 'error'); return; }
    addProduct({ name, price, active: true });
    setProductName(''); setProductPrice('');
    toast('Produto adicionado!');
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <SectionHeader icon={Package} title="Produtos"
        subtitle="Catálogo de itens avulsos que podem ser lançados nas comandas." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="cfg-product-name" className={labelCls}>Nome</label>
          <input id="cfg-product-name" type="text" className={inputCls} autoComplete="off"
            placeholder="Ex.: Água, Salgado..." value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        </div>
        <div className="sm:w-40">
          <label htmlFor="cfg-product-price" className={labelCls}>Preço (R$)</label>
          <input id="cfg-product-price" type="number" min="0" step="0.01" className={inputCls}
            placeholder="0,00" value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        </div>
        <Button className="sm:self-end" onClick={add}><Plus size={16} /> Adicionar</Button>
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
  );
}

/* ------------------------------------------------------------------ Shared */

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof DollarSign; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-highlight text-base font-bold text-surface-fg">{title}</h3>
        <p className="text-xs text-surface-muted">{subtitle}</p>
      </div>
    </div>
  );
}
