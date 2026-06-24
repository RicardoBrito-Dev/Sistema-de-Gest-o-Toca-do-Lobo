import { useEffect, useState } from 'react';

const KEY = 'tdl_theme';
export type Theme = 'light' | 'dark';

function getInitial(): Theme {
  const saved = localStorage.getItem(KEY);
  return saved === 'dark' || saved === 'light' ? saved : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle, setTheme };
}
