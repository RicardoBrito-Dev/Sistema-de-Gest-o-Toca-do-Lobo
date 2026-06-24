import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary capturou:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 font-body">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-8 shadow-xl">
            <h1 className="font-highlight text-xl font-bold text-negative">Algo deu errado</h1>
            <p className="mt-2 text-sm text-surface-muted">
              A aplicação encontrou um erro inesperado. Recarregue a página; se persistir, avise o suporte.
            </p>
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-canvas p-3 text-xs text-surface-fg">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full rounded-3xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
