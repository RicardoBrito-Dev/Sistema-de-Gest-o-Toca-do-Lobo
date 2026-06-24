import type { ReactNode } from 'react';

// Mapeia os "kinds" legados (usados pelas telas) para tons do Synvia UI.
const TONES: Record<string, string> = {
  'badge-own': 'bg-positive-50 text-positive',
  'badge-rental': 'bg-steelblue-200 text-steelblue-900',
  'badge-expense': 'bg-negative-50 text-negative-900',
  'badge-active': 'bg-positive-50 text-positive',
  'badge-warning': 'bg-alert-500 text-alert-900',
  'badge-critical': 'bg-negative-50 text-negative-900',
};

export function Badge({ kind, children }: { kind: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${TONES[kind] ?? 'bg-dark-50 text-dark-700'}`}>
      {children}
    </span>
  );
}
