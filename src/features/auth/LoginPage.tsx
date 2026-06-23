import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onLogin(user.trim(), pass)) { setError(false); return; }
    setError(true); setPass('');
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-light px-4 font-body">
      <div className="w-full max-w-sm rounded-3xl border border-dark-50 bg-white p-8 shadow-xl">
        <div className="mb-7 flex flex-col items-center text-center">
          <img src="/logo.jpg" alt="Toca do Lobo" className="mb-4 h-20 w-20 rounded-2xl object-cover shadow-md" />
          <h1 className="font-highlight text-2xl font-bold tracking-tight text-primary">TOCA DO LOBO</h1>
          <Text className="mt-1 text-dark">Sistema de Gestão · Airsoft</Text>
        </div>

        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <TextInput.Root label="Usuário" htmlFor="username">
            <TextInput.Input id="username" autoComplete="username" placeholder="Digite seu usuário"
              value={user} onChange={(e) => setUser(e.target.value)} />
          </TextInput.Root>

          <TextInput.Root label="Senha" htmlFor="password">
            <TextInput.Input id="password" password autoComplete="current-password" placeholder="Digite sua senha"
              value={pass} onChange={(e) => setPass(e.target.value)} />
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
