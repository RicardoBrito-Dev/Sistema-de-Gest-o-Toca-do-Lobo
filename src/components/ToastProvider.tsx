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
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg font-body ${
            state.type === 'error' ? 'bg-negative' : 'bg-secondary'
          }`}
        >
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
