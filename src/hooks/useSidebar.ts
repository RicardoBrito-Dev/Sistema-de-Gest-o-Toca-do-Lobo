import { useEffect, useState } from 'react';

const KEY = 'tdl_sidebar';

export function useSidebar() {
  // Aberta por padrão; respeita a escolha do usuário quando ele recolhe ('collapsed').
  const [expanded, setExpanded] = useState(() => localStorage.getItem(KEY) !== 'collapsed');

  useEffect(() => {
    localStorage.setItem(KEY, expanded ? 'expanded' : 'collapsed');
  }, [expanded]);

  const toggle = () => setExpanded((e) => !e);
  return { expanded, toggle };
}
