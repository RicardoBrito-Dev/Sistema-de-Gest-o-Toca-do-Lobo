import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/Card';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

const inputCls = 'h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-surface-fg outline-none transition-colors focus:border-secondary';
const labelCls = 'mb-1 block text-sm font-medium text-surface-fg';

export function SettingsPage() {
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
  const [username, setUsername] = useState(settings.username);
  const [password, setPassword] = useState('');

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
    </div>
  );
}
