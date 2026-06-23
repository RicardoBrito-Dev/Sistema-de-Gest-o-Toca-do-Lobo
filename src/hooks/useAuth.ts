import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

const SESSION_KEY = 'tdl_session';

export function useAuth() {
  const settings = useStore((s) => s.settings);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'ok');

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === settings.username && pass === settings.password) {
      sessionStorage.setItem(SESSION_KEY, 'ok');
      setAuthed(true);
      return true;
    }
    return false;
  }, [settings.username, settings.password]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }, []);

  return { authed, login, logout };
}
