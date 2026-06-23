import { useState, type FormEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTheme } from '../../hooks/useTheme';

export function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onLogin(user.trim(), pass)) { setError(false); return; }
    setError(true); setPass('');
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-canvas px-4 font-body">
      <button type="button" onClick={toggle} aria-label="Alternar tema"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-surface-fg transition-colors hover:bg-dark-50">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-xl">
        <div className="mb-7 flex flex-col items-center text-center">
          <img src="/logo.jpg" alt="Toca do Lobo" className="mb-4 h-20 w-20 rounded-2xl object-cover shadow-md" />
          <h1 className="font-highlight text-2xl font-bold tracking-tight text-surface-fg">TOCA DO LOBO</h1>
          <Text className="mt-1 text-surface-muted">Sistema de Gestão · Airsoft</Text>
        </div>

        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <TextInput.Root label="Usuário" htmlFor="username" classNames={{ label: 'text-surface-fg' }}>
            <TextInput.Input id="username" autoComplete="username" placeholder="Digite seu usuário"
              className="text-surface-fg" value={user} onChange={(e) => setUser(e.target.value)} />
          </TextInput.Root>

          <TextInput.Root label="Senha" htmlFor="password" classNames={{ label: 'text-surface-fg' }}>
            <TextInput.Input id="password" password autoComplete="current-password" placeholder="Digite sua senha"
              className="text-surface-fg" value={pass} onChange={(e) => setPass(e.target.value)} />
          </TextInput.Root>

          {error && (
            <Text className="text-sm font-medium text-negative">⚠️ Usuário ou senha incorretos</Text>
          )}

          <Button type="submit" className="mt-2 w-full">ENTRAR</Button>
        </form>
      </div>
    </div>
  );
}
