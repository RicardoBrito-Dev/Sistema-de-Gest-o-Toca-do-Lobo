import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

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
    toast('Preços salvos! ✅');
  };

  const saveCredentials = () => {
    if (!username.trim()) { toast('Nome de usuário inválido!', 'error'); return; }
    updateSettings({ username: username.trim(), ...(password ? { password } : {}) });
    setPassword('');
    toast('Credenciais atualizadas! ✅');
  };

  const priceField = (key: keyof typeof prices, label: string) => (
    <div className="config-item">
      <label htmlFor={`cfg-${key}`}>{label}</label>
      <div className="input-money"><span>R$</span>
        <input id={`cfg-${key}`} type="number" min="0" step="0.01" value={prices[key]}
          onChange={(e) => setPrices((p) => ({ ...p, [key]: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <section className="tab-content active">
      <div className="config-cols">
        <div className="section-card">
          <h3 className="section-title">💲 Tabela de Preços</h3>
          <div className="config-grid">
            {priceField('weaponRental', '🔫 Aluguel de Arma (sem arma)')}
            {priceField('fieldFeeOwn', '🪖 Taxa do Campo (com arma própria)')}
            {priceField('magazinePrice', '🎯 Recarga de Carregador')}
            {priceField('drinkPrice', '🥤 Bebida (por unidade)')}
            {priceField('teamDrinkPrice', '🥤 Bebida (Membro do Time)')}
          </div>
          <button className="btn-primary" onClick={savePrices}>💾 Salvar Preços</button>
        </div>

        <div className="section-card">
          <h3 className="section-title">🔐 Credenciais de Acesso</h3>
          <div className="config-grid">
            <div className="config-item">
              <label htmlFor="cfg-username">Usuário</label>
              <input id="cfg-username" type="text" className="config-input" autoComplete="off"
                value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="config-item">
              <label htmlFor="cfg-password">Nova Senha</label>
              <input id="cfg-password" type="password" className="config-input" autoComplete="new-password"
                placeholder="Deixe em branco para manter" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" onClick={saveCredentials}>💾 Salvar Credenciais</button>
        </div>
      </div>
    </section>
  );
}
