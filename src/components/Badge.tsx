import type { ReactNode } from 'react';

export function Badge({ kind, children }: { kind: string; children: ReactNode }) {
  return <span className={`player-badge ${kind}`}>{children}</span>;
}
