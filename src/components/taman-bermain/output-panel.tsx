'use client';

import { Skeleton } from '@/components/ui/primitives';

/**
 * What the code printed — five states, not one.
 *
 * Every state reserves its own vertical space. A panel that grows when output arrives pushes the
 * page around underneath the reader's cursor, which is the layout shift the performance baseline
 * budgets against (.claude/rules/frontend.md → CLS < 0.1).
 */

export type OutputState =
  | { kind: 'idle' }
  | { kind: 'memuat-mesin' }
  | { kind: 'berjalan' }
  | { kind: 'timeout'; message: string }
  | { kind: 'crash'; message: string }
  | { kind: 'ok'; lines: string[] };

export function OutputPanel({ state }: { state: OutputState }) {
  return (
    <section className="border-border bg-surface overflow-hidden rounded-lg border">
      <header className="border-border border-b px-4 py-2">
        <h2 className="text-2xs text-faint font-medium tracking-[0.08em] uppercase">Output</h2>
      </header>

      <div className="min-h-[7.5rem] px-4 py-3">
        <Isi state={state} />
      </div>
    </section>
  );
}

function Isi({ state }: { state: OutputState }) {
  switch (state.kind) {
    case 'idle':
      return <p className="text-faint font-mono text-xs">(belum dijalankan)</p>;

    case 'memuat-mesin':
      return (
        <div role="status" className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <p className="text-2xs text-faint">Menyiapkan mesin eksekusi…</p>
        </div>
      );

    case 'berjalan':
      return (
        <p role="status" className="text-muted font-mono text-xs">
          Menjalankan…
        </p>
      );

    case 'timeout':
    case 'crash':
      return <p className="text-danger font-mono text-xs whitespace-pre-wrap">{state.message}</p>;

    case 'ok':
      if (state.lines.length === 0) {
        return (
          <p className="text-faint font-mono text-xs">Kodemu berjalan tanpa mencetak apa pun.</p>
        );
      }
      return (
        <pre className="text-text font-mono text-xs leading-[1.7] whitespace-pre-wrap">
          {state.lines.join('\n')}
        </pre>
      );
  }
}
