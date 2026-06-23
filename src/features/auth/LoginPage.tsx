import { useState, type FormEvent } from 'react';

export function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onLogin(user.trim(), pass)) { setError(false); return; }
    setError(true); setPass(''); setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  return (
    <div id="login-page" className="page">
      <div className="login-bg">
        <div className={`login-container${shake ? ' shake' : ''}`}>
          <div className="login-logo">
            <img src="/logo.jpg" alt="Toca do Lobo Logo" className="logo-img-login" />
            <h1>TOCA DO LOBO</h1><p>Sistema de Gestão · Airsoft</p>
          </div>
          <form className="login-form" onSubmit={submit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input type="text" id="username" autoComplete="username"
                value={user} onChange={(e) => setUser(e.target.value)} placeholder="Digite seu usuário" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input type="password" id="password" autoComplete="current-password"
                value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Digite sua senha" />
            </div>
            {error && <div className="error-msg">⚠️ Usuário ou senha incorretos</div>}
            <button type="submit" className="btn-login">ENTRAR</button>
          </form>
        </div>
      </div>
    </div>
  );
}
