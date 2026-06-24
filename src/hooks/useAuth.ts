import { useCallback, useState } from 'react';
import { useStore } from '../store/useStore';
import { authenticate } from '../lib/auth';
import type { AuthUser } from '../types';

const SESSION_KEY = 'tdl_user';

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const users = useStore((s) => s.users);
  const settings = useStore((s) => s.settings);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadSession);

  const login = useCallback((username: string, password: string): boolean => {
    const user = authenticate(
      users,
      { username: settings.username, password: settings.password },
      username,
      password,
    );
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users, settings.username, settings.password]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return { authed: currentUser !== null, currentUser, login, logout };
}
