import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ msg: string; type: ToastType } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string, type: ToastType = 'success') => {
    setState({ msg, type });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState(null), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {state && (
        <div className={`toast${state.type === 'error' ? ' error' : ''}`} role="status" aria-live="polite">
          {state.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
